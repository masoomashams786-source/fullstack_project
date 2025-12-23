import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "../api/axios";
import api from "../api/axios";

export const useTrashNotes = (onSuccess, onError) => {
  const [operatingId, setOperatingId] = useState(null);

  const {
    data: trashData,
    error: trashError,
    isLoading: isTrashLoading,
    mutate: mutateTrashNotes,
  } = useSWR("/notes/trash", fetcher);

  const trashNotes = trashData?.notes ?? [];

  const recoverNote = async (id) => {
    setOperatingId(id);
    try {
      const res = await api.put(`/notes/${id}/recover`);
      if (res.data?.success) {
        onSuccess(res.data.message || "Note recovered");
        await mutateTrashNotes();
        return true;
      }
      return false;
    } catch (err) {
      onError(err, "recover note");
      return false;
    } finally {
      setOperatingId(null);
    }
  };

  const deleteForever = async (id) => {
    setOperatingId(id);
    try {
      const res = await api.delete(`/notes/${id}/permanent`);
      if (res.data?.success) {
        onSuccess(res.data.message || "Note permanently deleted");
        await mutateTrashNotes();
        return true;
      }
      return false;
    } catch (err) {
      onError(err, "delete forever");
      return false;
    } finally {
      setOperatingId(null);
    }
  };

  return {
    trashNotes,
    isTrashLoading,
    trashError,
    recoverNote,
    deleteForever,
    mutateTrashNotes,
    operatingId,
  };
};