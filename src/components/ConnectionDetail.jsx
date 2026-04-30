import React, { useState } from "react";
import {
  X,
  Send,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
} from "lucide-react";
import {
  PHASES,
  ROLES,
  scoreConnection,
  callGroq,
  getSentiment,
} from "../utils/helpers";

const PHASE_PROMPTS = {
  not_started:
    "Phase 1 - Warm reconnect: Write a natural, brief LinkedIn message reconnecting with this person. Reference something genuine about their work or company. No ask yet. Just re-establish the connection warmly.",
  warmup:
    "Phase 2 - Value add follow-up: Write a short message sharing something genuinely useful — an insight, article angle, or observation relevant to their role. Keep it conversational, no ask yet.",
  active:
    "Phase 3 - Coffee chat request: Write a short message requesting a 15-minute virtual coffee. Be specific about what you want to learn from them. Make it easy to say yes.",
  referral_asked:
    "Phase 4 - Referral ask: Write a respectful, direct message asking if they would be willing to refer you for a role at their company or a company they know well. Acknowledge their time, be specific about the role type you are targeting.",
};

export default function ConnectionDetail({
  connection,
  onUpdate,
  onClose,
  groqKey,
  myRole,
  myBackground,
}) {
  const [msgInput, setMsgInput] = useState("");
  const [msgDir, setMsgDir] = useState("sent");
  const [generating, setGenerating] = useState(false);
  const [generatedMsg, setGeneratedMsg] = useState("");
  const [genError, setGenError] = useState("");
  const [editField, setEditField] = useState(null);

  const c = connection;
  const score = scoreConnection(c);
  const phase = PHASES[c.phase] || PHASES.not_started;

  const update = (fields) => onUpdate({ ...c, ...fields });

  const addMessage = () => {
    if (!msgInput.trim()) return;
    const msg = {
      id: Date.now(),
      text: msgInput.trim(),
      direction: msgDir,
      date: new Date().toISOString(),
      sentiment: msgDir === "received" ? getSentiment(msgInput) : null,
    };
    const newPhase =
      c.phase === "not_started" && msgDir === "sent" ? "warmup" : c.phase;
    update({
      messages: [...(c.messages || []), msg],
      lastContact: new Date().toISOString(),
      phase: newPhase,
    });
    setMsgInput("");
  };

  const deleteMessage = (id) =>
    update({ messages: c.messages.filter((m) => m.id !== id) });

  const generateMessage = async () => {
    if (!groqKey) {
      setGenError("Please add your Groq API key in Settings first.");
      return;
    }
    setGenerating(true);
    setGenError("");
    setGeneratedMsg("");
    try {
      const phasePrompt = PHASE_PROMPTS[c.phase] || PHASE_PROMPTS.not_started;
      const context = [
        `Their name: ${c.name}`,
        `Their company: ${c.company || "unknown"}`,
        `Their role: ${c.position || c.roleType}`,
        `My name: ${myBackground?.name || "me"}`,
        `My current role/target: ${myRole || "software engineer"}`,
        `My background: ${myBackground?.bio || ""}`,
        `Previous messages exchanged: ${c.messages?.length || 0}`,
        c.notes ? `My notes about them: ${c.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const system = `You are a professional relationship coach. Write authentic, personalized LinkedIn messages that feel human and genuine. Never use buzzwords, never sound like a template. Keep messages under 100 words. Do not use greetings like "Hope this message finds you well".`;
      const result = await callGroq(
        groqKey,
        system,
        `${phasePrompt}\n\nContext:\n${context}\n\nWrite only the message text, nothing else.`,
      );
      setGeneratedMsg(result.trim());
    } catch (e) {
      setGenError(e.message || "Failed to generate. Check your Groq API key.");
    }
    setGenerating(false);
  };

  const sentimentColor = {
    positive: "#22c55e",
    neutral: "#f7a94f",
    negative: "#ef4444",
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: 520,
        background: "#0d0d14",
        borderLeft: "1px solid #2a2a3a",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid #1e1e2e",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#1e1e3a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 600,
              color: "#4f6ef7",
              flexShrink: 0,
            }}
          >
            {c.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: "Syne", fontSize: 16, fontWeight: 600 }}>
              {c.name}
            </div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
              {c.position || c.roleType} {c.company ? `· ${c.company}` : ""}
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 8,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  background: phase.color + "22",
                  border: `1px solid ${phase.color}44`,
                  borderRadius: 20,
                  padding: "2px 10px",
                  color: phase.color,
                }}
              >
                {phase.label}
              </span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: "Syne",
                  color:
                    score >= 70
                      ? "#22c55e"
                      : score >= 40
                        ? "#f7a94f"
                        : "#ef4444",
                }}
              >
                {score}
              </span>
              <span style={{ fontSize: 11, color: "#555" }}>
                priority score
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#555",
            padding: 4,
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div>
            <label
              style={{
                fontSize: 11,
                color: "#555",
                display: "block",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Phase
            </label>
            <select
              value={c.phase}
              onChange={(e) => update({ phase: e.target.value })}
              style={{ width: "100%", fontSize: 13 }}
            >
              {Object.entries(PHASES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                color: "#555",
                display: "block",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Role Type
            </label>
            <select
              value={c.roleType || "Other"}
              onChange={(e) => update({ roleType: e.target.value })}
              style={{ width: "100%", fontSize: 13 }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                color: "#555",
                display: "block",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Warmth ({c.warmth || 1}/5)
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={c.warmth || 1}
              onChange={(e) => update({ warmth: +e.target.value })}
              style={{
                width: "100%",
                padding: 0,
                border: "none",
                background: "transparent",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                color: "#555",
                display: "block",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Relevance ({c.relevance || 1}/5)
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={c.relevance || 1}
              onChange={(e) => update({ relevance: +e.target.value })}
              style={{
                width: "100%",
                padding: 0,
                border: "none",
                background: "transparent",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 11,
              color: "#555",
              display: "block",
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Notes
          </label>
          <textarea
            value={c.notes || ""}
            onChange={(e) => update({ notes: e.target.value })}
            rows={3}
            placeholder="Add context, observations, common interests..."
            style={{ width: "100%", resize: "vertical", fontSize: 13 }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontFamily: "Syne",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 12,
              color: "#e8e8f0",
            }}
          >
            AI Message Generator
          </div>
          <button
            onClick={generateMessage}
            disabled={generating}
            style={{
              background: generating ? "#1e1e2e" : "#4f6ef7",
              border: "none",
              borderRadius: 8,
              padding: "9px 16px",
              color: "#fff",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
              opacity: generating ? 0.7 : 1,
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Sparkles size={14} />{" "}
            {generating ? "Generating..." : `Generate ${phase.label} Message`}
          </button>
          {genError && (
            <div
              style={{
                fontSize: 12,
                color: "#ef4444",
                marginBottom: 8,
                padding: "8px 12px",
                background: "#ef444411",
                borderRadius: 6,
              }}
            >
              {genError}
            </div>
          )}
          {generatedMsg && (
            <div
              style={{
                background: "#13131a",
                border: "1px solid #4f6ef744",
                borderRadius: 8,
                padding: 14,
                fontSize: 13,
                color: "#ccc",
                lineHeight: 1.6,
                position: "relative",
              }}
            >
              <div style={{ marginBottom: 8 }}>{generatedMsg}</div>
              <button
                onClick={() => {
                  setMsgInput(generatedMsg);
                  setMsgDir("sent");
                  setGeneratedMsg("");
                }}
                style={{
                  background: "#4f6ef722",
                  border: "1px solid #4f6ef744",
                  borderRadius: 6,
                  padding: "4px 10px",
                  color: "#4f6ef7",
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                Use this message ↓
              </button>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontFamily: "Syne",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 12,
              color: "#e8e8f0",
            }}
          >
            Message History ({c.messages?.length || 0})
          </div>
          {(!c.messages || c.messages.length === 0) && (
            <div style={{ fontSize: 13, color: "#444", marginBottom: 12 }}>
              No messages logged yet.
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {(c.messages || []).map((m) => (
              <div
                key={m.id}
                style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
              >
                <div
                  style={{
                    flex: 1,
                    background: m.direction === "sent" ? "#1a1a2e" : "#1a2a1a",
                    border: `1px solid ${m.direction === "sent" ? "#2a2a4a" : "#2a4a2a"}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      {m.direction === "sent" ? (
                        <ArrowUpRight size={12} color="#4f6ef7" />
                      ) : (
                        <ArrowDownLeft size={12} color="#22c55e" />
                      )}
                      <span
                        style={{
                          fontSize: 11,
                          color: m.direction === "sent" ? "#4f6ef7" : "#22c55e",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {m.direction}
                      </span>
                      {m.sentiment && (
                        <span
                          style={{
                            fontSize: 10,
                            background: sentimentColor[m.sentiment] + "22",
                            color: sentimentColor[m.sentiment],
                            borderRadius: 20,
                            padding: "1px 7px",
                          }}
                        >
                          {m.sentiment}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: "#444" }}>
                      {new Date(m.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "#bbb", lineHeight: 1.5 }}>
                    {m.text}
                  </div>
                </div>
                <button
                  onClick={() => deleteMessage(m.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#333",
                    padding: 4,
                    marginTop: 4,
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <select
              value={msgDir}
              onChange={(e) => setMsgDir(e.target.value)}
              style={{ width: 90, fontSize: 13 }}
            >
              <option value="sent">Sent</option>
              <option value="received">Received</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <textarea
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder="Paste message text here to log it..."
              rows={3}
              style={{ flex: 1, resize: "none", fontSize: 13 }}
            />
            <button
              onClick={addMessage}
              disabled={!msgInput.trim()}
              style={{
                background: "#4f6ef7",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                color: "#fff",
                opacity: msgInput.trim() ? 1 : 0.4,
                alignSelf: "flex-end",
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
