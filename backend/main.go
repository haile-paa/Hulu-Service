package main

import (
	"log"
	"os"
	"time"

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

	// cors.Default() only allows a small default header set that does NOT
	// include "Authorization" — fine for the mobile app (not subject to
	// browser CORS preflight), but it silently blocks every authenticated
	// request from the admin site, since the browser preflights any request
	// carrying a Bearer token. Configure it explicitly instead.
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	corsConfig.MaxAge = 12 * time.Hour
	r.Use(cors.New(corsConfig))

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