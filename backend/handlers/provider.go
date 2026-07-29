package handlers

import (
	"context"
	"net/http"
	"regexp"
	"strings"
	"time"

	"hulu-service-backend/config"
	"hulu-service-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AvailabilityInput struct {
	IsAvailable bool `json:"isAvailable"`
}

// SetAvailability lets a provider flip their "available to work" / "not available"
// status, LinkedIn open-to-work style. No approval needed, instant toggle.
func SetAvailability(c *gin.Context) {
	userIDStr, _ := c.Get("userId")
	userID, err := primitive.ObjectIDFromHex(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user"})
		return
	}

	var input AvailabilityInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = config.DB.Collection("users").UpdateOne(ctx,
		bson.M{"_id": userID},
		bson.M{"$set": bson.M{"is_available": input.IsAvailable, "updated_at": time.Now()}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update availability"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"isAvailable": input.IsAvailable})
}

// ProviderResponse is a provider record with its category IDs resolved into
// full category objects (name/icon), so clients can render the provider's
// work type without a separate lookup.
type ProviderResponse struct {
	models.User `bson:",inline"`
	Categories  []models.Category `json:"categories"`
}

// ListProviders returns providers for customers to browse. Phone numbers are
// included directly (no masking) so customers can call right away, and no
// booking/acceptance step is required to see contact info.
func ListProviders(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"role": models.RoleProvider}

	if categoryID := c.Query("categoryId"); categoryID != "" {
		if id, err := primitive.ObjectIDFromHex(categoryID); err == nil {
			filter["category_ids"] = id
		}
	}
	if area := c.Query("area"); area != "" {
		filter["work_areas"] = area
	}
	if c.Query("availableOnly") == "true" {
		filter["is_available"] = true
	}

	// Free-text search across provider name and work type (category name),
	// e.g. searching "plumb" matches both a provider named "Plumb..." and
	// anyone registered under the "Plumber" category.
	if q := strings.TrimSpace(c.Query("q")); q != "" {
		nameRegex := bson.M{"$regex": primitive.Regex{Pattern: regexp.QuoteMeta(q), Options: "i"}}

		orConds := []bson.M{
			{"full_name": nameRegex},
		}

		catCursor, err := config.DB.Collection("categories").Find(ctx, bson.M{
			"$or": []bson.M{
				{"name_en": nameRegex},
				{"name_am": nameRegex},
			},
		})
		if err == nil {
			defer catCursor.Close(ctx)
			var matchedCats []models.Category
			if err := catCursor.All(ctx, &matchedCats); err == nil && len(matchedCats) > 0 {
				matchedIDs := make([]primitive.ObjectID, 0, len(matchedCats))
				for _, cat := range matchedCats {
					matchedIDs = append(matchedIDs, cat.ID)
				}
				orConds = append(orConds, bson.M{"category_ids": bson.M{"$in": matchedIDs}})
			}
		}

		filter["$or"] = orConds
	}

	cursor, err := config.DB.Collection("users").Find(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load providers"})
		return
	}
	defer cursor.Close(ctx)

	providers := []models.User{}
	if err := cursor.All(ctx, &providers); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not read providers"})
		return
	}

	// Resolve category IDs -> category objects (name/icon) so the app can
	// show the provider's work type without another round trip.
	catCursor, err := config.DB.Collection("categories").Find(ctx, bson.M{})
	categoryByID := map[primitive.ObjectID]models.Category{}
	if err == nil {
		defer catCursor.Close(ctx)
		var allCategories []models.Category
		if err := catCursor.All(ctx, &allCategories); err == nil {
			for _, cat := range allCategories {
				categoryByID[cat.ID] = cat
			}
		}
	}

	response := make([]ProviderResponse, 0, len(providers))
	for _, p := range providers {
		cats := make([]models.Category, 0, len(p.CategoryIDs))
		for _, id := range p.CategoryIDs {
			if cat, ok := categoryByID[id]; ok {
				cats = append(cats, cat)
			}
		}
		response = append(response, ProviderResponse{User: p, Categories: cats})
	}

	c.JSON(http.StatusOK, gin.H{"providers": response})
}
