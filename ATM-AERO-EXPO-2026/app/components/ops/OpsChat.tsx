"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useIsOffline } from "../../hooks/useIsOffline";

type ChatMessage = { id?: string; author: string; text: string; timestamp: string; editedAt?: string };

function formatTs(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit" });
}

function exportToMarkdown(messages: ChatMessage[]) {
  const lines = [
    "# AERO EXPO 2026 – Týmový chat",
    `Exportováno: ${new Date().toLocaleString("cs-CZ")}`,
    "",
    "---",
    "",
  ];
  let lastDate = "";
  for (const msg of messages) {
    const date = formatDate(msg.timestamp);
    if (date !== lastDate) {
      lines.push(`## ${date}`, "");
      lastDate = date;
    }
    lines.push(`**${msg.author}** · ${formatTs(msg.timestamp)}`);
    lines.push(msg.text);
    lines.push("");
  }
  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aero-expo-2026-chat-${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OpsChat() {
  const isOffline = useIsOffline();
  const { data: session } = useSession();
  const author = session?.user?.name ?? "";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/chat");
      const data: ChatMessage[] = await res.json();
      setMessages(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!author || !text.trim()) return;
    setSending(true);
    const optimistic: ChatMessage = { author, text: text.trim(), timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, text: optimistic.text }),
      });
      const updated: ChatMessage[] = await res.json();
      setMessages(updated);
    } catch {
      // ignore
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const startEdit = (msg: ChatMessage) => {
    setEditingId(msg.id ?? msg.timestamp);
    setEditText(msg.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim()) return;
    setEditSaving(true);
    try {
      const res = await fetch("/api/chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, text: editText }),
      });
      const updated: ChatMessage[] = await res.json();
      setMessages(updated);
      setEditingId(null);
    } catch {
      // ignore
    } finally {
      setEditSaving(false);
    }
  };

  const clearAll = async () => {
    setShowClear(false);
    await fetch("/api/chat", { method: "DELETE" });
    setMessages([]);
  };

  return (
    <div className="flex flex-col gap-3" style={{ height: "100%" }}>

      {/* Identity bar */}
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-2.5 rounded-lg"
        style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            background: isOffline ? "#f97316" : "#22c55e",
            boxShadow: isOffline ? "0 0 6px rgba(249,115,22,0.5)" : "0 0 6px rgba(34,197,94,0.5)",
          }}
        />
        <span className="text-sm font-bold flex-shrink-0" style={{ color: "var(--color-at-white)" }}>
          {author}
        </span>
        <span className="hidden sm:inline text-xs" style={{ color: "var(--color-at-blue-v4)" }}>
          {isOffline ? "· offline" : "· přihlášen/a přes Google"}
        </span>
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => exportToMarkdown(messages)}
            disabled={messages.length === 0}
            className="text-xs font-bold px-3 py-1 rounded"
            style={{
              background: "var(--color-at-blue-v3)",
              color: "var(--color-at-white)",
              border: "1px solid var(--color-at-blue-v3)",
              opacity: messages.length === 0 ? 0.4 : 1,
            }}
          >
            Exportovat .md
          </button>
          <button
            onClick={() => setShowClear(true)}
            disabled={messages.length === 0}
            className="text-xs px-3 py-1 rounded"
            style={{ color: "var(--color-at-blue-v4)", opacity: messages.length === 0 ? 0.4 : 1 }}
          >
            Smazat
          </button>
        </div>
      </div>

      {/* Confirm clear */}
      {showClear && (
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm"
          style={{ background: "rgba(213,28,23,0.12)", border: "1px solid rgba(213,28,23,0.3)" }}
        >
          <span style={{ color: "var(--color-at-white)" }}>Smazat celý chat? Akce je nevratná.</span>
          <button onClick={clearAll} className="font-bold text-xs px-3 py-1 rounded" style={{ background: "var(--color-at-red)", color: "var(--color-at-white)" }}>
            Smazat
          </button>
          <button onClick={() => setShowClear(false)} className="text-xs" style={{ color: "var(--color-at-blue-v5)", textDecoration: "underline" }}>
            Zrušit
          </button>
        </div>
      )}

      {/* Messages */}
      <div
        className="flex flex-col gap-2 overflow-y-auto rounded-xl px-4 py-3"
        style={{
          background: "var(--color-at-blue-v1)",
          border: "1px solid var(--color-at-blue-v2)",
          minHeight: 200,
          height: "clamp(200px, 55vh, 640px)",
        }}
      >
        {messages.length === 0 && (
          <p className="text-sm text-center my-auto" style={{ color: "var(--color-at-blue-v4)" }}>
            Chat je zatím prázdný. Začni psát první zprávu.
          </p>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.author === author;
          const msgId = msg.id ?? msg.timestamp;
          const isEditing = editingId === msgId;
          return (
            <div key={i} className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black" style={{ color: isMe ? "var(--color-at-red)" : "var(--color-at-blue-v5)" }}>
                  {msg.author}
                </span>
                <span className="text-xs" style={{ color: "var(--color-at-blue-v4)" }}>
                  {formatTs(msg.timestamp)}
                </span>
                {msg.editedAt && (
                  <span className="text-xs" style={{ color: "var(--color-at-blue-v4)" }}>
                    · upraveno {formatTs(msg.editedAt)}
                  </span>
                )}
                {isMe && !isEditing && (
                  <button
                    onClick={() => startEdit(msg)}
                    className="text-xs"
                    style={{ color: "var(--color-at-blue-v4)", textDecoration: "underline" }}
                  >
                    upravit
                  </button>
                )}
              </div>

              {!isEditing && (
                <div
                  className="text-sm px-3 py-2 rounded-lg max-w-xs sm:max-w-sm"
                  style={{
                    background: isMe ? "var(--color-at-blue-v3)" : "var(--color-at-blue-v2)",
                    color: "var(--color-at-white)",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.text}
                </div>
              )}

              {isEditing && (
                <div className="flex flex-col gap-1.5 w-full max-w-xs sm:max-w-sm">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(msgId); }
                      if (e.key === "Escape") cancelEdit();
                    }}
                    rows={3}
                    autoFocus
                    className="rounded-lg px-3 py-2 text-sm resize-none focus:outline-none"
                    style={{
                      background: "var(--color-at-blue-v2)",
                      border: "1px solid var(--color-at-blue-v3)",
                      color: "var(--color-at-white)",
                    }}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={cancelEdit}
                      className="text-xs"
                      style={{ color: "var(--color-at-blue-v5)", textDecoration: "underline" }}
                    >
                      Zrušit
                    </button>
                    <button
                      onClick={() => saveEdit(msgId)}
                      disabled={!editText.trim() || editSaving}
                      className="text-xs font-bold px-3 py-1 rounded-lg"
                      style={{
                        background: "var(--color-at-red)",
                        color: "var(--color-at-white)",
                        opacity: !editText.trim() ? 0.4 : 1,
                      }}
                    >
                      {editSaving ? "Ukládám…" : "Uložit"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Offline notice */}
      {isOffline && (
        <div
          className="px-4 py-2 rounded-lg text-xs text-center"
          style={{
            background: "rgba(249,115,22,0.1)",
            border: "1px solid rgba(249,115,22,0.25)",
            color: "#f97316",
          }}
        >
          Offline – odesílání zpráv není dostupné. Zobrazuji naposledy načtené zprávy.
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
          }}
          placeholder={isOffline ? "Offline – odesílání není dostupné" : "Napiš zprávu… (Enter = odeslat, Shift+Enter = nový řádek)"}
          rows={2}
          disabled={isOffline}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none"
          style={{
            background: "var(--color-at-blue-v1)",
            border: "1px solid var(--color-at-blue-v2)",
            color: "var(--color-at-white)",
            opacity: isOffline ? 0.5 : 1,
          }}
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending || isOffline}
          className="rounded-xl px-4 py-2.5 text-sm font-black flex-shrink-0 transition-all"
          style={{
            background: "var(--color-at-red)",
            color: "var(--color-at-white)",
            opacity: !text.trim() || isOffline ? 0.4 : 1,
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}
