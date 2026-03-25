import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import client from "../api/client";
import CardItem from "../components/CardItem";
import CreateCardModal from "../components/CreateCardModel";

export default function BoardDetailPage() {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const pendingSync = useRef({});
  const versionMap = useRef({});

  useEffect(() => {
  const fetchBoardData = async () => {
    try {
      setLoading(true);
      const { data } = await client.get(`/boards/${id}`);
      setBoard(data);
      const fetchedCards = data.cards || [];
      setCards(fetchedCards);

      // Seed version map from fresh server data
      fetchedCards.forEach((c) => {
        versionMap.current[c._id] = c.version;
      });
    } catch (err) {
      console.error("Could not fetch board:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchBoardData();
}, [id]);

  const createCard = async (formPayload) => {
    try {
      const { data } = await client.post("/cards", {
        ...formPayload,
        boardId: id,
      });
      setCards((prev) => [...prev, data]);
    } catch (err) {
      alert("Failed to create card.");
    }
  };

  const updateCard = (updated) => {
    setCards((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
  };

  const handleDeleteCard = (cardId) => {
    setCards((prev) => prev.filter((c) => c._id !== cardId));
  };

  // --- DRAG AND DROP HANDLER ---
const onDragEnd = async (result) => {
  const { destination, source, draggableId } = result;

  if (!destination) return;
  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) return;

  const newStatus = destination.droppableId;
  const rollbackStatus = cards.find((c) => c._id === draggableId)?.status;

  // 1. Instant UI update
  setCards((prev) =>
    prev.map((c) => (c._id === draggableId ? { ...c, status: newStatus } : c))
  );

  // 2. Cancel any pending sync for this card (handles rapid moves)
  clearTimeout(pendingSync.current[draggableId]);

  // 3. Fire backend after short debounce
  pendingSync.current[draggableId] = setTimeout(async () => {
    try {
      await client.patch(`cards/${draggableId}`, { status: newStatus });
      // No need to setCards again — UI is already correct
    } catch (err) {
      console.error("Failed to sync card:", err);
      // Only rollback on actual network/server failure
      setCards((prev) =>
        prev.map((c) =>
          c._id === draggableId ? { ...c, status: rollbackStatus } : c
        )
      );
    }
  }, 300);
};

  const grouped = {
    todo: cards.filter((c) => c.status === "todo"),
    "in-progress": cards.filter((c) => c.status === "in-progress"),
    done: cards.filter((c) => c.status === "done"),
  };

  if (loading)
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="h-8 w-48 bg-[#1f1f1f] rounded animate-pulse mb-10" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#161616] rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 bg-black min-h-screen">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <Link to="/boards" className="text-xs text-neutral-500 hover:text-white transition-colors">
            ← Back to Boards
          </Link>
          <h1 className="font-display text-4xl text-white mt-2 font-bold">
            {board?.title || "Loading..."}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">{cards.length} cards in this board</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-400 hover:bg-amber-500 text-black text-sm font-bold px-6 py-2.5 rounded-xl transition-all"
        >
          + Add Card
        </button>
      </div>

      {/* Drag & Drop Context */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(grouped).map(([colId, colCards]) => (
            <div key={colId} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-2xl p-4 min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-6 px-1">
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">{colId}</span>
                <span className="text-[10px] bg-[#1f1f1f] text-neutral-400 rounded-full w-5 h-5 flex items-center justify-center border border-[#2a2a2a]">
                  {colCards.length}
                </span>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={colId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 space-y-4 transition-colors rounded-xl ${
                      snapshot.isDraggingOver ? "bg-white/5" : ""
                    }`}
                  >
                    {colCards.map((card, index) => (
                      <Draggable key={card._id} draggableId={card._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                            }}
                          >
                            <CardItem
                              card={card}
                              onUpdate={updateCard}
                              onDelete={handleDeleteCard}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {colCards.length === 0 && !snapshot.isDraggingOver && (
                      <div className="border border-dashed border-[#1e1e1e] rounded-xl py-10 flex flex-col items-center justify-center">
                        <p className="text-xs text-neutral-600 italic">No tasks here</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {showModal && (
        <CreateCardModal
          boardId={id}
          onClose={() => setShowModal(false)}
          onCreate={createCard}
        />
      )}
    </div>
  );
}