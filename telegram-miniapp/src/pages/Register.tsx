import { useState, useEffect, FormEvent, ReactNode } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Button } from "../components/ui";
import { LanguageToggle } from "../components/LanguageToggle";
import { BrandMark } from "../components/BrandMark";
import { Field } from "./Login";
import { useT } from "../lib/i18n";
import * as api from "../lib/api";

// Every provider currently operates in Addis Ababa, so this is fixed
// rather than a free-text field — removes a whole class of typos/variants
// ("addis ababa", "Addis", "አዲስ አበባ" spelled differently, etc.) that would
// otherwise fragment how customers filter by city.
const FIXED_CITY = "አዲስ አበባ";

// Preset experience brackets instead of a free-typed number — keeps the
// data clean and matches how customers will actually want to filter later.
const EXPERIENCE_OPTIONS = [
  { value: 1, label: "1 ዓመት" },
  { value: 2, label: "2 ዓመት" },
  { value: 3, label: "3 ዓመት" },
  { value: 4, label: "ከ4 ዓመት በላይ" },
];

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const t = useT();

  const [role, setRole] = useState<"customer" | "provider">("customer");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [categories, setCategories] = useState<api.Category[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [workAreas, setWorkAreas] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState(
    EXPERIENCE_OPTIONS[0].value,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === "provider") {
      if (categories.length === 0)
        api.listCategories().then((r) => setCategories(r.categories));
      if (areas.length === 0) api.listAreas().then((r) => setAreas(r.areas));
    }
  }, [role]);

  function toggleCategory(id: string) {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  function toggleArea(area: string) {
    setWorkAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (role === "provider" && categoryIds.length === 0) {
      setError(t("selectAtLeastOne"));
      return;
    }
    if (role === "provider" && workAreas.length === 0) {
      setError(t("selectWorkArea"));
      return;
    }
    setLoading(true);
    try {
      await register({
        fullName,
        phone,
        password,
        role,
        city: FIXED_CITY,
        language: "am",
        categoryIds: role === "provider" ? categoryIds : undefined,
        workAreas: role === "provider" ? workAreas : undefined,
        yearsExperience: role === "provider" ? yearsExperience : undefined,
      });
      navigate("/");
    } catch (err) {
      setError(
        err instanceof api.ApiError ? err.message : t("registrationFailed"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "40px 24px 32px", maxWidth: 420, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 12,
        }}
      >
        <LanguageToggle />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <BrandMark size={48} />
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "10px 0 0" }}>
          {t("createAccountTitle")}
        </h1>
      </div>

      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <RoleButton
            active={role === "customer"}
            onClick={() => setRole("customer")}
          >
            {t("roleCustomer")}
          </RoleButton>
          <RoleButton
            active={role === "provider"}
            onClick={() => setRole("provider")}
          >
            {t("roleProvider")}
          </RoleButton>
        </div>

        <Field label={t("fullName")} value={fullName} onChange={setFullName} />
        <Field
          label={t("phone")}
          value={phone}
          onChange={setPhone}
          placeholder='+251911223344'
        />
        <Field
          label={t("password")}
          value={password}
          onChange={setPassword}
          type='password'
        />

        {/* City is fixed, shown read-only for transparency rather than a typed field */}
        <div>
          <span
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            {t("city")}
          </span>
          <div
            style={{
              marginTop: 6,
              background: "var(--bg-elevated-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "12px 14px",
              color: "var(--text-muted)",
              fontSize: 15,
            }}
          >
            {FIXED_CITY}
          </div>
        </div>

        {role === "provider" && (
          <>
            <ChipPicker
              label={t("servicesProvided")}
              options={categories.map((c) => ({ id: c.id, label: c.nameAm }))}
              selected={categoryIds}
              onToggle={toggleCategory}
            />

            <ChipPicker
              label={t("workAreasLabel")}
              options={areas.map((a) => ({ id: a, label: a }))}
              selected={workAreas}
              onToggle={toggleArea}
            />

            <div>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                {t("yearsExperience")}
              </span>
              <select
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 6,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "12px 14px",
                  color: "var(--text)",
                  fontSize: 15,
                }}
              >
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {error && (
          <p style={{ color: "var(--danger)", fontSize: 13, margin: 0 }}>
            {error}
          </p>
        )}

        <div style={{ marginTop: 4 }}>
          <Button type='submit' full disabled={loading}>
            {loading ? "..." : t("register")}
          </Button>
        </div>
      </form>

      <p
        style={{
          textAlign: "center",
          marginTop: 20,
          fontSize: 14,
          color: "var(--text-muted)",
        }}
      >
        {t("haveAccount")} <Link to='/login'>{t("login")}</Link>
      </p>
    </div>
  );
}

function ChipPicker({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <span
        style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}
      >
        {label}
      </span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
        {options.map((opt) => (
          <button
            type='button'
            key={opt.id}
            onClick={() => onToggle(opt.id)}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              border: "1px solid var(--border)",
              background: selected.includes(opt.id)
                ? "var(--accent)"
                : "var(--bg-elevated)",
              color: selected.includes(opt.id)
                ? "var(--accent-ink)"
                : "var(--text)",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
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
      type='button'
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
