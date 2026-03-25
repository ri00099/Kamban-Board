import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";


const BOARD_COLORS = [
  { id: "amber",   hex: "#F59E0B", label: "Amber"   },
  { id: "rose",    hex: "#F43F5E", label: "Rose"    },
  { id: "violet",  hex: "#8B5CF6", label: "Violet"  },
  { id: "sky",     hex: "#0EA5E9", label: "Sky"     },
  { id: "emerald", hex: "#10B981", label: "Emerald" },
  { id: "orange",  hex: "#F97316", label: "Orange"  },
  { id: "pink",    hex: "#EC4899", label: "Pink"    },
  { id: "teal",    hex: "#14B8A6", label: "Teal"    },
];


function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}


function CreateBoardModal({ onClose, onCreate }) {
  const [title, setTitle]       = useState("");
  const [color, setColor]       = useState(BOARD_COLORS[0]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const inputRef                = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed) { setError("Board name is required."); return; }
    setLoading(true);
    setError("");
    try {
      await onCreate({ title: trimmed, color: color.hex, colorId: color.id });
      onClose();
    } catch {
      setError("Failed to create board. Try again.");
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: "20px",
          padding: "32px",
          width: "100%",
          maxWidth: "440px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          animation: "modalIn 0.18s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {/* Colour preview strip */}
        <div style={{
          height: "4px",
          borderRadius: "2px",
          background: color.hex,
          marginBottom: "24px",
          transition: "background 0.2s",
        }} />

        <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 600, marginBottom: "20px" }}>
          New Board
        </h2>

        {/* Title input */}
        <label style={{ display: "block", marginBottom: "16px" }}>
          <span style={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>
            Board name
          </span>
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. Product Roadmap"
            maxLength={60}
            style={{
              width: "100%",
              background: "#1a1a1a",
              border: `1px solid ${error ? "#ef4444" : "#2a2a2a"}`,
              borderRadius: "10px",
              padding: "12px 14px",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => { if (!error) e.target.style.borderColor = color.hex; }}
            onBlur={(e)  => { if (!error) e.target.style.borderColor = "#2a2a2a"; }}
          />
          {error && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "6px" }}>{error}</p>}
        </label>

        {/* Colour picker */}
        <label style={{ display: "block", marginBottom: "24px" }}>
          <span style={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "10px" }}>
            Colour
          </span>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {BOARD_COLORS.map((c) => (
              <button
                key={c.id}
                title={c.label}
                onClick={() => setColor(c)}
                style={{
                  width: "28px", height: "28px",
                  borderRadius: "50%",
                  background: c.hex,
                  border: color.id === c.id ? `2px solid #fff` : "2px solid transparent",
                  outline: color.id === c.id ? `2px solid ${c.hex}` : "none",
                  cursor: "pointer",
                  transition: "transform 0.1s, outline 0.1s",
                  transform: color.id === c.id ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </label>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: "transparent",
              border: "1px solid #2a2a2a",
              borderRadius: "10px",
              padding: "10px 18px",
              color: "#666",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            style={{
              background: loading || !title.trim() ? "#333" : color.hex,
              border: "none",
              borderRadius: "10px",
              padding: "10px 22px",
              color: loading || !title.trim() ? "#666" : "#000",
              fontSize: "13px",
              fontWeight: 700,
              cursor: loading || !title.trim() ? "not-allowed" : "pointer",
              transition: "background 0.2s, color 0.2s",
              minWidth: "100px",
            }}
          >
            {loading ? "Creating…" : "Create board"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
}

// ─── BoardCard ─────────────────────────────────────────────────────────────────
function BoardCard({ board, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const accentColor = board.color || "#F59E0B";
  const rgb = hexToRgb(accentColor);

  const totalCards = board.cardCount ?? board.cards?.length ?? 0;
  const todoCount  = board.todoCount  ?? board.cards?.filter(c => c.status === "todo").length       ?? 0;
  const doneCount  = board.doneCount  ?? board.cards?.filter(c => c.status === "done").length       ?? 0;
  const inProgCount= board.inProgCount?? board.cards?.filter(c => c.status === "in-progress").length?? 0;

  const progress = totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: "#0d0d0d",
        border: `1px solid ${hovered ? `rgba(${rgb}, 0.35)` : "#1a1a1a"}`,
        borderRadius: "16px",
        overflow: "hidden",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? `0 12px 40px rgba(${rgb}, 0.15)` : "none",
        cursor: "pointer",
      }}
    >
      {/* Colour accent top bar */}
      <div style={{
        height: "3px",
        background: accentColor,
        opacity: hovered ? 1 : 0.6,
        transition: "opacity 0.2s",
      }} />

      <Link to={`/boards/${board._id}`} style={{ textDecoration: "none", display: "block", padding: "20px 20px 16px" }}>
        {/* Title row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
          <h3 style={{
            color: "#fff",
            fontSize: "15px",
            fontWeight: 600,
            lineHeight: 1.3,
            maxWidth: "calc(100% - 36px)",
            wordBreak: "break-word",
          }}>
            {board.title}
          </h3>
          {/* Colour dot */}
          <div style={{
            width: "10px", height: "10px",
            borderRadius: "50%",
            background: accentColor,
            flexShrink: 0,
            marginTop: "4px",
            boxShadow: `0 0 8px ${accentColor}`,
          }} />
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "14px", marginBottom: "14px" }}>
          {[
            { label: "Total",       value: totalCards,  color: "#888"    },
            { label: "Todo",        value: todoCount,   color: "#888"    },
            { label: "In progress", value: inProgCount, color: accentColor },
            { label: "Done",        value: doneCount,   color: "#22c55e" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ color, fontSize: "16px", fontWeight: 700, lineHeight: 1 }}>{value}</span>
              <span style={{ color: "#444", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: "14px" }}>
          <div style={{
            height: "3px",
            background: "#1e1e1e",
            borderRadius: "2px",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${progress}%`,
              background: accentColor,
              borderRadius: "2px",
              transition: "width 0.4s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
            <span style={{ color: "#444", fontSize: "10px" }}>Progress</span>
            <span style={{ color: "#555", fontSize: "10px" }}>{progress}%</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#333", fontSize: "11px" }}>
            {board.createdAt ? `Created ${timeAgo(board.createdAt)}` : ""}
          </span>
          <span style={{
            fontSize: "11px",
            color: accentColor,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s",
            fontWeight: 500,
          }}>
            Open →
          </span>
        </div>
      </Link>

      {/* Delete button */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(board._id); }}
        title="Delete board"
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          width: "24px", height: "24px",
          background: hovered ? "rgba(239,68,68,0.12)" : "transparent",
          border: hovered ? "1px solid rgba(239,68,68,0.3)" : "1px solid transparent",
          borderRadius: "6px",
          color: hovered ? "#ef4444" : "transparent",
          fontSize: "12px",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
          zIndex: 2,
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{
      background: "#0d0d0d",
      border: "1px solid #1a1a1a",
      borderRadius: "16px",
      overflow: "hidden",
      height: "180px",
    }}>
      <div style={{ height: "3px", background: "#1e1e1e" }} />
      <div style={{ padding: "20px" }}>
        <div style={{ height: "14px", width: "55%", background: "#1a1a1a", borderRadius: "6px", marginBottom: "12px", animation: "pulse 1.4s ease-in-out infinite" }} />
        <div style={{ display: "flex", gap: "14px", marginBottom: "14px" }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: "28px", width: "36px", background: "#1a1a1a", borderRadius: "4px", animation: "pulse 1.4s ease-in-out infinite", animationDelay: `${i*0.1}s` }} />
          ))}
        </div>
        <div style={{ height: "3px", background: "#1a1a1a", borderRadius: "2px", marginBottom: "14px" }} />
        <div style={{ height: "10px", width: "30%", background: "#1a1a1a", borderRadius: "4px", animation: "pulse 1.4s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

// ─── BoardsPage ────────────────────────────────────────────────────────────────
export default function BoardsPage() {
  const [boards, setBoards]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError]         = useState("");

  const fetchBoards = async () => {
    try {
      setError("");
      const { data } = await client.get("/boards");
      setBoards(data);
    } catch {
      setError("Failed to load boards. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBoards(); }, []);

  // Keyboard shortcut: N to open modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "n" && !showModal && e.target.tagName !== "INPUT") {
        setShowModal(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  const createBoard = async (payload) => {
    const { data } = await client.post("/boards", payload);
    setBoards((prev) => [data, ...prev]);
  };

  const deleteBoard = async (id) => {
    if (!window.confirm("Delete this board and all its cards?")) return;
    try {
      await client.delete(`/boards/${id}`);
      setBoards((prev) => prev.filter((b) => b._id !== id));
    } catch {
      alert("Failed to delete board.");
    }
  };

  const totalCards = boards.reduce((sum, b) => sum + (b.cardCount ?? b.cards?.length ?? 0), 0);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "40px" }}>
        <div>
          <p style={{ color: "#444", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>
            Workspace
          </p>
          <h1 style={{ color: "#fff", fontSize: "36px", fontWeight: 700, lineHeight: 1, margin: 0 }}>
            Your Boards
          </h1>
          {!loading && boards.length > 0 && (
            <p style={{ color: "#444", fontSize: "13px", marginTop: "8px" }}>
              {boards.length} board{boards.length !== 1 ? "s" : ""} · {totalCards} card{totalCards !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "#F59E0B",
            border: "none",
            borderRadius: "12px",
            padding: "11px 22px",
            color: "#000",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "background 0.15s, transform 0.1s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#FBBF24"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#F59E0B"; e.currentTarget.style.transform = "none"; }}
          title="New board (N)"
        >
          <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span> New Board
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "12px",
          padding: "14px 18px",
          color: "#ef4444",
          fontSize: "13px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          {error}
          <button onClick={fetchBoards} style={{ background: "rgba(239,68,68,0.2)", border: "none", borderRadius: "6px", padding: "4px 10px", color: "#ef4444", cursor: "pointer", fontSize: "12px" }}>
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && boards.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <div style={{
            width: "64px", height: "64px",
            background: "#111",
            border: "1px solid #222",
            borderRadius: "16px",
            margin: "0 auto 20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "28px",
          }}>
            ◫
          </div>
          <p style={{ color: "#555", fontSize: "15px", marginBottom: "6px" }}>No boards yet</p>
          <p style={{ color: "#333", fontSize: "13px", marginBottom: "20px" }}>Create your first board to get started</p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: "transparent",
              border: "1px solid #F59E0B",
              borderRadius: "10px",
              padding: "9px 20px",
              color: "#F59E0B",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Create your first board →
          </button>
        </div>
      )}

      {/* Board grid */}
      {!loading && boards.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
          animation: "fadeIn 0.3s ease",
        }}>
          {boards.map((board, i) => (
            <div key={board._id} style={{ animation: `slideUp 0.3s ease both`, animationDelay: `${i * 0.04}s` }}>
              <BoardCard board={board} onDelete={deleteBoard} />
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateBoardModal onClose={() => setShowModal(false)} onCreate={createBoard} />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        * { box-sizing: border-box; }
        a { color: inherit; }
      `}</style>
    </div>
  );
}