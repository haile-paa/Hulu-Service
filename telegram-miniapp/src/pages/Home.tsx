import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../lib/api";
import { TopBar, EmptyState } from "../components/ui";

export function HomePage() {
  const [categories, setCategories] = useState<api.Category[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.listCategories().then((r) => setCategories(r.categories));
  }, []);

  return (
    <div>
      <TopBar title="Hulu Service" />
      <div style={{ padding: "8px 20px 4px" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "0 0 16px" }}>
          ምን አገልግሎት ይፈልጋሉ?
        </p>
      </div>

      {categories === null && (
        <div style={{ padding: 20, color: "var(--text-muted)" }}>በመጫን ላይ...</div>
      )}
      {categories?.length === 0 && <EmptyState title="ምድቦች የሉም" />}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          padding: "0 20px 24px",
        }}
      >
        {categories?.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/providers/${c.id}`, { state: { categoryName: c.nameAm } })}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "18px 14px",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              color: "var(--text)",
            }}
          >
            <span style={{ fontSize: 26 }}>{c.icon || "🛠"}</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{c.nameAm}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
