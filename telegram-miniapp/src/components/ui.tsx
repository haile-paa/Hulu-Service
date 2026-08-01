import { ReactNode, CSSProperties } from "react";
import { BrandMark } from "./BrandMark";
import { BookingStatus } from "../lib/api";

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
    primary: { background: "var(--accent)", color: "var(--accent-ink)" },
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
        fontWeight: 600,
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
        borderRadius: "var(--radius-md)",
        padding: 16,
        cursor: onClick ? "pointer" : undefined,
      }}
    >
      {children}
    </div>
  );
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "በመጠባበቅ ላይ",
  accepted: "ተቀባይነት አግኝቷል",
  rejected: "ውድቅ ተደርጓል",
  in_progress: "በሂደት ላይ",
  completed: "ተጠናቅቋል",
  cancelled: "ተሰርዟል",
};

const STATUS_COLOR: Record<BookingStatus, string> = {
  pending: "var(--accent)",
  accepted: "var(--success)",
  in_progress: "var(--success)",
  completed: "var(--text-muted)",
  rejected: "var(--danger)",
  cancelled: "var(--danger)",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const color = STATUS_COLOR[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        color,
        background: color + "22",
        padding: "4px 10px",
        borderRadius: 999,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color }} />
      {STATUS_LABEL[status]}
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
      {right}
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
