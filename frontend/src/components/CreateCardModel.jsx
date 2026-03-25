import { useState } from "react";

const STATUSES = ["todo", "in-progress", "done"];

export default function CreateCardModal({ boardId, onClose, onCreate }) {
  const [form, setForm] = useState({ title: "", description: "", status: "todo" });
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  const payload = {
    title: form.title,
    description: form.description,
    status: form.status,
    boardId: boardId,
    columnId: "65f1a2b3c4d5e6f7a8b9c0d1", 
    position: 0
  };

  try {
    await onCreate(payload);
    onClose();
  } catch (err) {
    console.error("Failed to create card:", err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-2xl text-white mb-6">New Card</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Title</label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Card title"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
              rows={3}
              placeholder="Optional description…"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Status</label>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`flex-1 py-2 rounded-lg text-xs capitalize transition-colors ${
                    form.status === s
                      ? "bg-amber-400 text-black font-medium"
                      : "bg-[#111] border border-[#2a2a2a] text-neutral-400 hover:border-neutral-500"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-[#2a2a2a] text-neutral-400 hover:text-white py-2.5 rounded-lg text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50">
              {loading ? "Adding…" : "Add Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}