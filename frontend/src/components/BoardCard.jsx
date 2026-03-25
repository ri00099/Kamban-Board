import { Link } from "react-router-dom";

export default function BoardCard({ board, onDelete }) {
  const accent = board.color || "#f59e0b";

  return (
    <div className="group relative bg-[#161616] border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-[#3a3a3a] transition-colors">
      {/* Color bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />

      <div className="p-5">
        <Link to={`/boards/${board._id}`}>
          <h3 className="font-medium text-white text-base mb-1 group-hover:text-amber-400 transition-colors truncate">
            {board.title}
          </h3>
          <p className="text-xs text-neutral-500">
            {board.cards?.length ?? 0} cards
          </p>
        </Link>

        <button
          onClick={() => onDelete(board._id)}
          className="mt-4 text-xs text-neutral-600 hover:text-red-400 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}