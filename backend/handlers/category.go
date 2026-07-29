package handlers

import (
	"context"
	"net/http"
	"time"

	"hulu-service-backend/config"
	"hulu-service-backend/models"

	"github.com/gin-gonic/gin"
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