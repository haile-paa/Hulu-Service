import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../lib/api";
import { useAuth } from "../lib/auth";
import { TopBar, Card, StatusBadge, Button, EmptyState } from "../components/ui";

export function MyBookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<api.Booking[] | null>(null);
  const navigate = useNavigate();

  async function load() {
    if (!token) return;
    const r = await api.listCustomerBookings(token);
    setBookings(r.bookings);
  }

  useEffect(() => {
    load();
  }, [token]);

  async function cancel(id: string) {
    if (!token) return;
    await api.cancelBooking(token, id);
    load();
  }

  return (
    <div>
      <TopBar title="የእኔ ማስያዣዎች" />

      {bookings === null && <div style={{ padding: 20, color: "var(--text-muted)" }}>በመጫን ላይ...</div>}
      {bookings?.length === 0 && (
        <EmptyState title="እስካሁን ምንም ማስያዣ የለዎትም" hint="ከቤት ገጽ ምድብ ይምረጡ" />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 20px 24px" }}>
        {bookings?.map((b) => (
          <Card key={b.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
                  {b.category?.nameAm} — {b.provider?.fullName || "—"}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>{b.address}</p>
              </div>
              <StatusBadge status={b.status} />
            </div>

            {b.priceQuote && (
              <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                {b.priceQuote} ብር
              </p>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {b.status === "pending" && (
                <Button variant="danger" onClick={() => cancel(b.id)}>
                  ሰርዝ
                </Button>
              )}
              {["accepted", "in_progress"].includes(b.status) && (
                <Button variant="secondary" onClick={() => navigate(`/chat/${b.id}`)}>
                  💬 ውይይት
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
