import client from "../api/client";

export default function CardItem({ card, onUpdate, onDelete }) {


  const cycleStatus = async (e) => {
    e.stopPropagation();
    const STATUSES = ["todo", "in-progress", "done"];
    const nextIndex = (STATUSES.indexOf(card.status) + 1) % STATUSES.length;
    
    try {
      const { data } = await client.patch(`/cards/${card._id}`, {
        status: STATUSES[nextIndex],
        version: card.version // Send the version the server expects
      });
      // This 'data' contains the incremented version (e.g., 17)
      onUpdate(data); 
    } catch (err) {
      alert("Conflict: Please refresh the board.");
    }
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-xl hover:border-[#3a3a3a] group transition-all">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-white">{card.title}</h3>
        <button onClick={() => onDelete(card._id)} className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
      </div>
      <button 
        onClick={cycleStatus}
        className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
      >
        {card.status}
      </button>
    </div>
  );
}