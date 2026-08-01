import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as api from "../lib/api";
import { useAuth } from "../lib/auth";
import { TopBar, Button } from "../components/ui";
import { Field } from "./Login";

export function BookNewPage() {
  const { providerId = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const state = location.state as { provider?: api.Provider; categoryId?: string } | null;

  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      await api.createBooking(token, {
        providerId,
        categoryId: state?.categoryId,
        description,
        address,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof api.ApiError ? err.message : "ማስያዣ አልተሳካም");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <h2 style={{ fontSize: 18, margin: "0 0 6px" }}>ማስያዣዎ ተልኳል!</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "0 0 24px" }}>
          {state?.provider?.fullName} ሲቀበሉት ወይም ውድቅ ሲያደርጉት እናሳውቆታለን።
        </p>
        <Button full onClick={() => navigate("/bookings")}>
          ማስያዣዎቼን ይመልከቱ
        </Button>
      </div>
    );
  }

  return (
    <div>
      <TopBar title={`ማስያዣ — ${state?.provider?.fullName || ""}`} />
      <div style={{ padding: "8px 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="ችግሩን በአጭሩ ይግለጹ" value={description} onChange={setDescription} />
        <Field label="አድራሻ (ሰፈር/ቤት ቁጥር)" value={address} onChange={setAddress} />
        {error && <p style={{ color: "var(--danger)", fontSize: 13, margin: 0 }}>{error}</p>}
        <Button full disabled={loading || !description || !address} onClick={submit}>
          {loading ? "..." : "ማስያዣ ላክ"}
        </Button>
      </div>
    </div>
  );
}
