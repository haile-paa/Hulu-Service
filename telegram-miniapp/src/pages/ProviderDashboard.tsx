import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../lib/api";
import { useAuth } from "../lib/auth";
import { TopBar, Card, StatusBadge, Button, EmptyState } from "../components/ui";
import { useT } from "../lib/i18n";

export function ProviderDashboardPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<api.Booking[] | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const t = useT();

  async function load() {
    if (!token) return;
    const r = await api.listProviderBookings(token);
    setBookings(r.bookings);
  }

  useEffect(() => {
    load();
  }, [token]);

  async function toggleAvailability() {
    if (!token) return;
    const next = !(available ?? false);
    const r = await api.setAvailability(token, next);
    setAvailable(r.isAvailable);
  }

  async function respond(id: string, action: "accept" | "decline") {
    if (!token) return;
    await api.respondToBooking(token, id, action);
    load();
  }

  async function complete(id: string) {
    if (!token) return;
    await api.completeBooking(token, id);
    load();
  }

  return (
    <div>
      <TopBar
        title={t("jobRequests")}
        right={
          <button
            onClick={toggleAvailability}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--bg-elevated-2)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              padding: "6px 12px",
              color: "var(--text)",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: available ? "var(--teal)" : "var(--text-muted)",
              }}
            />
            {available ? t("available") : t("unavailable")}
          </button>
        }
      />

      {bookings === null && <div style={{ padding: 20, color: "var(--text-muted)" }}>{t("loading")}</div>}
      {bookings?.length === 0 && <EmptyState title={t("noJobsYet")} />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 20px 24px" }}>
        {bookings?.map((b) => (
          <Card key={b.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{b.customer?.fullName}</p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                  {b.category?.nameAm} · {b.address}
                </p>
              </div>
              <StatusBadge status={b.status} />
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 13 }}>{b.description}</p>
            {b.customer?.phone && (
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                📞 {b.customer.phone}
              </p>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {b.status === "pending" && (
                <>
                  <Button onClick={() => respond(b.id, "accept")}>{t("accept")}</Button>
                  <Button variant="danger" onClick={() => respond(b.id, "decline")}>
                    {t("decline")}
                  </Button>
                </>
              )}
              {["accepted", "in_progress"].includes(b.status) && (
                <>
                  <Button variant="secondary" onClick={() => navigate(`/chat/${b.id}`)}>
                    {t("chat")}
                  </Button>
                  <Button variant="secondary" onClick={() => complete(b.id)}>
                    {t("markComplete")}
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
