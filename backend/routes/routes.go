package routes

import (
	"hulu-service-backend/handlers"
	"hulu-service-backend/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")

	// Public
	api.POST("/auth/register", handlers.Register)
	api.POST("/auth/login", handlers.Login)
	api.GET("/categories", handlers.ListCategories)
	api.GET("/areas", handlers.ListAreas)
	api.GET("/providers", handlers.ListProviders)

	// Authenticated (any role) — chat is shared between customer and
	// provider, checked per-booking inside the handler.
	auth := api.Group("/")
	auth.Use(middleware.RequireAuth())
	{
		auth.GET("/bookings/:id/messages", handlers.ListMessages)
		auth.POST("/bookings/:id/messages", handlers.SendMessage)
	}

	// WebSocket chat connection. Auth is via ?token= (see ServeChatWebSocket)
	// since the WebSocket handshake can't carry a custom Authorization header.
	api.GET("/ws/chat/:id", handlers.ServeChatWebSocket)

	// Customer-only
	customer := api.Group("/customer")
	customer.Use(middleware.RequireAuth(), middleware.RequireRole("customer"))
	{
		customer.POST("/bookings", handlers.CreateBooking)
		customer.GET("/bookings", handlers.ListCustomerBookings)
		customer.PATCH("/bookings/:id/cancel", handlers.CancelBooking)
	}

	// Provider-only
	provider := api.Group("/provider")
	provider.Use(middleware.RequireAuth(), middleware.RequireRole("provider"))
	{
		provider.PATCH("/availability", handlers.SetAvailability)
		provider.GET("/bookings", handlers.ListProviderBookings)
		provider.PATCH("/bookings/:id/respond", handlers.RespondToBooking)
		provider.PATCH("/bookings/:id/complete", handlers.CompleteBooking)
	}

	// Admin-only
	admin := api.Group("/admin")
	admin.Use(middleware.RequireAuth(), middleware.RequireRole("admin"))
	{
		admin.GET("/stats", handlers.GetAdminStats)

		admin.GET("/bookings", handlers.ListAllBookings)

		admin.GET("/providers", handlers.ListAllProviders)
		admin.PATCH("/providers/:id/verify", handlers.VerifyProvider)

		admin.GET("/users", handlers.ListAllUsers)
		admin.PATCH("/users/:id/suspend", handlers.SuspendUser)

		admin.POST("/categories", handlers.CreateCategory)
		admin.PATCH("/categories/:id", handlers.UpdateCategory)
		admin.DELETE("/categories/:id", handlers.DeleteCategory)
	}
}
