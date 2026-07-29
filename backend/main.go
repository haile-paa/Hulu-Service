package main

import (
	"log"
	"os"

	"hulu-service-backend/config"
	"hulu-service-backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, using system env vars")
	}

	config.ConnectDB()

	r := gin.Default()
	r.Use(cors.Default())

	routes.RegisterRoutes(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("hulu-service backend running on port", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
