import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Box, Button, Container, Stack, Alert, Flex } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster";
import api from "../api/axios";
import NoteForm from "@/components/NoteForm";
import Sidebar from "@/components/sidebar";
import SearchBar from "@/components/SearchBar";
import WelcomeView from "@/components/notes/views/WelcomeView";
import AllNotesView from "@/components/notes/views/AllNotesView";
import ArchivedNotesView from "@/components/notes/views/ArchivedNotesView";
import TrashNotesView from "@/components/notes/views/TrashNotesView";
import { useNotes } from "../hooks/useNotes";
import { useArchivedNotes } from "../hooks/useArchivedNotes";
import { useTrashNotes } from "../hooks/useTrashNotes";

export default function Dashboard({ showNoteForm = false }) {
  const { view, setView } = useOutletContext();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Helper functions
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

  const success = (msg) => toaster.create({ title: msg, type: "success" });

  // Custom hooks
  const {
    notes,
    isLoading,
    error,
    editingNoteId,
    setEditingNoteId,
    operatingId: notesOperatingId,
    createNote,
    updateNote,
    deleteNote,
    mutateNotes,
  } = useNotes(success, apiError);

  const {
    archivedNotes,
    isArchivedLoading,
    archivedError,
    archiveNote,
    unarchiveNote,
    mutateArchivedNotes,
    operatingId: archivedOperatingId,
  } = useArchivedNotes(success, apiError);

  const {
    trashNotes,
    isTrashLoading,
    trashError,
    recoverNote,
    deleteForever,
    mutateTrashNotes,
    operatingId: trashOperatingId,
  } = useTrashNotes(success, apiError);

  // Combined operating ID
  const operatingId = notesOperatingId || archivedOperatingId || trashOperatingId;

  // All tags
  const allTags = useMemo(() => {
    const tagMap = {};
    [...notes, ...archivedNotes, ...trashNotes].forEach((note) => {
      note.tags.forEach((tag) => {
        if (!tagMap[tag.name]) tagMap[tag.name] = tag;
      });
    });
    return Object.values(tagMap);
  }, [notes, archivedNotes, trashNotes]);

  // Tag handlers
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

  const applyTagFilter = (tagIds) => {
    const current = [...selectedTagIds].sort().join(",");
    const next = [...tagIds].sort().join(",");
    if (current !== next) {
      setView("all-notes");
      setSelectedTagIds(tagIds);
    }
  };

  const handleCreateNote = async (noteData) => {
    const created = await createNote(noteData);
    if (created) setView("all-notes");
  };

  const handleDeleteNote = async (id) => {
    await deleteNote(id);
    await mutateTrashNotes();
  };

  const handleArchiveNote = async (id) => {
    await archiveNote(id);
    await mutateNotes();
  };

  const handleUnarchiveNote = async (id) => {
    await unarchiveNote(id);
    await mutateNotes();
  };

  const handleRecoverNote = async (id) => {
    await recoverNote(id);
    await mutateNotes();
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

      <Box flex="1" bg="bg.page" p={6}>
        <Flex gap={6} w="full" direction={{ base: "column", lg: "row" }}>
          <Box flex="1">
            <Container maxW={showNoteForm ? "full" : "container.lg"}>
              <Stack gap={8}>
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
                      <Button size="xs" variant="outline" onClick={() => mutateNotes()}>
                        Retry
                      </Button>
                    </Alert.Description>
                  </Alert.Root>
                )}

                {view === "welcome" && !showNoteForm && <WelcomeView />}

                {(view === "all-notes" || showNoteForm) && (
                  <AllNotesView
                    notes={notes}
                    isLoading={isLoading}
                    selectedTagIds={selectedTagIds}
                    searchQuery={searchQuery}
                    editingNoteId={editingNoteId}
                    operatingId={operatingId}
                    onEdit={(note) => setEditingNoteId(note.id)}
                    onDelete={handleDeleteNote}
                    onArchive={handleArchiveNote}
                    onUpdate={updateNote}
                    onCancel={() => setEditingNoteId(null)}
                    onEditTag={handleEditTag}
                    allTags={allTags}
                    onAlertError={apiError}
                    onAlertSuccess={success}
                    onTagsChanged={mutateNotes}
                    singleColumn={showNoteForm}
                  />
                )}

                {view === "archived" && !showNoteForm && (
                  <ArchivedNotesView
                    notes={archivedNotes}
                    isLoading={isArchivedLoading}
                    error={archivedError}
                    searchQuery={searchQuery}
                    onUnarchive={handleUnarchiveNote}
                    onEdit={(note) => setEditingNoteId(note.id)}
                    onDelete={handleDeleteNote}
                    editingNoteId={editingNoteId}
                    onUpdate={updateNote}
                    onCancel={() => setEditingNoteId(null)}
                    operatingId={operatingId}
                    onEditTag={handleEditTag}
                    allTags={allTags}
                    onAlertError={apiError}
                    onAlertSuccess={success}
                    onTagsChanged={mutateNotes}
                    onRetry={mutateArchivedNotes}
                  />
                )}

                {view === "trash" && !showNoteForm && (
                  <TrashNotesView
                    notes={trashNotes}
                    isLoading={isTrashLoading}
                    error={trashError}
                    searchQuery={searchQuery}
                    onRecover={handleRecoverNote}
                    onDeleteForever={deleteForever}
                    operatingId={operatingId}
                    allTags={allTags}
                    onAlertError={apiError}
                    onAlertSuccess={success}
                    onRetry={mutateTrashNotes}
                  />
                )}
              </Stack>
            </Container>
          </Box>

          {showNoteForm && (
            <Box
              w={{ base: "full", lg: "400px" }}
              position={{ base: "relative", lg: "sticky" }}
              top="0"
              h={{ base: "auto", lg: "calc(100vh - 120px)" }}
              overflowY="auto"
              flexShrink={0}
            >
              <NoteForm />
            </Box>
          )}
        </Flex>
      </Box>
    </Flex>
  );
}