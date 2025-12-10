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
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Text,
  Separator,
  Badge,
  Skeleton,
  SkeletonText,
  Stack,
  Alert,
  HStack,
} from "@chakra-ui/react";

import { Toaster, toaster } from "@/components/ui/toaster";
import api from "../api/axios";
import Tags from "../components/tags.jsx";

export default function Dashboard() {
  const { view, setView } = useOutletContext(); // ✅ Correct use of outlet context
  const [notes, setNotes] = useState([]);

  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Edit state
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editError, setEditError] = useState(null);

  // Loading & error states
  const [isFetching, setIsFetching] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [operatingId, setOperatingId] = useState(null);
  const [pageError, setPageError] = useState(null);

  /* ------------------ Helpers ------------------ */

  const handleApiError = (error, action) => {
    console.error(action, error);

    if (error.response?.status === 401) {
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
      description:
        error.response?.data?.message ||
        "Something went wrong. Please try again.",
      type: "error",
    });
  };

  const notifySuccess = (title, description) => {
    toaster.create({ title, description, type: "success" });
  };

  /* ------------------ API ------------------ */

  const fetchNotes = async () => {
    setIsFetching(true);
    setPageError(null);
    try {
      const res = await api.get("/notes");
      setNotes(res.data.notes);
    } catch (err) {
      setPageError("Unable to load notes.");
      handleApiError(err, "fetch notes");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const createNote = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toaster.create({ title: "Title is required", type: "warning" });
      return;
    }

    setIsCreating(true);
    try {
      const res = await api.post("/notes", { title, content });
      setNotes((prev) => [res.data.note, ...prev]);
      setTitle("");
      setContent("");
      notifySuccess("Note Created");
    } catch (err) {
      handleApiError(err, "create note");
    } finally {
      setIsCreating(false);
    }
  };

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

  const editNote = async (id) => {
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

      setEditingNoteId(null);
      notifySuccess("Note Updated");
    } catch (err) {
      handleApiError(err, "update note");
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
      notifySuccess("Note Deleted");
    } catch (err) {
      handleApiError(err, "delete note");
    } finally {
      setOperatingId(null);
    }
  };

  /* ------------------ UI ------------------ */

  const WelcomeScreen = () => (
    <Box textAlign="center" py={24} color="gray.600">
      <Heading color="teal.600" mb={4}>
        Welcome back 👋
      </Heading>
      <Text>Select something from the sidebar to begin.</Text>
    </Box>
  );

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Tags />
      <Toaster />

      <Container maxW="container.lg">
        <tags />  
        <Stack gap={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading color="teal.600">My Notes Dashboard</Heading>
            <Text color="gray.500">Manage your daily ideas</Text>
          </Box>

          {pageError && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Description>
                {pageError}{" "}
                <Button size="xs" variant="underline" onClick={fetchNotes}>
                  Retry
                </Button>
              </Alert.Description>
            </Alert.Root>
          )}

          {view === "welcome" && <WelcomeScreen />}

          {view === "new-note" && (
            <Card.Root>
              <CardHeader>
                <Heading size="md">Create Note</Heading>
              </CardHeader>
              <CardBody>
                <form onSubmit={createNote}>
                  <Stack gap={4}>
                    <Input
                      placeholder="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="Content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                    <Button
                      type="submit"
                      colorScheme="teal"
                      isLoading={isCreating}
                    >
                      Save
                    </Button>
                  </Stack>
                </form>
              </CardBody>
            </Card.Root>
          )}

          {view === "all-notes" && (
            <>
              <Separator />

              {isFetching ? (
                <SimpleGrid columns={{ md: 3 }} gap={6}>
                  {[1, 2, 3].map((i) => (
                    <Card.Root key={i}>
                      <CardBody>
                        <Skeleton height="20px" mb={4} />
                        <SkeletonText noOfLines={4} />
                      </CardBody>
                    </Card.Root>
                  ))}
                </SimpleGrid>
              ) : (
                <SimpleGrid columns={{ md: 3 }} gap={6}>
                  {notes.map((note) => (
                    <Card.Root key={note.id}>
                      <CardBody>
                        {editingNoteId === note.id ? (
                          <Stack gap={2}>
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                            />
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                            />
                            {editError && (
                              <Alert.Root status="error">
                                <Alert.Indicator />
                                <Alert.Description>
                                  {editError}
                                </Alert.Description>
                              </Alert.Root>
                            )}
                          </Stack>
                        ) : (
                          <>
                            <Heading color={"teal"} size="lg">{note.title}</Heading>
                            <Text noOfLines={4}>{note.content}</Text>
                            <Badge mt={2}>{new Date().toLocaleDateString()}</Badge>
                          </>
                        )}
                      </CardBody>

                      <CardFooter justify="end">
                        {editingNoteId === note.id ? (
                          <HStack>
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={() => editNote(note.id)}
                              isLoading={operatingId === note.id}
                            >
                              Save
                            </Button>
                            <Button size="sm" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </HStack>
                        ) : (
                          <HStack>
                            <Button
                              size="sm"
                              variant="surface"
                              colorPalette="teal"
                              onClick={() => startEdit(note)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="surface"
                              colorPalette="red"
                              onClick={() => deleteNote(note.id)}
                            >
                              Delete
                            </Button>
                          </HStack>
                        )}
                      </CardFooter>
                    </Card.Root>
                  ))}
                </SimpleGrid>
              )}
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
