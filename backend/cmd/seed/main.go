package main

import (
	"context"
	"log"
	"time"

	"hulu-service-backend/config"
	"hulu-service-backend/models"

	"github.com/joho/godotenv"
)

// Run with: go run cmd/seed/main.go
func main() {
	_ = godotenv.Load()
	config.ConnectDB()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	col := config.DB.Collection("categories")

	count, _ := col.CountDocuments(ctx, map[string]interface{}{})
	if count > 0 {
		log.Println("categories already seeded, skipping")
		return
	}

	docs := make([]interface{}, 0)
	for _, cat := range models.SeedCategories() {
		docs = append(docs, cat)
	}

	res, err := col.InsertMany(ctx, docs)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("seeded %d categories\n", len(res.InsertedIDs))
}
