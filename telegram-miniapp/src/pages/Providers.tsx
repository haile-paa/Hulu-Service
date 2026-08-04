import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import * as api from "../lib/api";
import { TopBar, Card, EmptyState } from "../components/ui";
import { useT } from "../lib/i18n";

export function ProvidersPage() {
  const { categoryId = "" } = useParams();
  const location = useLocation();
  const categoryName = (location.state as { categoryName?: string } | null)?.categoryName;
  const navigate = useNavigate();
  const [providers, setProviders] = useState<api.Provider[] | null>(null);
  const t = useT();

  useEffect(() => {
    api.listProviders({ categoryId }).then((r) => setProviders(r.providers));
  }, [categoryId]);

  return (
    <div>
      <TopBar title={categoryName || t("providersFor")} />

      {providers === null && <div style={{ padding: 20, color: "var(--text-muted)" }}>{t("loading")}</div>}
      {providers?.length === 0 && <EmptyState title={t("noProvidersFound")} hint={t("tryAgainLater")} />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 20px 24px" }}>
        {providers?.map((p) => (
          <Card key={p.id} onClick={() => navigate(`/book/${p.id}`, { state: { provider: p, categoryId } })}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: p.isAvailable ? "var(--teal)" : "var(--text-muted)",
                    }}
                  />
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{p.fullName}</span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                  {p.city}
                  {p.workAreas?.length ? ` · ${p.workAreas.join(", ")}` : ""}
                </p>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                ⭐️ {p.ratingAvg.toFixed(1)}
              </span>
            </div>
            {p.bio && (
              <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--text-muted)" }}>{p.bio}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
