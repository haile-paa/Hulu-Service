package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"hulu-service-backend/config"
	"hulu-service-backend/models"
	"hulu-service-backend/utils"
	"hulu-service-backend/ws"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// loadBookingIfParticipant fetches a booking and checks the given user is
// either the customer or the provider on it. Chat is only ever between the
// two people on that specific booking.
func loadBookingIfParticipant(ctx context.Context, bookingID, userID primitive.ObjectID) (*models.Booking, bool) {
	var booking models.Booking
	if err := config.DB.Collection("bookings").FindOne(ctx, bson.M{"_id": bookingID}).Decode(&booking); err != nil {
		return nil, false
	}
	if booking.CustomerID != userID && booking.ProviderID != userID {
		return nil, false
	}
	return &booking, true
}

// ListMessages returns the full chat history for a booking, oldest first.
func ListMessages(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid session"})
		return
	}
	bookingID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid booking id"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if _, ok := loadBookingIfParticipant(ctx, bookingID, userID); !ok {
		c.JSON(http.StatusForbidden, gin.H{"error": "not part of this conversation"})
		return
	}

	cursor, err := config.DB.Collection("messages").Find(ctx,
		bson.M{"booking_id": bookingID},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load messages"})
		return
	}
	defer cursor.Close(ctx)

	messages := []models.Message{}
	if err := cursor.All(ctx, &messages); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not read messages"})
		return
	}
	// oldest first
	for i := 1; i < len(messages); i++ {
		for j := i; j > 0 && messages[j].CreatedAt.Before(messages[j-1].CreatedAt); j-- {
			messages[j], messages[j-1] = messages[j-1], messages[j]
		}
	}

	c.JSON(http.StatusOK, gin.H{"messages": messages})
}

type SendMessageInput struct {
	Text string `json:"text" binding:"required"`
}

// persistMessage saves a chat message and returns the stored record.
func persistMessage(ctx context.Context, bookingID, senderID primitive.ObjectID, text string) (models.Message, error) {
	msg := models.Message{
		ID:        primitive.NewObjectID(),
		BookingID: bookingID,
		SenderID:  senderID,
		Text:      text,
		CreatedAt: time.Now(),
	}
	_, err := config.DB.Collection("messages").InsertOne(ctx, msg)
	return msg, err
}

// SendMessage is a plain REST fallback for sending a chat message, for
// clients that aren't (yet) connected over the WebSocket. It persists the
// message and also broadcasts it to anyone currently connected via
// WebSocket, so both transports stay in sync.
func SendMessage(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid session"})
		return
	}
	bookingID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid booking id"})
		return
	}
	var input SendMessageInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if _, ok := loadBookingIfParticipant(ctx, bookingID, userID); !ok {
		c.JSON(http.StatusForbidden, gin.H{"error": "not part of this conversation"})
		return
	}

	msg, err := persistMessage(ctx, bookingID, userID, input.Text)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not send message"})
		return
	}

	if data, err := json.Marshal(gin.H{"type": "message", "message": msg}); err == nil {
		ws.DefaultHub.Broadcast(bookingID.Hex(), data)
	}

	c.JSON(http.StatusCreated, gin.H{"message": msg})
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true }, // mobile app, not a browser — no CSRF-relevant origin
}

// ServeChatWebSocket upgrades the connection and joins the caller to the
// room for a given booking. Auth normally comes from an Authorization
// header, but browsers/React Native's WebSocket API can't set custom
// headers on the handshake, so the token is passed as a query param here
// instead (?token=...).
func ServeChatWebSocket(c *gin.Context) {
	tokenStr := c.Query("token")
	claims, err := utils.ParseToken(tokenStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
		return
	}
	userID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid session"})
		return
	}
	bookingID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid booking id"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	if _, ok := loadBookingIfParticipant(ctx, bookingID, userID); !ok {
		cancel()
		c.JSON(http.StatusForbidden, gin.H{"error": "not part of this conversation"})
		return
	}
	cancel()

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return // upgrader already wrote an error response
	}

	client := &ws.Client{
		Conn:      conn,
		Send:      make(chan []byte, 16),
		BookingID: bookingID.Hex(),
		UserID:    userID.Hex(),
	}
	ws.DefaultHub.Register(client)
	go client.Pump()

	defer func() {
		ws.DefaultHub.Unregister(client)
		conn.Close()
	}()

	for {
		_, raw, err := conn.ReadMessage()
		if err != nil {
			return // client disconnected
		}

		var incoming struct {
			Text string `json:"text"`
		}
		if err := json.Unmarshal(raw, &incoming); err != nil || incoming.Text == "" {
			continue
		}

		saveCtx, saveCancel := context.WithTimeout(context.Background(), 5*time.Second)
		msg, err := persistMessage(saveCtx, bookingID, userID, incoming.Text)
		saveCancel()
		if err != nil {
			continue
		}

		if data, err := json.Marshal(gin.H{"type": "message", "message": msg}); err == nil {
			ws.DefaultHub.Broadcast(bookingID.Hex(), data)
		}
	}
}
