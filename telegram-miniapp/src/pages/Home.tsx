import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../lib/api";
import { TopBar, EmptyState } from "../components/ui";
import { CategoryIcon } from "../components/CategoryIcon";
import { useT, useLang } from "../lib/i18n";

export function HomePage() {
  const [categories, setCategories] = useState<api.Category[] | null>(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLang();

  useEffect(() => {
    api.listCategories().then((r) => setCategories(r.categories));
  }, []);

  const filtered = useMemo(() => {
    if (!categories) return null;
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) => c.nameAm.toLowerCase().includes(q) || c.nameEn.toLowerCase().includes(q)
    );
  }, [categories, query]);

  return (
    <div>
      <TopBar title={t("appName")} />
      <div style={{ padding: "8px 20px 4px" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "0 0 14px" }}>
          {t("whatServiceNeed")}
        </p>

        <div style={{ position: "relative", marginBottom: 16 }}>
          <SearchIcon />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchCategories")}
            style={{
              width: "100%",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              padding: "12px 16px 12px 40px",
              color: "var(--text)",
              fontSize: 14,
            }}
          />
        </div>
      </div>

      {categories === null && <div style={{ padding: 20, color: "var(--text-muted)" }}>{t("loading")}</div>}
      {filtered?.length === 0 && <EmptyState title={t("noResultsFor")} />}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          padding: "0 20px 24px",
        }}
      >
        {filtered?.map((c) => (
          <CategoryCard
            key={c.id}
            category={c}
            label={lang === "am" ? c.nameAm : c.nameEn}
            onClick={() => navigate(`/providers/${c.id}`, { state: { categoryName: lang === "am" ? c.nameAm : c.nameEn } })}
          />
        ))}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CategoryCard({
  category,
  label,
  onClick,
}: {
  category: api.Category;
  label: string;
  onClick: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderTop: "1px solid var(--card-highlight)",
        borderRadius: "var(--radius-md)",
        padding: "18px 16px",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        color: "var(--text)",
        transform: pressed ? "scale(0.97)" : "scale(1)",
        transition: "transform 0.08s ease",
      }}
    >
      <span
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: "linear-gradient(135deg, var(--accent-soft), var(--teal-soft))",
          color: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CategoryIcon name={category.icon} size={22} />
      </span>
      <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{label}</span>
    </button>
  );
}
