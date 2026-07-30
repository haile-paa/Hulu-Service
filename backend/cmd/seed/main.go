package main

import (
	"context"
	"log"
	"os"
	"time"

	"hulu-service-backend/config"
	"hulu-service-backend/models"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

// Run with: go run cmd/seed/main.go
//
// Upserts categories by name_en so this is safe to re-run any time (e.g.
// after adding or changing category prices) without creating duplicates or
// requiring a fresh database. Also makes sure a default admin account
// exists so someone can log into the admin site on day one.
func main() {
	_ = godotenv.Load()
	config.ConnectDB()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	seedCategories(ctx)
	seedAdmin(ctx)
}

func seedCategories(ctx context.Context) {
	col := config.DB.Collection("categories")

	updated := 0
	for _, cat := range models.SeedCategories() {
		_, err := col.UpdateOne(ctx,
			bson.M{"name_en": cat.NameEn},
			bson.M{"$set": bson.M{
				"name_am":    cat.NameAm,
				"icon":       cat.Icon,
				"sort_order": cat.SortOrder,
				"price_type": cat.PriceType,
				"price":      cat.Price,
			}},
			options.Update().SetUpsert(true),
		)
		if err != nil {
			log.Fatal(err)
		}
		updated++
	}
	log.Printf("seeded/updated %d categories\n", updated)
}

// seedAdmin makes sure at least one admin account exists so someone can log
// into the admin site. Phone/password come from ADMIN_PHONE / ADMIN_PASSWORD
// env vars if set, otherwise a default is used — change the password after
// first login either way.
func seedAdmin(ctx context.Context) {
	users := config.DB.Collection("users")

	count, err := users.CountDocuments(ctx, bson.M{"role": models.RoleAdmin})
	if err != nil {
		log.Fatal(err)
	}
	if count > 0 {
		log.Println("admin account already exists, skipping")
		return
	}

	phone := os.Getenv("ADMIN_PHONE")
	if phone == "" {
		phone = "0900000000"
	}
	password := os.Getenv("ADMIN_PASSWORD")
	if password == "" {
		password = "admin123"
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}

	admin := models.User{
		FullName:     "Admin",
		Phone:        phone,
		PasswordHash: string(hash),
		Role:         models.RoleAdmin,
		City:         "Addis Ababa",
		Language:     "en",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if _, err := users.InsertOne(ctx, admin); err != nil {
		log.Fatal(err)
	}
	log.Printf("created admin account — phone: %s, password: %s (change this after logging in)\n", phone, password)
}
