

import { useEffect, useState, useRef, useCallback } from "react";
import { fetchBoardActivity } from "../api/workspace.api.js";
import { useSocket } from "../context/SocketContext";

const ACTION_ICONS = {
  "card.created": { icon: "✦", color: "text-emerald-400" },
  "card.moved": { icon: "⇄", color: "text-sky-400" },
  "card.deleted": { icon: "✕", color: "text-rose-400" },
  "card.updated": { icon: "✎", color: "text-amber-400" },
  "list.created": { icon: "▤", color: "text-violet-400" },
  "list.renamed": { icon: "✎", color: "text-amber-400" },
  "member.invited": { icon: "⊕", color: "text-teal-400" },
  "board.updated": { icon: "◈", color: "text-neutral-400" },
};

function actorName(actor) {
  if (!actor) return "Someone";
  return actor.name || actor.email?.split("@")[0] || "Someone";
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function ActivityItem({ item, isNew }) {
  const meta = ACTION_ICONS[item.action] || {
    icon: "·",
    color: "text-neutral-500",
  };

  return (
    <div
      className={`flex items-start gap-3 py-3 border-b border-[#141414] last:border-0 transition-all duration-500 ${
        isNew ? "bg-amber-400/5 -mx-4 px-4 rounded-lg" : ""
      }`}
    >
      <span
        className={`text-sm mt-0.5 w-5 text-center flex-shrink-0 ${meta.color}`}
      >
        {meta.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-neutral-300 leading-relaxed">
          <span className="font-medium text-white">
            {actorName(item.actor)}
          </span>{" "}
          {item.summary.replace(actorName(item.actor), "").trim()}
        </p>
      </div>
      <span className="text-[10px] text-neutral-700 flex-shrink-0 mt-0.5">
        {timeAgo(item.createdAt)}
      </span>
    </div>
  );
}

export default function ActivityLog({ boardId }) {
  const { socket } = useSocket();
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newIds, setNewIds] = useState(new Set());

  const load = useCallback(
    async (p = 1, append = false) => {
      try {
        const data = await fetchBoardActivity(boardId, p);
        setActivities((prev) =>
          append ? [...prev, ...data.activities] : data.activities,
        );
        setPagination(data.pagination);
      } catch (err) {
        console.error("Failed to load activity:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [boardId],
  );

  useEffect(() => {
    setLoading(true);
    load(1, false);
  }, [boardId, load]);

  // Join board room and listen for new activity
  useEffect(() => {
    if (!socket || !boardId) return;
    socket.emit("board:join", boardId);

    const onActivity = (item) => {
      setActivities((prev) => [item, ...prev]);
      setNewIds((prev) => new Set(prev).add(item._id));
      // Remove highlight after 3s
      setTimeout(
        () =>
          setNewIds((prev) => {
            const next = new Set(prev);
            next.delete(item._id);
            return next;
          }),
        3000,
      );
    };

    socket.on("activity:new", onActivity);
    return () => {
      socket.off("activity:new", onActivity);
      socket.emit("board:leave", boardId);
    };
  }, [socket, boardId]);

  const handleLoadMore = async () => {
    if (!pagination?.hasNextPage || loadingMore) return;
    setLoadingMore(true);
    const next = page + 1;
    setPage(next);
    await load(next, true);
  };

  return (
    <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a] flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle
              cx="6.5"
              cy="6.5"
              r="5.5"
              stroke="#f59e0b"
              strokeWidth="1.2"
            />
            <path
              d="M6.5 3.5v3l2 1.5"
              stroke="#f59e0b"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[13px] font-medium text-white">Activity</span>
        </div>
        {pagination && (
          <span className="text-[10px] text-neutral-700">
            {pagination.total} events
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 scrollbar-thin">
        {loading ? (
          <div className="space-y-3 py-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-5 h-3 bg-[#1e1e1e] rounded mt-1" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-[#1e1e1e] rounded w-3/4" />
                  <div className="h-2.5 bg-[#1a1a1a] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-neutral-700 text-[13px]">No activity yet</p>
            <p className="text-neutral-800 text-[11px] mt-1">
              Actions on this board will appear here
            </p>
          </div>
        ) : (
          <div>
            {activities.map((item) => (
              <ActivityItem
                key={item._id}
                item={item}
                isNew={newIds.has(item._id)}
              />
            ))}

            {pagination?.hasNextPage && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full py-3 text-[12px] text-neutral-600 hover:text-neutral-400 transition-colors"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
