import { useState, useEffect } from "react";
import client from "../api/client";

export default function useBoards() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBoards = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.get("/boards");
      setBoards(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch boards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const createBoard = async (payload) => {
    try {
      const { data } = await client.post("/boards", payload);
      setBoards((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create board");
    }
  };

  const deleteBoard = async (id) => {
    try {
      await client.delete(`/boards/${id}`);
      setBoards((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to delete board");
    }
  };

  return {
    boards,
    loading,
    error,
    fetchBoards,
    createBoard,
    deleteBoard,
  };
}