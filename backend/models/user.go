package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Role string

const (
	RoleCustomer Role = "customer"
	RoleProvider Role = "provider"
	RoleAdmin    Role = "admin"
)

// User covers both customers and providers. Provider-only fields are
// left empty/zero for customers.
type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FullName     string             `bson:"full_name" json:"fullName"`
	Phone        string             `bson:"phone" json:"phone"` // e.g. +2519xxxxxxxx, used as login identifier
	PasswordHash string             `bson:"password_hash" json:"-"`
	Role         Role               `bson:"role" json:"role"`
	City         string             `bson:"city" json:"city"`
	SubCity      string             `bson:"sub_city,omitempty" json:"subCity,omitempty"`
	Language     string             `bson:"language" json:"language"` // "am" or "en"
	AvatarURL    string             `bson:"avatar_url,omitempty" json:"avatarUrl,omitempty"`

	// Provider-only fields
	CategoryIDs      []primitive.ObjectID `bson:"category_ids,omitempty" json:"categoryIds,omitempty"`
	WorkAreas        []string             `bson:"work_areas,omitempty" json:"workAreas,omitempty"` // e.g. ["Bole", "Piassa"]
	Bio              string               `bson:"bio,omitempty" json:"bio,omitempty"`
	YearsExperience  int                  `bson:"years_experience,omitempty" json:"yearsExperience,omitempty"`
	IsVerified       bool                 `bson:"is_verified" json:"isVerified"`
	VerificationDocs []string             `bson:"verification_docs,omitempty" json:"-"`
	RatingAvg        float64              `bson:"rating_avg" json:"ratingAvg"`
	RatingCount      int                  `bson:"rating_count" json:"ratingCount"`
	IsAvailable      bool                 `bson:"is_available" json:"isAvailable"`
	Location         *GeoPoint            `bson:"location,omitempty" json:"location,omitempty"`

	CreatedAt time.Time `bson:"created_at" json:"createdAt"`
	UpdatedAt time.Time `bson:"updated_at" json:"updatedAt"`
}

type GeoPoint struct {
	Type        string    `bson:"type" json:"type"` // "Point"
	Coordinates []float64 `bson:"coordinates" json:"coordinates"` // [lng, lat]
}
