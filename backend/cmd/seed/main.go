package main

import (
	"context"
	"log"
	"time"

	"hulu-service-backend/config"
	"hulu-service-backend/models"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Run with: go run cmd/seed/main.go
//
// Upserts by name_en so this is safe to re-run any time (e.g. after adding
// or changing category prices) without creating duplicates or requiring a
// fresh database.
func main() {
	_ = godotenv.Load()
	config.ConnectDB()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

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
