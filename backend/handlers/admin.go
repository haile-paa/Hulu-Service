package handlers

import (
	"context"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"hulu-service-backend/config"
	"hulu-service-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// paginationParams reads ?page & ?limit off the request (defaulting to
// page 1 / 20 per page, capped at 100 per page) and returns the Mongo skip
// value to go with them.
func paginationParams(c *gin.Context) (page int, limit int, skip int64) {
	page, _ = strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ = strconv.Atoi(c.DefaultQuery("limit", "20"))
	if limit < 1 || limit > 100 {
		limit = 20
	}
	skip = int64((page - 1) * limit)
	return
}

// ---------- Dashboard stats ----------

type dailyPoint struct {
	Date     string `json:"date"`
	Bookings int    `json:"bookings"`
	NewUsers int    `json:"newUsers"`
}

// GetAdminStats powers the dashboard: headline counts, booking status
// breakdown, revenue from completed bookings, a 7-day activity trend, and
// which categories are getting booked the most.
func GetAdminStats(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	usersCol := config.DB.Collection("users")
	bookingsCol := config.DB.Collection("bookings")

	totalUsers, _ := usersCol.CountDocuments(ctx, bson.M{})
	totalCustomers, _ := usersCol.CountDocuments(ctx, bson.M{"role": models.RoleCustomer})
	totalProviders, _ := usersCol.CountDocuments(ctx, bson.M{"role": models.RoleProvider})
	availableProviders, _ := usersCol.CountDocuments(ctx, bson.M{"role": models.RoleProvider, "is_available": true})
	verifiedProviders, _ := usersCol.CountDocuments(ctx, bson.M{"role": models.RoleProvider, "is_verified": true})

	totalBookings, _ := bookingsCol.CountDocuments(ctx, bson.M{})

	statuses := []models.BookingStatus{
		models.StatusPending, models.StatusAccepted, models.StatusInProgress,
		models.StatusCompleted, models.StatusRejected, models.StatusCancelled,
	}
	statusCounts := gin.H{}
	for _, s := range statuses {
		count, _ := bookingsCol.CountDocuments(ctx, bson.M{"status": s})
		statusCounts[string(s)] = count
	}

	// Revenue from completed bookings only.
	totalRevenue := 0.0
	revCursor, err := bookingsCol.Aggregate(ctx, mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"status": models.StatusCompleted}}},
		{{Key: "$group", Value: bson.M{"_id": nil, "total": bson.M{"$sum": "$price_quote"}}}},
	})
	if err == nil {
		var rows []bson.M
		if err := revCursor.All(ctx, &rows); err == nil && len(rows) > 0 {
			switch v := rows[0]["total"].(type) {
			case float64:
				totalRevenue = v
			case int32:
				totalRevenue = float64(v)
			case int64:
				totalRevenue = float64(v)
			}
		}
	}

	// Last 7 days of bookings + signups, bucketed by day for the trend chart.
	since := time.Now().AddDate(0, 0, -6)
	sinceMidnight := time.Date(since.Year(), since.Month(), since.Day(), 0, 0, 0, 0, since.Location())

	trend := make([]dailyPoint, 7)
	for i := 0; i < 7; i++ {
		trend[i] = dailyPoint{Date: sinceMidnight.AddDate(0, 0, i).Format("2006-01-02")}
	}
	dayIndex := func(t time.Time) int {
		d := int(t.Sub(sinceMidnight).Hours() / 24)
		if d < 0 || d > 6 {
			return -1
		}
		return d
	}

	if cursor, err := bookingsCol.Find(ctx, bson.M{"created_at": bson.M{"$gte": sinceMidnight}}); err == nil {
		var recent []models.Booking
		_ = cursor.All(ctx, &recent)
		for _, b := range recent {
			if i := dayIndex(b.CreatedAt); i >= 0 {
				trend[i].Bookings++
			}
		}
	}
	if cursor, err := usersCol.Find(ctx, bson.M{"created_at": bson.M{"$gte": sinceMidnight}}); err == nil {
		var recent []models.User
		_ = cursor.All(ctx, &recent)
		for _, u := range recent {
			if i := dayIndex(u.CreatedAt); i >= 0 {
				trend[i].NewUsers++
			}
		}
	}

	// Bookings per category, for the "most requested work types" chart.
	categoryBookings := []gin.H{}
	if cursor, err := config.DB.Collection("categories").Find(ctx, bson.M{}); err == nil {
		var categories []models.Category
		_ = cursor.All(ctx, &categories)
		for _, cat := range categories {
			count, _ := bookingsCol.CountDocuments(ctx, bson.M{"category_id": cat.ID})
			if count > 0 {
				categoryBookings = append(categoryBookings, gin.H{
					"categoryId": cat.ID.Hex(),
					"nameEn":     cat.NameEn,
					"nameAm":     cat.NameAm,
					"count":      count,
				})
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"totalUsers":         totalUsers,
		"totalCustomers":     totalCustomers,
		"totalProviders":     totalProviders,
		"availableProviders": availableProviders,
		"verifiedProviders":  verifiedProviders,
		"totalBookings":      totalBookings,
		"statusCounts":       statusCounts,
		"totalRevenue":       totalRevenue,
		"trend":              trend,
		"categoryBookings":   categoryBookings,
	})
}

// ---------- Bookings ----------

// ListAllBookings gives the admin every booking in the system, newest
// first, with optional status/category/date/name filters and pagination.
func ListAllBookings(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{}
	if status := c.Query("status"); status != "" {
		filter["status"] = models.BookingStatus(status)
	}
	if catID := c.Query("categoryId"); catID != "" {
		if id, err := primitive.ObjectIDFromHex(catID); err == nil {
			filter["category_id"] = id
		}
	}

	// Name search: resolve matching customer/provider ids first, since
	// bookings don't store names directly.
	if q := strings.TrimSpace(c.Query("q")); q != "" {
		nameRegex := bson.M{"$regex": primitive.Regex{Pattern: regexp.QuoteMeta(q), Options: "i"}}
		matchedIDs := []primitive.ObjectID{}
		if cursor, err := config.DB.Collection("users").Find(ctx, bson.M{"full_name": nameRegex}); err == nil {
			var matched []models.User
			_ = cursor.All(ctx, &matched)
			for _, u := range matched {
				matchedIDs = append(matchedIDs, u.ID)
			}
		}
		filter["$or"] = []bson.M{
			{"customer_id": bson.M{"$in": matchedIDs}},
			{"provider_id": bson.M{"$in": matchedIDs}},
		}
	}

	bookingsCol := config.DB.Collection("bookings")
	total, _ := bookingsCol.CountDocuments(ctx, filter)

	page, limit, skip := paginationParams(c)
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetSkip(skip).
		SetLimit(int64(limit))

	cursor, err := bookingsCol.Find(ctx, filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load bookings"})
		return
	}
	defer cursor.Close(ctx)

	var bookings []models.Booking
	if err := cursor.All(ctx, &bookings); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not read bookings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"bookings": hydrateBookings(ctx, bookings),
		"total":    total,
		"page":     page,
		"limit":    limit,
	})
}

// ---------- Providers ----------

// ListAllProviders gives the admin every provider (available or not,
// verified or not — public /providers only shows what customers should
// see), with the same category resolution the public endpoint does.
func ListAllProviders(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"role": models.RoleProvider}
	if v := c.Query("verified"); v == "true" || v == "false" {
		filter["is_verified"] = v == "true"
	}
	if v := c.Query("available"); v == "true" || v == "false" {
		filter["is_available"] = v == "true"
	}
	if catID := c.Query("categoryId"); catID != "" {
		if id, err := primitive.ObjectIDFromHex(catID); err == nil {
			filter["category_ids"] = id
		}
	}
	if q := strings.TrimSpace(c.Query("q")); q != "" {
		filter["full_name"] = bson.M{"$regex": primitive.Regex{Pattern: regexp.QuoteMeta(q), Options: "i"}}
	}

	usersCol := config.DB.Collection("users")
	total, _ := usersCol.CountDocuments(ctx, filter)

	page, limit, skip := paginationParams(c)
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetSkip(skip).
		SetLimit(int64(limit))

	cursor, err := usersCol.Find(ctx, filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load providers"})
		return
	}
	defer cursor.Close(ctx)

	var providers []models.User
	if err := cursor.All(ctx, &providers); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not read providers"})
		return
	}

	categoryByID := map[primitive.ObjectID]models.Category{}
	if catCursor, err := config.DB.Collection("categories").Find(ctx, bson.M{}); err == nil {
		var categories []models.Category
		_ = catCursor.All(ctx, &categories)
		for _, cat := range categories {
			categoryByID[cat.ID] = cat
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

	c.JSON(http.StatusOK, gin.H{
		"providers": response,
		"total":     total,
		"page":      page,
		"limit":     limit,
	})
}

type VerifyProviderInput struct {
	IsVerified bool `json:"isVerified"`
}

// VerifyProvider lets an admin mark a provider as verified (or remove
// verification), shown to customers as a trust badge.
func VerifyProvider(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid provider id"})
		return
	}
	var input VerifyProviderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := config.DB.Collection("users").UpdateOne(ctx,
		bson.M{"_id": id, "role": models.RoleProvider},
		bson.M{"$set": bson.M{"is_verified": input.IsVerified, "updated_at": time.Now()}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update provider"})
		return
	}
	if res.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "provider not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"isVerified": input.IsVerified})
}

// ---------- Users (customers + providers) ----------

// ListAllUsers gives the admin every account, optionally filtered by role
// (?role=customer or ?role=provider) and searched by name/phone.
func ListAllUsers(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{}
	if role := c.Query("role"); role != "" {
		filter["role"] = models.Role(role)
	}
	if q := strings.TrimSpace(c.Query("q")); q != "" {
		nameOrPhone := bson.M{"$regex": primitive.Regex{Pattern: regexp.QuoteMeta(q), Options: "i"}}
		filter["$or"] = []bson.M{
			{"full_name": nameOrPhone},
			{"phone": nameOrPhone},
		}
	}

	usersCol := config.DB.Collection("users")
	total, _ := usersCol.CountDocuments(ctx, filter)

	page, limit, skip := paginationParams(c)
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetSkip(skip).
		SetLimit(int64(limit))

	cursor, err := usersCol.Find(ctx, filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load users"})
		return
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err := cursor.All(ctx, &users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not read users"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

type SuspendUserInput struct {
	IsSuspended bool `json:"isSuspended"`
}

// SuspendUser blocks (or restores) a customer's or provider's ability to
// log in, without deleting their account or history.
func SuspendUser(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	var input SuspendUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := config.DB.Collection("users").UpdateOne(ctx,
		bson.M{"_id": id, "role": bson.M{"$ne": models.RoleAdmin}},
		bson.M{"$set": bson.M{"is_suspended": input.IsSuspended, "updated_at": time.Now()}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update user"})
		return
	}
	if res.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"isSuspended": input.IsSuspended})
}
