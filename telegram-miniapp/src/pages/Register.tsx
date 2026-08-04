import { useState, useEffect, FormEvent, ReactNode } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Button } from "../components/ui";
import { LanguageToggle } from "../components/LanguageToggle";
import { BrandMark } from "../components/BrandMark";
import { Field } from "./Login";
import { useT } from "../lib/i18n";
import * as api from "../lib/api";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const t = useT();

  const [role, setRole] = useState<"customer" | "provider">("customer");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [categories, setCategories] = useState<api.Category[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [workAreas, setWorkAreas] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === "provider" && categories.length === 0) {
      api.listCategories().then((r) => setCategories(r.categories));
    }
  }, [role]);

  function toggleCategory(id: string) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (role === "provider" && categoryIds.length === 0) {
      setError(t("selectAtLeastOne"));
      return;
    }
    setLoading(true);
    try {
      await register({
        fullName,
        phone,
        password,
        role,
        city,
        language: "am",
        categoryIds: role === "provider" ? categoryIds : undefined,
        workAreas:
          role === "provider"
            ? workAreas.split(",").map((s) => s.trim()).filter(Boolean)
            : undefined,
        yearsExperience: role === "provider" ? Number(yearsExperience) || 0 : undefined,
      });
      navigate("/");
    } catch (err) {
      setError(err instanceof api.ApiError ? err.message : t("registrationFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "40px 24px 32px", maxWidth: 420, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <LanguageToggle />
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
        <BrandMark size={48} />
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "10px 0 0" }}>{t("createAccountTitle")}</h1>
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <RoleButton active={role === "customer"} onClick={() => setRole("customer")}>
            {t("roleCustomer")}
          </RoleButton>
          <RoleButton active={role === "provider"} onClick={() => setRole("provider")}>
            {t("roleProvider")}
          </RoleButton>
        </div>

        <Field label={t("fullName")} value={fullName} onChange={setFullName} />
        <Field label={t("phone")} value={phone} onChange={setPhone} placeholder="+251911223344" />
        <Field label={t("password")} value={password} onChange={setPassword} type="password" />
        <Field label={t("city")} value={city} onChange={setCity} placeholder="አዲስ አበባ" />

        {role === "provider" && (
          <>
            <div>
              <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                {t("servicesProvided")}
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {categories.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleCategory(c.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 600,
                      border: "1px solid var(--border)",
                      background: categoryIds.includes(c.id) ? "var(--accent)" : "var(--bg-elevated)",
                      color: categoryIds.includes(c.id) ? "var(--accent-ink)" : "var(--text)",
                    }}
                  >
                    {c.nameAm}
                  </button>
                ))}
              </div>
            </div>
            <Field
              label={t("workAreasCsv")}
              value={workAreas}
              onChange={setWorkAreas}
              placeholder="ቦሌ, ፒያሳ, ካዛንቺስ"
            />
            <Field label={t("yearsExperience")} value={yearsExperience} onChange={setYearsExperience} type="number" />
          </>
        )}

        {error && <p style={{ color: "var(--danger)", fontSize: 13, margin: 0 }}>{error}</p>}

        <div style={{ marginTop: 4 }}>
          <Button type="submit" full disabled={loading}>
            {loading ? "..." : t("register")}
          </Button>
        </div>
      </form>

      <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text-muted)" }}>
        {t("haveAccount")} <Link to="/login">{t("login")}</Link>
      </p>
    </div>
  );
}

function RoleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: "12px 8px",
        borderRadius: "var(--radius-sm)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        background: active ? "var(--accent-soft)" : "var(--bg-elevated)",
        color: active ? "var(--accent)" : "var(--text)",
        fontWeight: 700,
        fontSize: 14,
      }}
    >
      {children}
    </button>
  );
}
