package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type BookingStatus string

const (
	StatusPending   BookingStatus = "pending"
	StatusAccepted  BookingStatus = "accepted"
	StatusRejected  BookingStatus = "rejected"
	StatusInProgress BookingStatus = "in_progress"
	StatusCompleted BookingStatus = "completed"
	StatusCancelled BookingStatus = "cancelled"
)

type Booking struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	CustomerID  primitive.ObjectID `bson:"customer_id" json:"customerId"`
	ProviderID  primitive.ObjectID `bson:"provider_id" json:"providerId"`
	CategoryID  primitive.ObjectID `bson:"category_id" json:"categoryId"`
	Description string             `bson:"description" json:"description"`
	Address     string             `bson:"address" json:"address"`
	Location    *GeoPoint          `bson:"location,omitempty" json:"location,omitempty"`
	Status      BookingStatus      `bson:"status" json:"status"`
	ScheduledAt *time.Time         `bson:"scheduled_at,omitempty" json:"scheduledAt,omitempty"`
	PriceQuote  float64            `bson:"price_quote,omitempty" json:"priceQuote,omitempty"`

	CreatedAt time.Time `bson:"created_at" json:"createdAt"`
	UpdatedAt time.Time `bson:"updated_at" json:"updatedAt"`
}

type Review struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	BookingID  primitive.ObjectID `bson:"booking_id" json:"bookingId"`
	ProviderID primitive.ObjectID `bson:"provider_id" json:"providerId"`
	CustomerID primitive.ObjectID `bson:"customer_id" json:"customerId"`
	Rating     int                `bson:"rating" json:"rating"` // 1-5
	Comment    string             `bson:"comment,omitempty" json:"comment,omitempty"`
	CreatedAt  time.Time          `bson:"created_at" json:"createdAt"`
}
