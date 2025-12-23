import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "../api/axios";
import api from "../api/axios";

export const useNotes = (onSuccess, onError) => {
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [operatingId, setOperatingId] = useState(null);

  // Fetch all notes
  const {
    data,
    error,
    isLoading,
    mutate: mutateNotes,
  } = useSWR("/notes", fetcher);

  const notes = data?.notes ?? [];

  // Create note
  const createNote = async ({ title, content, tag_ids }) => {
    if (!title.trim()) return;
    try {
      await api.post("/notes", { title, content, tag_ids });
      await mutateNotes();
      onSuccess("Note created");
      return true;
    } catch (err) {
      onError(err, "create note");
      return false;
    }
  };

  // Update note
  const updateNote = async (id, title, content) => {
    if (!title.trim()) return false;
    setOperatingId(id);
    try {
      await api.put(`/notes/${id}`, { title, content });
      await mutateNotes();
      onSuccess("Note updated");
      setEditingNoteId(null);
      return true;
    } catch (err) {
      onError(err, "update note");
      return false;
    } finally {
      setOperatingId(null);
    }
  };

  // Delete note (soft delete)
  const deleteNote = async (id) => {
    setOperatingId(id);
    try {
      const res = await api.delete(`/notes/${id}`);
      if (res.data?.success) {
        onSuccess(res.data.message || "Note moved to trash");
        await mutateNotes();
        return true;
      }
      return false;
    } catch (err) {
      onError(err, "delete note");
      return false;
    } finally {
      setOperatingId(null);
    }
  };

  return {
    notes,
    isLoading,
    error,
    editingNoteId,
    setEditingNoteId,
    operatingId,
    createNote,
    updateNote,
    deleteNote,
    mutateNotes,
  };
};