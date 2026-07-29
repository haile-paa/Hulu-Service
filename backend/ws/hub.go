// Package ws implements a minimal per-room WebSocket hub for the booking
// chat feature. Each booking gets its own "room" (keyed by booking ID);
// messages sent by either party are broadcast to every connection currently
// open in that room, so both sides see new messages instantly without
// polling.
package ws

import (
	"sync"

	"github.com/gorilla/websocket"
)

// Client wraps a single open socket connection along with a buffered
// outbound channel, so slow writers don't block the hub's broadcast loop.
type Client struct {
	Conn      *websocket.Conn
	Send      chan []byte
	BookingID string
	UserID    string
	writeMu   sync.Mutex
}

func (cl *Client) writeMessage(data []byte) error {
	cl.writeMu.Lock()
	defer cl.writeMu.Unlock()
	return cl.Conn.WriteMessage(websocket.TextMessage, data)
}

// Hub tracks all active connections grouped by booking ID.
type Hub struct {
	mu    sync.RWMutex
	rooms map[string]map[*Client]bool
}

// DefaultHub is the single process-wide hub instance. Fine for a single
// backend instance; if this ever runs behind multiple server processes,
// broadcasting would need to move to something shared like Redis pub/sub.
var DefaultHub = &Hub{rooms: map[string]map[*Client]bool{}}

// Register adds a client to its booking's room.
func (h *Hub) Register(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.rooms[client.BookingID] == nil {
		h.rooms[client.BookingID] = map[*Client]bool{}
	}
	h.rooms[client.BookingID][client] = true
}

// Unregister removes a client, e.g. once its connection closes.
func (h *Hub) Unregister(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if room, ok := h.rooms[client.BookingID]; ok {
		delete(room, client)
		if len(room) == 0 {
			delete(h.rooms, client.BookingID)
		}
	}
	close(client.Send)
}

// Broadcast sends data to every client currently connected to a booking's
// room (including the sender's own other tabs/devices, so everything stays
// in sync).
func (h *Hub) Broadcast(bookingID string, data []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for client := range h.rooms[bookingID] {
		select {
		case client.Send <- data:
		default:
			// Slow/stuck client — drop rather than block the whole room.
		}
	}
}

// Pump starts the client's write loop: anything placed on Send gets written
// to the socket. Call this in a goroutine right after Register.
func (cl *Client) Pump() {
	for data := range cl.Send {
		if err := cl.writeMessage(data); err != nil {
			return
		}
	}
}
