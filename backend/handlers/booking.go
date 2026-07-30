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
)

// currentUserID reads the authenticated user's id off the gin context (set
// by middleware.RequireAuth) and parses it into an ObjectID.
func currentUserID(c *gin.Context) (primitive.ObjectID, bool) {
	raw, ok := c.Get("userId")
	if !ok {
		return primitive.NilObjectID, false
	}
	id, err := primitive.ObjectIDFromHex(raw.(string))
	if err != nil {
		return primitive.NilObjectID, false
	}
	return id, true
}

// userSummary is the small "who is this" shape embedded in booking
// responses so the app doesn't need a second request just to show a name.
type userSummary struct {
	ID       primitive.ObjectID `json:"id"`
	FullName string             `json:"fullName"`
	Phone    string             `json:"phone"`
}

// BookingResponse is a booking with the other party's basic info attached
// (customer sees the provider's name/phone, provider sees the customer's).
type BookingResponse struct {
	models.Booking `bson:",inline"`
	Provider       *userSummary     `json:"provider,omitempty"`
	Customer       *userSummary     `json:"customer,omitempty"`
	Category       *models.Category `json:"category,omitempty"`
}

type CreateBookingInput struct {
	ProviderID  string `json:"providerId" binding:"required"`
	CategoryID  string `json:"categoryId"`
	Description string `json:"description"`
	Address     string `json:"address"`
}

// CreateBooking lets a logged-in customer request a provider. Nothing is
// confirmed yet — it starts "pending" until the provider accepts or
// declines it.
func CreateBooking(c *gin.Context) {
	customerID, ok := currentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid session"})
		return
	}

	var input CreateBookingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	providerID, err := primitive.ObjectIDFromHex(input.ProviderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid providerId"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Make sure the target is actually a provider.
	var provider models.User
	if err := config.DB.Collection("users").FindOne(ctx, bson.M{
		"_id": providerID, "role": models.RoleProvider,
	}).Decode(&provider); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "provider not found"})
		return
	}

	booking := models.Booking{
		ID:          primitive.NewObjectID(),
		CustomerID:  customerID,
		ProviderID:  providerID,
		Description: input.Description,
		Address:     input.Address,
		Status:      models.StatusPending,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	if input.CategoryID != "" {
		if catID, err := primitive.ObjectIDFromHex(input.CategoryID); err == nil {
			booking.CategoryID = catID

			// The price is set by the app per category, not by the customer
			// or provider, so it's looked up here rather than trusted from
			// client input. Negotiable categories are left at 0 — the price
			// is worked out directly between customer and provider.
			var category models.Category
			if err := config.DB.Collection("categories").FindOne(ctx, bson.M{"_id": catID}).Decode(&category); err == nil {
				if category.PriceType != models.PriceNegotiable {
					booking.PriceQuote = category.Price
				}
			}
		}
	}

	if _, err := config.DB.Collection("bookings").InsertOne(ctx, booking); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create booking"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"booking": booking})
}

// hydrateBookings attaches provider/customer/category summaries to a list
// of bookings in a couple of batched lookups, rather than one query per row.
func hydrateBookings(ctx context.Context, bookings []models.Booking) []BookingResponse {
	userIDs := map[primitive.ObjectID]bool{}
	catIDs := map[primitive.ObjectID]bool{}
	for _, b := range bookings {
		userIDs[b.CustomerID] = true
		userIDs[b.ProviderID] = true
		if !b.CategoryID.IsZero() {
			catIDs[b.CategoryID] = true
		}
	}

	userList := make([]primitive.ObjectID, 0, len(userIDs))
	for id := range userIDs {
		userList = append(userList, id)
	}
	usersByID := map[primitive.ObjectID]userSummary{}
	if len(userList) > 0 {
		cursor, err := config.DB.Collection("users").Find(ctx, bson.M{"_id": bson.M{"$in": userList}})
		if err == nil {
			var users []models.User
			_ = cursor.All(ctx, &users)
			for _, u := range users {
				usersByID[u.ID] = userSummary{ID: u.ID, FullName: u.FullName, Phone: u.Phone}
			}
		}
	}

	catList := make([]primitive.ObjectID, 0, len(catIDs))
	for id := range catIDs {
		catList = append(catList, id)
	}
	catsByID := map[primitive.ObjectID]models.Category{}
	if len(catList) > 0 {
		cursor, err := config.DB.Collection("categories").Find(ctx, bson.M{"_id": bson.M{"$in": catList}})
		if err == nil {
			var cats []models.Category
			_ = cursor.All(ctx, &cats)
			for _, cat := range cats {
				catsByID[cat.ID] = cat
			}
		}
	}

	out := make([]BookingResponse, 0, len(bookings))
	for _, b := range bookings {
		resp := BookingResponse{Booking: b}
		if u, ok := usersByID[b.ProviderID]; ok {
			resp.Provider = &u
		}
		if u, ok := usersByID[b.CustomerID]; ok {
			resp.Customer = &u
		}
		if cat, ok := catsByID[b.CategoryID]; ok {
			resp.Category = &cat
		}
		out = append(out, resp)
	}
	return out
}

// ListCustomerBookings returns everything the logged-in customer has booked,
// newest first.
func ListCustomerBookings(c *gin.Context) {
	customerID, ok := currentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid session"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := config.DB.Collection("bookings").Find(ctx,
		bson.M{"customer_id": customerID},
	)
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
	sortBookingsNewestFirst(bookings)

	c.JSON(http.StatusOK, gin.H{"bookings": hydrateBookings(ctx, bookings)})
}

// ListProviderBookings returns booking requests + jobs for the logged-in
// provider, newest first.
func ListProviderBookings(c *gin.Context) {
	providerID, ok := currentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid session"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := config.DB.Collection("bookings").Find(ctx,
		bson.M{"provider_id": providerID},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load jobs"})
		return
	}
	defer cursor.Close(ctx)

	var bookings []models.Booking
	if err := cursor.All(ctx, &bookings); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not read jobs"})
		return
	}
	sortBookingsNewestFirst(bookings)

	c.JSON(http.StatusOK, gin.H{"bookings": hydrateBookings(ctx, bookings)})
}

func sortBookingsNewestFirst(bookings []models.Booking) {
	for i := 1; i < len(bookings); i++ {
		for j := i; j > 0 && bookings[j].CreatedAt.After(bookings[j-1].CreatedAt); j-- {
			bookings[j], bookings[j-1] = bookings[j-1], bookings[j]
		}
	}
}

type RespondBookingInput struct {
	Action string `json:"action" binding:"required"` // "accept" | "decline"
}

// RespondToBooking lets a provider accept or decline a pending request.
func RespondToBooking(c *gin.Context) {
	providerID, ok := currentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid session"})
		return
	}
	bookingID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid booking id"})
		return
	}
	var input RespondBookingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var newStatus models.BookingStatus
	switch input.Action {
	case "accept":
		newStatus = models.StatusAccepted
	case "decline":
		newStatus = models.StatusRejected
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "action must be accept or decline"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := config.DB.Collection("bookings").UpdateOne(ctx,
		bson.M{"_id": bookingID, "provider_id": providerID, "status": models.StatusPending},
		bson.M{"$set": bson.M{"status": newStatus, "updated_at": time.Now()}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update booking"})
		return
	}
	if res.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "booking not found or no longer pending"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": newStatus})
}

// CompleteBooking lets a provider mark an accepted job as done.
func CompleteBooking(c *gin.Context) {
	providerID, ok := currentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid session"})
		return
	}
	bookingID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid booking id"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := config.DB.Collection("bookings").UpdateOne(ctx,
		bson.M{
			"_id": bookingID, "provider_id": providerID,
			"status": bson.M{"$in": []models.BookingStatus{models.StatusAccepted, models.StatusInProgress}},
		},
		bson.M{"$set": bson.M{"status": models.StatusCompleted, "updated_at": time.Now()}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update booking"})
		return
	}
	if res.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "booking not found or not in progress"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": models.StatusCompleted})
}

// CancelBooking lets a customer back out of a request that hasn't been
// accepted yet.
func CancelBooking(c *gin.Context) {
	customerID, ok := currentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid session"})
		return
	}
	bookingID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid booking id"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := config.DB.Collection("bookings").UpdateOne(ctx,
		bson.M{"_id": bookingID, "customer_id": customerID, "status": models.StatusPending},
		bson.M{"$set": bson.M{"status": models.StatusCancelled, "updated_at": time.Now()}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not cancel booking"})
		return
	}
	if res.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "booking not found or already responded to"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": models.StatusCancelled})
}
