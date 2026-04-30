import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  Upload,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { PHASES, ROLES, scoreConnection } from "../utils/helpers";

const PHASE_KEYS = Object.keys(PHASES);

export default function Connections({
  connections,
  onAdd,
  onUpdate,
  onImport,
  onSelect,
}) {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterPhase, setFilterPhase] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [sortDir, setSortDir] = useState("desc");
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 500;
  const [form, setForm] = useState({
    name: "",
    company: "",
    position: "",
    email: "",
    roleType: "Engineer",
    warmth: 3,
    relevance: 3,
  });

  const filtered = useMemo(() => {
    let list = [...connections];
    if (search)
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.company?.toLowerCase().includes(search.toLowerCase()),
      );
    if (filterRole) list = list.filter((c) => c.roleType === filterRole);
    if (filterPhase) list = list.filter((c) => c.phase === filterPhase);
    list.sort((a, b) => {
      let av, bv;
      if (sortBy === "score") {
        av = scoreConnection(a);
        bv = scoreConnection(b);
      } else if (sortBy === "name") {
        av = a.name;
        bv = b.name;
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      } else if (sortBy === "company") {
        av = a.company;
        bv = b.company;
        return sortDir === "asc"
          ? av?.localeCompare(bv)
          : bv?.localeCompare(av);
      } else if (sortBy === "phase") {
        av = PHASE_KEYS.indexOf(a.phase);
        bv = PHASE_KEYS.indexOf(b.phase);
      } else {
        av = a[sortBy] || 0;
        bv = b[sortBy] || 0;
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return list;
  }, [connections, search, filterRole, filterPhase, sortBy, sortDir]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }) =>
    sortBy === col ? (
      sortDir === "asc" ? (
        <ChevronUp size={13} />
      ) : (
        <ChevronDown size={13} />
      )
    ) : (
      <ChevronDown size={13} style={{ opacity: 0.3 }} />
    );

  const handleAdd = () => {
    onAdd({
      ...form,
      id: `manual_${Date.now()}`,
      phase: "not_started",
      notes: "",
      messages: [],
      lastContact: null,
    });
    setForm({
      name: "",
      company: "",
      position: "",
      email: "",
      roleType: "Engineer",
      warmth: 3,
      relevance: 3,
    });
    setShowAdd(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File name:", file.name);
      console.log("File size:", file.size);
      console.log("File type:", file.type);
      const reader = new FileReader();
      reader.onload = (evt) => {
        console.log(
          "Raw first 500 chars:",
          evt.target.result.substring(0, 500),
        );
      };
      reader.readAsText(file);
      onImport(file);
    }
    e.target.value = "";
  };

  return (
    <div>
      <div
        style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#555",
            }}
          />
          <input
            placeholder="Search by name or company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ width: "100%", paddingLeft: 36 }}
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value);
            setPage(1);
          }}
          style={{ width: 150 }}
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={filterPhase}
          onChange={(e) => {
            setFilterPhase(e.target.value);
            setPage(1);
          }}
          style={{ width: 160 }}
        >
          <option value="">All Phases</option>
          {Object.entries(PHASES).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <label
          style={{
            background: "#1e1e2e",
            border: "1px solid #2a2a3a",
            borderRadius: 8,
            padding: "8px 14px",
            cursor: "pointer",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#aaa",
            fontFamily: "Syne",
            transition: "all 0.2s",
          }}
        >
          <Upload size={14} /> Import CSV
          <input
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </label>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            background: "#4f6ef7",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            color: "#fff",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {showAdd && (
        <div
          style={{
            background: "#13131a",
            border: "1px solid #2a2a3a",
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontFamily: "Syne",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            Add Connection Manually
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <input
              placeholder="Full Name *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              placeholder="Company"
              value={form.company}
              onChange={(e) =>
                setForm((f) => ({ ...f, company: e.target.value }))
              }
            />
            <input
              placeholder="Position / Title"
              value={form.position}
              onChange={(e) =>
                setForm((f) => ({ ...f, position: e.target.value }))
              }
            />
            <input
              placeholder="Email (optional)"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
            <select
              value={form.roleType}
              onChange={(e) =>
                setForm((f) => ({ ...f, roleType: e.target.value }))
              }
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "#888",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Warmth ({form.warmth}/5)
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={form.warmth}
                onChange={(e) =>
                  setForm((f) => ({ ...f, warmth: +e.target.value }))
                }
                style={{
                  width: 120,
                  padding: 0,
                  border: "none",
                  background: "transparent",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "#888",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Relevance ({form.relevance}/5)
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={form.relevance}
                onChange={(e) =>
                  setForm((f) => ({ ...f, relevance: +e.target.value }))
                }
                style={{
                  width: 120,
                  padding: 0,
                  border: "none",
                  background: "transparent",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleAdd}
              disabled={!form.name}
              style={{
                background: "#4f6ef7",
                border: "none",
                borderRadius: 8,
                padding: "8px 20px",
                color: "#fff",
                fontSize: 14,
                opacity: form.name ? 1 : 0.5,
              }}
            >
              Save
            </button>
            <button
              onClick={() => setShowAdd(false)}
              style={{
                background: "transparent",
                border: "1px solid #2a2a3a",
                borderRadius: 8,
                padding: "8px 20px",
                color: "#888",
                fontSize: 14,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ fontSize: 12, color: "#555", marginBottom: 10 }}>
        {filtered.length} connections
      </div>

      <div
        style={{
          background: "#13131a",
          border: "1px solid #2a2a3a",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #2a2a3a" }}>
              {[
                ["name", "Name"],
                ["company", "Company"],
                ["roleType", "Role"],
                ["phase", "Phase"],
                ["score", "Score"],
              ].map(([col, label]) => (
                <th
                  key={col}
                  onClick={() => toggleSort(col)}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    color: "#666",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    fontFamily: "Syne",
                    cursor: "pointer",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    {label} <SortIcon col={col} />
                  </div>
                </th>
              ))}
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: 11,
                  color: "#666",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  fontFamily: "Syne",
                }}
              >
                Messages
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered
              .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
              .map((c) => {
                const score = scoreConnection(c);
                const phase = PHASES[c.phase] || PHASES.not_started;
                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelect(c)}
                    style={{
                      borderBottom: "1px solid #1a1a2a",
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#15151f")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "#1e1e3a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
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
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: "#e8e8f0",
                            }}
                          >
                            {c.name}
                          </div>
                          {c.email && (
                            <div style={{ fontSize: 11, color: "#555" }}>
                              {c.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "#aaa",
                        maxWidth: 160,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.company || "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          background: "#1e1e2e",
                          border: "1px solid #2a2a3a",
                          borderRadius: 20,
                          padding: "3px 10px",
                          color: "#888",
                        }}
                      >
                        {c.roleType || "Other"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          background: phase.color + "22",
                          border: `1px solid ${phase.color}44`,
                          borderRadius: 20,
                          padding: "3px 10px",
                          color: phase.color,
                        }}
                      >
                        {phase.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 4,
                            background: "#1e1e2e",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${score}%`,
                              height: "100%",
                              background:
                                score >= 70
                                  ? "#22c55e"
                                  : score >= 40
                                    ? "#f7a94f"
                                    : "#ef4444",
                              borderRadius: 2,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color:
                              score >= 70
                                ? "#22c55e"
                                : score >= 40
                                  ? "#f7a94f"
                                  : "#ef4444",
                            fontFamily: "Syne",
                          }}
                        >
                          {score}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "#555",
                      }}
                    >
                      {c.messages?.length || 0}
                    </td>
                  </tr>
                );
              })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "40px 16px",
                    textAlign: "center",
                    color: "#444",
                    fontSize: 14,
                  }}
                >
                  No connections found. Import your LinkedIn CSV or add
                  manually.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filtered.length > PAGE_SIZE && (
          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #1a1a2a",
            }}
          >
            <span style={{ fontSize: 12, color: "#555" }}>
              Showing {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  background: "#1e1e2e",
                  border: "1px solid #2a2a3a",
                  borderRadius: 6,
                  padding: "4px 12px",
                  color: page === 1 ? "#444" : "#aaa",
                  cursor: page === 1 ? "default" : "pointer",
                }}
              >
                Prev
              </button>
              <span style={{ fontSize: 12, color: "#666", padding: "4px 8px" }}>
                Page {page} of {Math.ceil(filtered.length / PAGE_SIZE)}
              </span>
              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(Math.ceil(filtered.length / PAGE_SIZE), p + 1),
                  )
                }
                disabled={page === Math.ceil(filtered.length / PAGE_SIZE)}
                style={{
                  background: "#1e1e2e",
                  border: "1px solid #2a2a3a",
                  borderRadius: 6,
                  padding: "4px 12px",
                  color:
                    page === Math.ceil(filtered.length / PAGE_SIZE)
                      ? "#444"
                      : "#aaa",
                  cursor:
                    page === Math.ceil(filtered.length / PAGE_SIZE)
                      ? "default"
                      : "pointer",
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
