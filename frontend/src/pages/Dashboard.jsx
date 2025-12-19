import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  Skeleton,
  Alert,
  Flex,
} from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster";
import api from "../api/axios";
import NoteForm from "@/components/NoteForm";
import Sidebar from "@/components/sidebar";
import SearchBar from "@/components/SearchBar";
import WelcomeView from "@/components/notes/views/WelcomeView";
import AllNotesView from "@/components/notes/views/AllNotesView";
import ArchivedNotesView from "@/components/notes/views/ArchivedNotesView";
import TrashNotesView from "@/components/notes/views/TrashNotesView";
import useSWR, { mutate } from "swr";
import { fetcher } from "../api/axios";
import useSWRMutation from "swr/mutation";
import { useAuth } from "./auth-context";

/* ===================== DASHBOARD ===================== */

export default function Dashboard() {
  const { view, setView } = useOutletContext();

  const authData = useAuth();
  console.log(authData)

  /* ------------------ Notes SWR ------------------ */
  const {
    data,
    error,
    isLoading,
    mutate: mutateNotes,
  } = useSWR("/notes", fetcher);

  const notes = data?.notes ?? [];

  /* ------------------ Archived Notes SWR ------------------ */
  const {
    data: archivedData,
    error: archivedError,
    isLoading: isArchivedLoading,
    mutate: mutateArchivedNotes,
  } = useSWR("/notes/archived", fetcher);

  const archivedNotes = archivedData?.notes ?? [];

  /* ------------------ Trash Notes SWR ------------------ */
  const {
    data: trashData,
    error: trashError,
    isLoading: isTrashLoading,
    mutate: mutateTrashNotes,
  } = useSWR("/notes/trash", fetcher);

  const trashNotes = trashData?.notes ?? [];

  /* ------------------ Editing Notes ------------------ */
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editError, setEditError] = useState(null);
  const [operatingId, setOperatingId] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  /* ------------------ Tags ------------------ */
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  /* ------------------ Search ------------------ */
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ SAFE DEFAULT so tagsResponse is never undefined
  // Include tags from regular, archived, and trash notes
  const allTags = useMemo(() => {
    const tagMap = {};
    [...notes, ...archivedNotes, ...trashNotes].forEach((note) => {
      note.tags.forEach((tag) => {
        if (!tagMap[tag.name]) tagMap[tag.name] = tag; // pick first instance
      });
    });
    return Object.values(tagMap);
  }, [notes, archivedNotes, trashNotes]);

  /* ------------------ Tag Handlers ------------------ */
  const handleEditTag = async (tagId, newName) => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    try {
      await api.put(`/tags/${tagId}`, { name: trimmedName });
      await mutateNotes();
      success("Tag updated successfully");
    } catch (err) {
      apiError(err, "update tag");
    }
  };

  /* ------------------ Helpers ------------------ */
  const apiError = (err, action) => {
    console.error(err);

    if (err.response?.status === 401) {
      toaster.create({
        title: "Session Expired",
        description: "Please log in again.",
        type: "error",
      });
      localStorage.removeItem("token");
      setTimeout(() => window.location.reload(), 1500);
      return;
    }

    toaster.create({
      title: `Failed to ${action}`,
      description: err.response?.data?.error || "Something went wrong",
      type: "error",
    });
  };

  const success = (msg) => {
    toaster.create({ title: msg, type: "success" });
  };

  /* ------------------ Filter ------------------ */
  const applyTagFilter = (tagIds) => {
    const current = [...selectedTagIds].sort().join(",");
    const next = [...tagIds].sort().join(",");

    if (current !== next) {
      setView("all-notes");
      setSelectedTagIds(tagIds);
    }
  };

  /* ------------------ Notes API ------------------ */

  /* ------------------ Notes CRUD ------------------ */
  const handleCreateNote = async ({ title, content, tag_ids }) => {
    if (!title.trim()) return;

    try {
      await api.post("/notes", { title, content, tag_ids });
      await mutateNotes(); // revalidate notes
      success("Note created");
      setView("all-notes");
    } catch (err) {
      apiError(err, "create note");
    }
  };

  const startEdit = (note) => {
    setEditingNoteId(note.id);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditError(null);
  };

  const updateNote = async (id, title, content) => {
    if (!title.trim()) {
      setEditError("Title cannot be empty");
      return;
    }

    setOperatingId(id);
    try {
      await api.put(`/notes/${id}`, { title, content });
      await mutateNotes();
      success("Note updated");
      setEditingNoteId(null);
    } catch (err) {
      apiError(err, "update note");
    } finally {
      setOperatingId(null);
    }
  };

  /* ------------------ Delete Note Mutation (Soft Delete - Move to Trash) ------------------ */
  const { trigger: deleteNoteTrigger } = useSWRMutation(
    "/notes/delete",
    async (url, { arg }) => {
      const res = await api.delete(`/notes/${arg}`);
      return res.data;
    }
  );

  const deleteNote = async (id) => {
    setOperatingId(id);
    try {
      const res = await deleteNoteTrigger(id);
      if (res?.success) {
        success(res.message || "Note moved to trash");
        await mutateNotes();
        await mutateTrashNotes();
      } else {
        apiError(
          { response: { data: { error: res?.error || "Failed to delete note" } } },
          "delete note"
        );
      }
    } catch (err) {
      apiError(err, "delete note");
    } finally {
      setOperatingId(null);
    }
  };

  /* ------------------ Archive Note Mutation ------------------ */
  const { trigger: archiveNoteTrigger, isMutating: isArchiving } = useSWRMutation(
    "/notes/archive",
    async (url, { arg }) => {
      const res = await api.put(`/notes/${arg}/archive`);
      return res.data;
    }
  );

  const archiveNote = async (id) => {
    setOperatingId(id);
    try {
      const res = await archiveNoteTrigger(id);
      if (res?.success) {
        success(res.message || "Note archived");
        await mutateNotes();
        await mutateArchivedNotes();
      } else {
        apiError(
          { response: { data: { error: res?.error || "Failed to archive note" } } },
          "archive note"
        );
      }
    } catch (err) {
      apiError(err, "archive note");
    } finally {
      setOperatingId(null);
    }
  };

  /* ------------------ Unarchive Note Mutation ------------------ */
  const { trigger: unarchiveNoteTrigger, isMutating: isUnarchiving } = useSWRMutation(
    "/notes/unarchive",
    async (url, { arg }) => {
      const res = await api.put(`/notes/${arg}/unarchive`);
      return res.data;
    }
  );

  const unarchiveNote = async (id) => {
    setOperatingId(id);
    try {
      const res = await unarchiveNoteTrigger(id);
      if (res?.success) {
        success(res.message || "Note unarchived");
        await mutateNotes();
        await mutateArchivedNotes();
      } else {
        apiError(
          { response: { data: { error: res?.error || "Failed to unarchive note" } } },
          "unarchive note"
        );
      }
    } catch (err) {
      apiError(err, "unarchive note");
    } finally {
      setOperatingId(null);
    }
  };

  /* ------------------ Recover Note Mutation ------------------ */
  const { trigger: recoverNoteTrigger } = useSWRMutation(
    "/notes/recover",
    async (url, { arg }) => {
      const res = await api.put(`/notes/${arg}/recover`);
      return res.data;
    }
  );

  const recoverNote = async (id) => {
    setOperatingId(id);
    try {
      const res = await recoverNoteTrigger(id);
      if (res?.success) {
        success(res.message || "Note recovered successfully");
        await mutateNotes();
        await mutateTrashNotes();
      } else {
        apiError(
          { response: { data: { error: res?.error || "Failed to recover note" } } },
          "recover note"
        );
      }
    } catch (err) {
      apiError(err, "recover note");
    } finally {
      setOperatingId(null);
    }
  };

  /* ------------------ Delete Forever Mutation ------------------ */
  const { trigger: deleteForeverTrigger } = useSWRMutation(
    "/notes/delete-forever",
    async (url, { arg }) => {
      const res = await api.delete(`/notes/${arg}/permanent`);
      return res.data;
    }
  );

  const deleteForever = async (id) => {
    setOperatingId(id);
    try {
      const res = await deleteForeverTrigger(id);
      if (res?.success) {
        success(res.message || "Note permanently deleted");
        await mutateTrashNotes();
      } else {
        apiError(
          { response: { data: { error: res?.error || "Failed to delete note forever" } } },
          "delete note forever"
        );
      }
    } catch (err) {
      apiError(err, "delete note forever");
    } finally {
      setOperatingId(null);
    }
  };

  const handleNoteTagsUpdated = async (noteId) => {
    try {
      await mutateNotes(); // re-fetch all notes
    } catch (err) {
      console.error("Failed to refresh note tags:", err);
    }
  };

  return (
    <Flex flex="1">
      <Toaster />
      <Sidebar
        collapsed={collapsed}
        allTags={allTags}
        onSelect={setView}
        currentFilterTagIds={selectedTagIds}
        onApplyFilter={applyTagFilter}
      />

      <Box flex="1" bg="gray.50" p={6}>
        <Container maxW="container.lg">
          <Stack gap={8}>
           

            {/* Search Bar - Show for views that display notes */}
            {(view === "all-notes" || view === "archived" || view === "trash") && (
              <SearchBar
                onSearch={setSearchQuery}
                placeholder={
                  view === "archived"
                    ? "Search archived notes..."
                    : view === "trash"
                    ? "Search trash..."
                    : "Search notes..."
                }
              />
            )}

            {error && (
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Title>Unable to load notes</Alert.Title>
                <Alert.Description>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => mutateNotes()}
                  >
                    Retry
                  </Button>
                </Alert.Description>
              </Alert.Root>
            )}

            {view === "welcome" && <WelcomeView />}
            {view === "new-note" && <NoteForm />}
            {view === "all-notes" && (
              <AllNotesView
                notes={notes}
                isLoading={isLoading}
                selectedTagIds={selectedTagIds}
                searchQuery={searchQuery}
                editingNoteId={editingNoteId}
                operatingId={operatingId}
                onEdit={startEdit}
                onDelete={deleteNote}
                onArchive={archiveNote}
                onUpdate={updateNote}
                onCancel={cancelEdit}
                onEditTag={handleEditTag}
                allTags={allTags}
                onAlertError={apiError}
                onAlertSuccess={success}
                onTagsChanged={handleNoteTagsUpdated}
              />
            )}
            {view === "archived" && (
              <ArchivedNotesView
                notes={archivedNotes}
                isLoading={isArchivedLoading}
                error={archivedError}
                searchQuery={searchQuery}
                onUnarchive={unarchiveNote}
                onEdit={startEdit}
                onDelete={deleteNote}
                editingNoteId={editingNoteId}
                onUpdate={updateNote}
                onCancel={cancelEdit}
                operatingId={operatingId}
                onEditTag={handleEditTag}
                allTags={allTags}
                onAlertError={apiError}
                onAlertSuccess={success}
                onTagsChanged={handleNoteTagsUpdated}
                onRetry={() => mutateArchivedNotes()}
              />
            )}
            {view === "trash" && (
              <TrashNotesView
                notes={trashNotes}
                isLoading={isTrashLoading}
                error={trashError}
                searchQuery={searchQuery}
                onRecover={recoverNote}
                onDeleteForever={deleteForever}
                operatingId={operatingId}
                allTags={allTags}
                onAlertError={apiError}
                onAlertSuccess={success}
                onRetry={() => mutateTrashNotes()}
              />
            )}
          </Stack>
        </Container>
      </Box>
    </Flex>
  );
}
