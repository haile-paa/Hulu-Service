import { useLang } from "../lib/i18n";

export function LanguageToggle() {
  const { lang, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      aria-label="Switch language"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        background: "var(--bg-elevated-2)",
        border: "1px solid var(--border)",
        borderRadius: 999,
        padding: "5px 4px",
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      <span
        style={{
          padding: "3px 8px",
          borderRadius: 999,
          background: lang === "am" ? "var(--accent)" : "transparent",
          color: lang === "am" ? "var(--accent-ink)" : "var(--text-muted)",
        }}
      >
        አማ
      </span>
      <span
        style={{
          padding: "3px 8px",
          borderRadius: 999,
          background: lang === "en" ? "var(--accent)" : "transparent",
          color: lang === "en" ? "var(--accent-ink)" : "var(--text-muted)",
        }}
      >
        EN
      </span>
    </button>
  );
}
