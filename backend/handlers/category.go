package handlers

import (
	"context"
	"net/http"
	"time"

	"hulu-service-backend/config"
	"hulu-service-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func ListAreas(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"areas": models.WorkAreas()})
}

func ListCategories(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	opts := options.Find().SetSort(map[string]int{"sort_order": 1})
	cursor, err := config.DB.Collection("categories").Find(ctx, map[string]interface{}{}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load categories"})
		return
	}
	defer cursor.Close(ctx)

	categories := []models.Category{}
	if err := cursor.All(ctx, &categories); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not read categories"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"categories": categories})
}

// CategoryInput is the admin-facing shape for creating/editing a category,
// including its app-assigned price. This is how prices actually get set —
// providers never choose their own price, an admin does it here per category.
type CategoryInput struct {
	NameEn    string  `json:"nameEn" binding:"required"`
	NameAm    string  `json:"nameAm" binding:"required"`
	Icon      string  `json:"icon"`
	SortOrder int     `json:"sortOrder"`
	PriceType string  `json:"priceType" binding:"required,oneof=one_time monthly negotiable"`
	Price     float64 `json:"price"`
}

// CreateCategory lets an admin add a new work type with its price already
// attached.
func CreateCategory(c *gin.Context) {
	var input CategoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	price := input.Price
	if input.PriceType == string(models.PriceNegotiable) {
		price = 0
	}

	category := models.Category{
		ID:        primitive.NewObjectID(),
		NameEn:    input.NameEn,
		NameAm:    input.NameAm,
		Icon:      input.Icon,
		SortOrder: input.SortOrder,
		PriceType: models.PriceType(input.PriceType),
		Price:     price,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if _, err := config.DB.Collection("categories").InsertOne(ctx, category); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create category"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"category": category})
}

// UpdateCategory edits a category's details and/or price. This is the main
// way an admin changes what customers see charged for a given work type —
// every provider under this category picks up the new price immediately
// since price lives on the category, not the provider.
func UpdateCategory(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category id"})
		return
	}

	var input CategoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	price := input.Price
	if input.PriceType == string(models.PriceNegotiable) {
		price = 0
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := config.DB.Collection("categories").UpdateOne(ctx,
		bson.M{"_id": id},
		bson.M{"$set": bson.M{
			"name_en":    input.NameEn,
			"name_am":    input.NameAm,
			"icon":       input.Icon,
			"sort_order": input.SortOrder,
			"price_type": input.PriceType,
			"price":      price,
		}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update category"})
		return
	}
	if res.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "category not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// DeleteCategory removes a work type, but refuses if providers are still
// registered under it (they'd be left with a dangling category id).
func DeleteCategory(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category id"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	inUse, err := config.DB.Collection("users").CountDocuments(ctx, bson.M{"category_ids": id})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not check category usage"})
		return
	}
	if inUse > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "this work type still has providers registered under it"})
		return
	}

	res, err := config.DB.Collection("categories").DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete category"})
		return
	}
	if res.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "category not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
