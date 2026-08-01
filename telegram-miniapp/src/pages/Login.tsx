import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Button } from "../components/ui";
import { BrandMark } from "../components/BrandMark";
import { ApiError } from "../lib/api";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(phone, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "መግባት አልተሳካም");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "48px 24px", maxWidth: 420, margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <BrandMark size={44} />
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "12px 0 4px" }}>Hulu Service</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>እንኳን ደህና መጡ</p>
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="ስልክ ቁጥር" value={phone} onChange={setPhone} placeholder="+251911223344" />
        <Field label="የይለፍ ቃል" value={password} onChange={setPassword} type="password" />
        {error && <p style={{ color: "var(--danger)", fontSize: 13, margin: 0 }}>{error}</p>}
        <div style={{ marginTop: 8 }}>
          <Button type="submit" full disabled={loading}>
            {loading ? "..." : "ግባ"}
          </Button>
        </div>
      </form>

      <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text-muted)" }}>
        አዲስ ነዎት? <Link to="/register">መለያ ይክፈቱ</Link>
      </p>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
      <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          padding: "12px 14px",
          color: "var(--text)",
          fontSize: 15,
        }}
      />
    </label>
  );
}
