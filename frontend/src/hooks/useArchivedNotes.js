import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "../api/axios";
import api from "../api/axios";

export const useArchivedNotes = (onSuccess, onError) => {
  const [operatingId, setOperatingId] = useState(null);

  const {
    data: archivedData,
    error: archivedError,
    isLoading: isArchivedLoading,
    mutate: mutateArchivedNotes,
  } = useSWR("/notes/archived", fetcher);

  const archivedNotes = archivedData?.notes ?? [];

  const archiveNote = async (id) => {
    setOperatingId(id);
    try {
      const res = await api.put(`/notes/${id}/archive`);
      if (res.data?.success) {
        onSuccess(res.data.message || "Note archived");
        await mutateArchivedNotes();
        return true;
      }
      return false;
    } catch (err) {
      onError(err, "archive note");
      return false;
    } finally {
      setOperatingId(null);
    }
  };

  const unarchiveNote = async (id) => {
    setOperatingId(id);
    try {
      const res = await api.put(`/notes/${id}/unarchive`);
      if (res.data?.success) {
        onSuccess(res.data.message || "Note unarchived");
        await mutateArchivedNotes();
        return true;
      }
      return false;
    } catch (err) {
      onError(err, "unarchive note");
      return false;
    } finally {
      setOperatingId(null);
    }
  };

  return {
    archivedNotes,
    isArchivedLoading,
    archivedError,
    archiveNote,
    unarchiveNote,
    mutateArchivedNotes,
    operatingId,
  };
};