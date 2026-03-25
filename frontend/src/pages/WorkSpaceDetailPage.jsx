import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchWorkspaces, inviteMember } from "../api/workspace.api.js";
import { useAuth } from "../context/authContext";

const ROLE_LABELS = { owner: "Owner", editor: "Editor", viewer: "Viewer" };
const ROLE_COLORS = {
  owner: "text-amber-400 bg-amber-400/10 border-amber-500/20",
  editor: "text-sky-400 bg-sky-400/10 border-sky-500/20",
  viewer: "text-neutral-400 bg-neutral-400/10 border-neutral-500/20",
};

function InvitePanel({ workspaceId, onInvited }) {
  const [form, setForm] = useState({ email: "", role: "editor" });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) return;
    setLoading(true);
    setStatus({ type: "", msg: "" });
    try {
      const result = await inviteMember(workspaceId, form.email, form.role);
      setStatus({ type: "success", msg: result.msg });
      setForm({ email: "", role: "editor" });
      if (result.workspace) onInvited(result.workspace);
    } catch (err) {
      setStatus({
        type: "error",
        msg: err.response?.data?.msg || "Failed to send invite",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl p-5">
      <h3 className="text-[13px] font-medium text-white mb-4 flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M9 8.5c1.5.5 3 1.5 3 3v.5H2v-.5c0-1.5 1.5-2.5 3-3"
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="7" cy="4.5" r="2.5" stroke="#f59e0b" strokeWidth="1.2" />
          <path
            d="M11 2v4M9 4h4"
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        Invite member
      </h3>

      {status.msg && (
        <div
          className={`text-[12px] px-3 py-2 rounded-lg mb-3 border ${
            status.type === "success"
              ? "text-emerald-400 bg-emerald-950/30 border-emerald-800/40"
              : "text-rose-400 bg-rose-950/30 border-rose-800/40"
          }`}
        >
          {status.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="colleague@company.com"
          required
          className="w-full bg-[#0a0a0a] border border-[#252525] rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder-neutral-700 focus:outline-none focus:border-amber-500/50 transition-colors"
        />
        <div className="flex gap-2">
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="flex-1 bg-[#0a0a0a] border border-[#252525] rounded-xl px-3 py-2.5 text-[13px] text-neutral-300 focus:outline-none focus:border-amber-500/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-black font-semibold text-[13px] rounded-xl transition-colors"
          >
            {loading ? "Sending…" : "Send invite"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function WorkspaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkspaces()
      .then((all) => {
        const found = all.find((w) => w._id === id);
        if (!found) navigate("/workspaces");
        else setWorkspace(found);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner =
    workspace?.owner?._id === user?.id || workspace?.owner === user?.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!workspace) return null;

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate("/workspaces")}
          className="flex items-center gap-1.5 text-[12px] text-neutral-600 hover:text-neutral-400 transition-colors mb-8 group"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="group-hover:-translate-x-0.5 transition-transform"
          >
            <path
              d="M7.5 2L3.5 6l4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Workspaces
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: info + members */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header card */}
            <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-base font-bold text-black flex-shrink-0">
                  {workspace.name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <h1
                    className="text-xl text-white font-medium tracking-tight"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                  >
                    {workspace.name}
                  </h1>
                  {workspace.description && (
                    <p className="text-[13px] text-neutral-500 mt-1">
                      {workspace.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-4 text-[12px] text-neutral-600 border-t border-[#1a1a1a] pt-4">
                <span>
                  {workspace.members?.length} member
                  {workspace.members?.length !== 1 ? "s" : ""}
                </span>
                <span>
                  {workspace.invites?.length || 0} pending invite
                  {workspace.invites?.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Members list */}
            <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl p-5">
              <h3 className="text-[13px] font-medium text-white mb-4">
                Members
              </h3>
              <div className="space-y-2">
                {workspace.members?.map((m, i) => {
                  const name =
                    m.user?.name || m.user?.email?.split("@")[0] || "Unknown";
                  const email = m.user?.email || "";
                  const initials = name[0]?.toUpperCase() || "?";
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-2 border-b border-[#141414] last:border-0"
                    >
                      <span className="w-8 h-8 rounded-full bg-[#1e1e1e] flex items-center justify-center text-[12px] text-neutral-400 flex-shrink-0">
                        {initials}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-white truncate">
                          {name}
                        </p>
                        <p className="text-[11px] text-neutral-600 truncate">
                          {email}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${ROLE_COLORS[m.role] || ROLE_COLORS.viewer}`}
                      >
                        {ROLE_LABELS[m.role] || m.role}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Pending invites */}
              {workspace.invites?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
                  <p className="text-[11px] uppercase tracking-widest text-neutral-700 mb-2">
                    Pending
                  </p>
                  {workspace.invites.map((inv, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5">
                      <span className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-dashed border-[#2a2a2a] flex items-center justify-center text-[12px] text-neutral-600">
                        ?
                      </span>
                      <span className="flex-1 text-[12px] text-neutral-600 truncate">
                        {inv.email}
                      </span>
                      <span className="text-[10px] text-neutral-700 border border-[#252525] px-2 py-0.5 rounded-full">
                        pending
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: invite panel (owner only) */}
          {isOwner && (
            <div>
              <InvitePanel
                workspaceId={workspace._id}
                onInvited={(updated) => setWorkspace(updated)}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .animate-spin { animation: spin 0.7s linear infinite; }
      `}</style>
    </div>
  );
}
