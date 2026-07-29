package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Message is a single chat message. Conversations are scoped to a Booking —
// once a customer books a provider, a chat thread opens between the two of
// them for that job. There's no open-ended "message anyone" inbox.
type Message struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	BookingID primitive.ObjectID `bson:"booking_id" json:"bookingId"`
	SenderID  primitive.ObjectID `bson:"sender_id" json:"senderId"`
	Text      string             `bson:"text" json:"text"`
	CreatedAt time.Time          `bson:"created_at" json:"createdAt"`
}
