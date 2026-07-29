package handlers

import (
	"context"
	"net/http"
	"time"

	"hulu-service-backend/config"
	"hulu-service-backend/models"
	"hulu-service-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	FullName    string   `json:"fullName" binding:"required"`
	Phone       string   `json:"phone" binding:"required"`
	Password    string   `json:"password" binding:"required,min=6"`
	Role        string   `json:"role" binding:"required,oneof=customer provider"`
	City        string   `json:"city" binding:"required"`
	Language    string   `json:"language"`
	CategoryIDs     []string `json:"categoryIds"`     // required if role == provider
	WorkAreas       []string `json:"workAreas"`       // required if role == provider, e.g. ["ቦሌ", "ፒያሳ"]
	YearsExperience int      `json:"yearsExperience"` // required if role == provider
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	users := config.DB.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	existing := users.FindOne(ctx, bson.M{"phone": input.Phone})
	if existing.Err() == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "phone already registered"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not process password"})
		return
	}

	lang := input.Language
	if lang == "" {
		lang = "am"
	}

	user := models.User{
		FullName:     input.FullName,
		Phone:        input.Phone,
		PasswordHash: string(hash),
		Role:         models.Role(input.Role),
		City:         input.City,
		Language:     lang,
		IsAvailable:  true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if input.Role == "provider" {
		for _, idStr := range input.CategoryIDs {
			if id, err := primitive.ObjectIDFromHex(idStr); err == nil {
				user.CategoryIDs = append(user.CategoryIDs, id)
			}
		}
		user.WorkAreas = input.WorkAreas
		user.YearsExperience = input.YearsExperience
		user.IsAvailable = true // providers default to "available" on signup, like LinkedIn's open-to-work default
	}

	res, err := users.InsertOne(ctx, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create account"})
		return
	}
	user.ID = res.InsertedID.(primitive.ObjectID)

	token, err := utils.GenerateToken(user.ID.Hex(), string(user.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate session"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"token": token, "user": user})
}

type LoginInput struct {
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	users := config.DB.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user models.User
	err := users.FindOne(ctx, bson.M{"phone": input.Phone}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid phone or password"})
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid phone or password"})
		return
	}

	token, err := utils.GenerateToken(user.ID.Hex(), string(user.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
}