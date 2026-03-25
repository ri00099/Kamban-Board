import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWorkspaces, createWorkspace } from "../api/workspace.api.js";
import { useSocket } from "../context/SocketContext";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function WorkspaceCard({ ws, onClick }) {
  const memberCount = ws.members?.length || 0;
  const initials = ws.name.slice(0, 2).toUpperCase();

  return (
    <button
      onClick={onClick}
      className="group text-left w-full bg-[#111] border border-[#1e1e1e] rounded-2xl p-5 hover:border-[#333] hover:bg-[#141414] transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm font-bold text-black">
          {initials}
        </span>
        <span className="text-[10px] text-neutral-600 mt-1">
          {timeAgo(ws.updatedAt)}
        </span>
      </div>
      <h3 className="text-[15px] font-medium text-white mb-1 group-hover:text-amber-300 transition-colors truncate">
        {ws.name}
      </h3>
      {ws.description && (
        <p className="text-[12px] text-neutral-600 mb-3 line-clamp-2">
          {ws.description}
        </p>
      )}
      <div className="flex items-center gap-2 mt-auto">
        <div className="flex -space-x-1.5">
          {ws.members?.slice(0, 4).map((m, i) => (
            <span
              key={i}
              className="w-5 h-5 rounded-full bg-[#2a2a2a] border border-[#111] flex items-center justify-center text-[9px] text-neutral-400"
            >
              {(m.user?.name || m.user?.email || "?")[0].toUpperCase()}
            </span>
          ))}
        </div>
        <span className="text-[11px] text-neutral-600">
          {memberCount} member{memberCount !== 1 ? "s" : ""}
        </span>
        {ws.owner?._id === ws.owner?._id && (
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-500 border border-amber-500/20">
            owner
          </span>
        )}
      </div>
    </button>
  );
}

function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Name is required");
    setLoading(true);
    setError("");
    try {
      const ws = await createWorkspace(form);
      onCreate(ws);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#111] border border-[#252525] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-modal">
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-[17px] font-medium text-white"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            New workspace
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-[12px] text-rose-400 bg-rose-950/30 border border-rose-800/40 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-neutral-600">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="My workspace"
              className="w-full bg-[#0d0d0d] border border-[#252525] rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-neutral-700 focus:outline-none focus:border-amber-500/50 transition-colors"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-neutral-600">
              Description{" "}
              <span className="normal-case text-neutral-700">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="What's this workspace for?"
              rows={3}
              className="w-full bg-[#0d0d0d] border border-[#252525] rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-neutral-700 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#252525] text-[13px] text-neutral-400 hover:text-white hover:border-[#333] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-black font-semibold text-[13px] transition-colors"
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes modal-in { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .animate-modal { animation: modal-in 0.18s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default function WorkspacesPage() {
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchWorkspaces();
      setWorkspaces(data);
    } catch {
      setError("Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time: new workspace created (from another tab/device)
  useEffect(() => {
    if (!socket) return;
    const onCreated = (ws) => setWorkspaces((prev) => [ws, ...prev]);
    const onInvited = ({ workspace }) =>
      setWorkspaces((prev) => [...prev, workspace]);
    socket.on("workspace:created", onCreated);
    socket.on("workspace:invited", onInvited);
    return () => {
      socket.off("workspace:created", onCreated);
      socket.off("workspace:invited", onInvited);
    };
  }, [socket]);

  const handleCreated = (ws) => {
    setWorkspaces((prev) => [ws, ...prev]);
    setShowCreate(false);
  };

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-neutral-600 mb-1">
              Kanban
            </p>
            <h1
              className="text-3xl text-white tracking-tight"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Workspaces
            </h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold text-[13px] px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 1v10M1 6h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            New workspace
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-44 bg-[#111] border border-[#1a1a1a] rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-rose-400 text-sm">{error}</div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-12 h-12 rounded-2xl bg-[#111] border border-[#1e1e1e] flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect
                  x="1"
                  y="1"
                  width="8"
                  height="8"
                  rx="2"
                  stroke="#444"
                  strokeWidth="1.5"
                />
                <rect
                  x="11"
                  y="1"
                  width="8"
                  height="8"
                  rx="2"
                  stroke="#444"
                  strokeWidth="1.5"
                />
                <rect
                  x="1"
                  y="11"
                  width="8"
                  height="8"
                  rx="2"
                  stroke="#444"
                  strokeWidth="1.5"
                />
                <rect
                  x="11"
                  y="11"
                  width="8"
                  height="8"
                  rx="2"
                  stroke="#444"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <p className="text-neutral-500 text-sm mb-1">No workspaces yet</p>
            <p className="text-neutral-700 text-xs">
              Create one to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws._id}
                ws={ws}
                onClick={() => navigate(`/workspaces/${ws._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreated}
        />
      )}
    </div>
  );
}
