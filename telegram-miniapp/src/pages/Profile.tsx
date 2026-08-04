import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { TopBar, Card, Button } from "../components/ui";
import { useT } from "../lib/i18n";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const t = useT();

  if (!user) return null;

  return (
    <div>
      <TopBar title={t("profile")} />
      <div style={{ padding: "8px 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <Card>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{user.fullName}</p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>{user.phone}</p>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>
            {user.role === "provider" ? "🛠" : "👤"}{" "}
            {user.role === "provider" ? t("roleProvider") : t("roleCustomer")}
          </p>
        </Card>
        <Button
          variant="danger"
          full
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          {t("logout")}
        </Button>
      </div>
    </div>
  );
}
