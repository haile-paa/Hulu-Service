import { NavLink } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useT } from "../lib/i18n";

const icon = {
  home: <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-7.5Z" />,
  bookings: <path d="M6 3h12a1 1 0 0 1 1 1v16l-7-3-7 3V4a1 1 0 0 1 1-1Z" />,
  profile: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0v1H5v-1Z" />,
};

function Icon({ name }: { name: keyof typeof icon }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      {icon[name]}
    </svg>
  );
}

export function BottomNav() {
  const { user } = useAuth();
  const t = useT();
  const items: { to: string; label: string; icon: keyof typeof icon }[] = [
    { to: "/", label: t("navHome"), icon: "home" },
    {
      to: user?.role === "provider" ? "/provider" : "/bookings",
      label: user?.role === "provider" ? t("navJobs") : t("navBookings"),
      icon: "bookings",
    },
    { to: "/profile", label: t("navProfile"), icon: "profile" },
  ];

  return (
    <nav
      style={{
        position: "sticky",
        bottom: 0,
        display: "flex",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-elevated)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            padding: "10px 0 8px",
            color: isActive ? "var(--accent)" : "var(--text-muted)",
            textDecoration: "none",
            fontSize: 11,
            fontWeight: 600,
          })}
        >
          <Icon name={item.icon} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
