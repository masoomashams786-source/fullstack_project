import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Textarea,
  SimpleGrid,
  Stack,
  Text,
  Skeleton,
  Alert,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster";
import api from "../api/axios";
import NoteForm from "@/components/NoteForm";
import Tags from "../components/Tags";
import NoteCard from "../components/NoteCard";

export default function Dashboard() {
  const { view, setView } = useOutletContext();

  // Notes state
  const [notes, setNotes] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [pageError, setPageError] = useState(null);

  // Editing notes
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editError, setEditError] = useState(null);
  const [operatingId, setOperatingId] = useState(null);

  /* ------------------ Tag Handlers ------------------ */

  const [allTags, setAllTags] = useState([]);
  // Fetch all tags once
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get("/tags"); // GET all tags
        setAllTags(res.data.tags); // save them to shared state
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      }
    };
    fetchTags();
  }, []);

  // Edit a tag (prompt for new name)
  const handleEditTag = async (tagId, newName, noteId) => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    try {
      const res = await api.put(`/tags/${tagId}`, { name: trimmedName });
      const updatedTag = res.data.tag;

      setAllTags((prevTags) =>
        prevTags.map((tag) => (tag.id === tagId ? updatedTag : tag))
      );

      setNotes((prevNotes) =>
        prevNotes.map((note) => ({
          ...note,
          tags: note.tags.map((t) => (t.id === tagId ? updatedTag : t)),
        }))
      );

      success("Tag updated successfully!");
    } catch (err) {
      apiError(err, "update tag");
    }
  };

  // Delete a tag
  const handleDeleteTag = async (tagId, noteId) => {
    try {
      await api.delete(`/tags/${tagId}`);
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId
            ? { ...note, tags: note.tags.filter((t) => t.id !== tagId) }
            : note
        )
      );
      success("Tag deleted");
    } catch (err) {
      apiError(err, "delete tag");
    }
  };

  // Add a tag
  const handleAddTag = async (noteId) => {
    const tagName = window.prompt("Enter new tag name:");
    if (!tagName || !tagName.trim()) return;

    try {
      const res = await api.post("/tags", { name: tagName, note_id: noteId });
      const createdTag = res.data.tag;
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId
            ? { ...note, tags: [...note.tags, createdTag] }
            : note
        )
      );
      setAllTags(prevTags => [...prevTags, createdTag]);


      success("Tag added");
    } catch (err) {
      apiError(err, "add tag");
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
      description: err.response?.data?.error || "Something went wrong.",
      type: "error",
    });
  };

  const success = (msg) => {
    toaster.create({ title: msg, type: "success" });
  };

  /* ------------------ API ------------------ */
  const fetchNotes = async () => {
    setIsFetching(true);
    setPageError(null);
    try {
      const res = await api.get("/notes"); // No trailing slash
      setNotes(res.data.notes);
    } catch (err) {
      setPageError("Unable to load notes.");
      apiError(err, "fetch notes");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  /* ------------------ NoteForm Integration ------------------ */

  const handleCreateNote = async ({ title, content, tag_ids }) => {
    if (!title.trim()) return;

    try {
      const res = await api.post("/notes", { title, content, tag_ids });
      // Update the local list with the new note
      setNotes((prevNotes) => [res.data.note, ...prevNotes]);
      success("Note Created and List Updated");

      // Switch view to clear the form
      if (setView) {
        setView("all-notes");
      }
    } catch (err) {
      apiError(err, "create note");
    }
  };

  /* ------------------ Editing Notes ------------------ */
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
      const res = await api.put(`/notes/${id}`, {
        title,
        content,
      });
      setNotes((prev) => prev.map((n) => (n.id === id ? res.data.note : n)));
      success("Note Updated");
      setEditingNoteId(null);
    } catch (err) {
      apiError(err, "update note");
    } finally {
      setOperatingId(null);
    }
  };

  const deleteNote = async (id) => {
    setOperatingId(id);
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      success("Note Deleted");
    } catch (err) {
      apiError(err, "delete note");
    } finally {
      setOperatingId(null);
    }
  };

  /* ------------------ UI Blocks ------------------ */
  const Welcome = () => (
    <Box textAlign="center" py={24} color="gray.600">
      <Heading color="teal.600" mb={4}>
        Welcome back 👋
      </Heading>
      <p>Select something from the sidebar to begin.</p>
    </Box>
  );

  const AllNotes = () => (
    <>
      {isFetching ? (
        <SimpleGrid columns={{ md: 3 }} gap={6}>
          {[1, 2, 3].map((i) => (
            <Box key={i} p={4} shadow="md" borderWidth="1px">
              <Skeleton height="20px" mb={4} />
              <Skeleton height="60px" />
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <>
          <SimpleGrid columns={{ md: 3 }} gap={6}>
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={startEdit}
                onDelete={deleteNote}
                isEditing={editingNoteId === note.id}
                allTags={allTags}
                onUpdate={updateNote}
                onCancel={cancelEdit}
                operatingId={operatingId}
                onEditTag={handleEditTag}
                onDeleteTag={handleDeleteTag}
                onAddTag={handleAddTag}
                onAlertError={apiError}
                onAlertSuccess={success}
                setGlobalTags={setAllTags}
              />
            ))}
          </SimpleGrid>
        </>
      )}
    </>
  );

  /* ------------------ Render ------------------ */
  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Toaster />
      <Container maxW="container.lg">
        <Stack gap={8}>
          <Box textAlign="center">
            <Heading color="teal.600">My Notes Dashboard</Heading>
            <Text color="gray.500">Manage your daily ideas</Text>
          </Box>
          {pageError && (
            <Alert status="error">
              {pageError}
              <Button size="xs" variant="underline" onClick={fetchNotes}>
                Retry
              </Button>
            </Alert>
          )}
          {view === "welcome" && <Welcome />}
          {view === "new-note" && <NoteForm onSubmit={handleCreateNote} />}
          {view === "all-notes" && <AllNotes />}
        </Stack>
      </Container>
    </Box>
  );
}
