import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../lib/api";
import { TopBar, EmptyState } from "../components/ui";
import { CategoryIcon } from "../components/CategoryIcon";

export function HomePage() {
  const [categories, setCategories] = useState<api.Category[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.listCategories().then((r) => setCategories(r.categories));
  }, []);

  return (
    <div>
      <TopBar title='Hulu Service' />
      <div style={{ padding: "8px 20px 4px" }}>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: 14,
            margin: "0 0 16px",
          }}
        >
          ምን አገልግሎት ይፈልጋሉ?
        </p>
      </div>

      {categories === null && (
        <div style={{ padding: 20, color: "var(--text-muted)" }}>
          በመጫን ላይ...
        </div>
      )}
      {categories?.length === 0 && <EmptyState title='ምድቦች የሉም' />}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          padding: "0 20px 24px",
        }}
      >
        {categories?.map((c) => (
          <CategoryCard
            key={c.id}
            category={c}
            onClick={() =>
              navigate(`/providers/${c.id}`, {
                state: { categoryName: c.nameAm },
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  onClick,
}: {
  category: api.Category;
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
          background: "var(--accent-soft)",
          color: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CategoryIcon name={category.icon} size={22} />
      </span>
      <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>
        {category.nameAm}
      </span>
    </button>
  );
}
