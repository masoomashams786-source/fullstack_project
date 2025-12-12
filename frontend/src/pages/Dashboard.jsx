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
  const { view } = useOutletContext();

  // Notes state
  const [notes, setNotes] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [pageError, setPageError] = useState(null);

  // Editing notes
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editError, setEditError] = useState(null);
  const [operatingId, setOperatingId] = useState(null);

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

  useEffect(() => {
    if (view === "all-notes") fetchNotes();
  }, [view]);

  /* ------------------ NoteForm Integration ------------------ */
  const handleCreateNote = async ({ title, content, tag_ids }) => {
    if (!title.trim()) return;
    try {
      const res = await api.post("/notes", { title, content, tag_ids });
      setNotes((prev) => [res.data.note, ...prev]);
      success("Note Created");
    } catch (err) {
      apiError(err, "create note");
    }
  };

  /* ------------------ Editing Notes ------------------ */
  const startEdit = (note) => {
    setEditingNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditError(null);
  };

  const updateNote = async (id) => {
    if (!editTitle.trim()) {
      setEditError("Title cannot be empty");
      return;
    }
    setOperatingId(id);
    try {
      const res = await api.put(`/notes/${id}`, {
        title: editTitle,
        content: editContent,
      });
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? res.data.note : n))
      );
      success("Note Updated");
      setEditingNoteId(null);
    } catch (err) {
      apiError(err, "update note");
    } finally {
      setOperatingId(null);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;
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
      <Heading color="teal.600" mb={4}>Welcome back 👋</Heading>
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
              <Box key={note.id} p={4} shadow="md" borderWidth="1px" borderRadius="md">
                {editingNoteId === note.id ? (
                  <Stack gap={2}>
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                    <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                    {editError && (
                      <Alert status="error">{editError}</Alert>
                    )}
                  </Stack>
                ) : (
                  <>
                    <Heading size="md" color="teal.700">{note.title}</Heading>
                    <Text noOfLines={4}>{note.content}</Text>
                    <Badge mt={2}>{new Date(note.created_at).toLocaleDateString()}</Badge>
                  </>
                )}
                <HStack mt={2} justify="flex-end">
                  {editingNoteId === note.id ? (
                    <>
                      <Button
                        size="sm"
                        colorPalette="green"
                        onClick={() => updateNote(note.id)}
                        isLoading={operatingId === note.id}
                      >Save</Button>
                      <Button size="sm" onClick={cancelEdit}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="surface"
                        colorPalette="teal"
                        onClick={() => startEdit(note)}
                      >Edit</Button>
                      <Button
                        size="sm"
                        variant="surface"
                        colorPalette="red"
                        onClick={() => deleteNote(note)}
                      >Delete</Button>
                    </>
                  )}
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
          <Box mt={10}>
            <Tags />
          </Box>
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
              <Button size="xs" variant="underline" onClick={fetchNotes}>Retry</Button>
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
