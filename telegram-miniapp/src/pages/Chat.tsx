import { useEffect, useRef, useState, FormEvent } from "react";
import { useParams } from "react-router-dom";
import * as api from "../lib/api";
import { useAuth } from "../lib/auth";
import { TopBar } from "../components/ui";

const POLL_MS = 4000;

export function ChatPage() {
  const { bookingId = "" } = useParams();
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<api.Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    let stopped = false;

    async function poll() {
      try {
        const r = await api.listMessages(token!, bookingId);
        if (!stopped) setMessages(r.messages);
      } catch {
        // ignore a failed tick, try again next interval
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [token, bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!token || !text.trim()) return;
    const body = text.trim();
    setText("");
    const { message } = await api.sendMessage(token, bookingId, body);
    setMessages((prev) => [...prev, message]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <TopBar title="ውይይት" />

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m) => {
          const mine = m.senderId === user?.id;
          return (
            <div
              key={m.id}
              style={{
                alignSelf: mine ? "flex-end" : "flex-start",
                maxWidth: "78%",
                background: mine ? "var(--accent)" : "var(--bg-elevated)",
                color: mine ? "var(--accent-ink)" : "var(--text)",
                borderRadius: 14,
                padding: "9px 13px",
                fontSize: 14,
              }}
            >
              {m.text}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={send}
        style={{
          display: "flex",
          gap: 8,
          padding: "10px 16px calc(10px + env(safe-area-inset-bottom))",
          borderTop: "1px solid var(--border)",
          background: "var(--bg-elevated)",
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="መልዕክት ይጻፉ..."
          style={{
            flex: 1,
            background: "var(--bg-elevated-2)",
            border: "1px solid var(--border)",
            borderRadius: 999,
            padding: "10px 16px",
            color: "var(--text)",
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          style={{
            background: "var(--accent)",
            color: "var(--accent-ink)",
            border: "none",
            borderRadius: 999,
            width: 42,
            fontWeight: 700,
          }}
        >
          ➤
        </button>
      </form>
    </div>
  );
}
