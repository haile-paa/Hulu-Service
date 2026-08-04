import { ReactNode, CSSProperties } from "react";
import { BrandMark } from "./BrandMark";
import { LanguageToggle } from "./LanguageToggle";
import { BookingStatus } from "../lib/api";
import { useT, DictKey } from "../lib/i18n";

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  full,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  full?: boolean;
}) {
  const styles: Record<string, CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg, var(--accent-2), var(--accent))",
      color: "var(--accent-ink)",
    },
    secondary: { background: "var(--bg-elevated-2)", color: "var(--text)" },
    danger: { background: "var(--danger-soft)", color: "var(--danger)" },
    ghost: { background: "transparent", color: "var(--text-muted)" },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        border: "none",
        borderRadius: "var(--radius-sm)",
        padding: "13px 18px",
        fontSize: 15,
        fontWeight: 700,
        width: full ? "100%" : undefined,
        opacity: disabled ? 0.5 : 1,
        transition: "transform 0.08s ease",
      }}
      onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
      onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

export function Card({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderTop: "1px solid var(--card-highlight)",
        borderRadius: "var(--radius-md)",
        padding: 16,
        cursor: onClick ? "pointer" : undefined,
        boxShadow: "0 1px 0 var(--card-highlight) inset",
      }}
    >
      {children}
    </div>
  );
}

const STATUS_KEY: Record<BookingStatus, DictKey> = {
  pending: "statusPending",
  accepted: "statusAccepted",
  rejected: "statusRejected",
  in_progress: "statusInProgress",
  completed: "statusCompleted",
  cancelled: "statusCancelled",
};

const STATUS_COLOR: Record<BookingStatus, string> = {
  pending: "var(--accent)",
  accepted: "var(--teal)",
  in_progress: "var(--teal)",
  completed: "var(--text-muted)",
  rejected: "var(--danger)",
  cancelled: "var(--danger)",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const t = useT();
  const color = STATUS_COLOR[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 700,
        color,
        background: color + "22",
        padding: "4px 10px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color }} />
      {t(STATUS_KEY[status])}
    </span>
  );
}

export function TopBar({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px 8px",
        position: "sticky",
        top: 0,
        background: "var(--bg)",
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <BrandMark size={22} />
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {right}
        <LanguageToggle />
      </div>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
        <BrandMark size={36} />
      </div>
      <p style={{ fontWeight: 600, color: "var(--text)", margin: "0 0 4px" }}>{title}</p>
      {hint && <p style={{ fontSize: 13, margin: 0 }}>{hint}</p>}
    </div>
  );
}
