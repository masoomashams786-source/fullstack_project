import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Textarea,
  VStack,
  HStack,
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
} from "@chakra-ui/react";


import { Toaster, toaster } from "@/components/ui/toaster"; 
import api from "../api/axios";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Editing State
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editError, setEditError] = useState(null);

  // Loading States
  const [isFetching, setIsFetching] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [operatingId, setOperatingId] = useState(null);

  // Persistent Error State (For when the whole page fails)
  const [pageError, setPageError] = useState(null);

  // --- PROFESSIONAL ERROR HANDLING WRAPPER ---
  const handleApiError = (error, actionContext) => {
    console.error(`Error during ${actionContext}:`, error);


    // 1. Handle Unauthorized (401)
    if (error.response && error.response.status === 401) {
      toaster.create({
        title: "Session Expired",
        description: "Redirecting you to login...",
        type: "error",
        duration: 3000,
      });
      
      // Clear token and redirect after a short delay so user sees the toast
      localStorage.removeItem("token");
      setTimeout(() => {
        window.location.reload(); // Or navigate('/login')
      }, 2000);
      return;
    }

    // 2. Handle Generic Errors
    const message = error.response?.data?.message || "Something went wrong. Please try again.";
    
    toaster.create({
      title: `Failed to ${actionContext}`,
      description: message,
      type: "error",
      duration: 5000,
    });
  };

  // --- SUCCESS NOTIFICATION HELPER ---
  const notifySuccess = (title, description = "") => {
    toaster.create({
      title: title,
      description: description,
      type: "success",
      duration: 4000,
      action: {
        label: "X",
        onClick: () => console.log("Closed"),
      },
    });
  };

  // 1. Fetch all notes
  const fetchNotes = async () => {
    setIsFetching(true);
    setPageError(null);
    try {
      const res = await api.get("/notes");
      setNotes(res.data.notes);
    } catch (error) {
 
      setPageError("Could not load dashboard data. Is the server running?");
      handleApiError(error, "fetch notes");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // 2. Create note
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
      
      notifySuccess("Note Created", "Your new note has been saved.");
    } catch (error) {
      handleApiError(error, "create note");
    } finally {
      setIsCreating(false);
    }
  };

  // 3. Update note
  const editNote = async (id) => {
    if (!editTitle || !editTitle.trim()){
      setEditError("Title cannot be empty.");
      return;
    }
    setEditError(null);

    setOperatingId(id);
    try {
      const res = await api.put(`/notes/${id}`, {
        title: editTitle,
        content: editContent,
      });
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? res.data.note : note))
      );
      
      setEditingNoteId(null); 
      setEditTitle("");
      setEditContent("");
      notifySuccess("Note Updated", "Changes saved successfully.");
    } catch (error) {
      handleApiError(error, "update note");
    } finally {
      setOperatingId(null);
    }
  };

  // 4. Delete note
  const deleteNote = async (id) => {
   
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    
    setOperatingId(id);
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      
      notifySuccess("Note Deleted", "The note has been removed.");
    } catch (error) {
      handleApiError(error, "delete note");
    } finally {
      setOperatingId(null);
    }
  };

  // UI Helpers
  const startEdit = (note) => {
    setEditingNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
     
      <Toaster />
      

      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          
          <Box textAlign="center">
            <Heading as="h1" size="xl" color="teal.600" mb={2}>
              My Notes Dashboard
            </Heading>
            <Text color="gray.500">Manage your daily tasks and ideas</Text>
          </Box>

          {/* PERSISTENT PAGE ERROR (e.g., Server Down) */}
          {pageError && (
            <Alert.Root status="error" variant="subtle">
              <Alert.Indicator />
              <Box>
                <Alert.Title>System Error</Alert.Title>
                <Alert.Description>
                  {pageError} <Button size="xs" variant="underline" onClick={fetchNotes}>Retry</Button>
                </Alert.Description>
              </Box>
            </Alert.Root>
          )}

          {/* Create Form */}
          <Card.Root variant="elevated" size="md" overflow="hidden">
            <Box h="4px" bg={isCreating ? "teal.400" : "transparent"} w="full" />
            <CardHeader pb={0}>
              <Heading size="md">Create a New Note</Heading>
            </CardHeader>
            <CardBody>
              <form onSubmit={createNote}>
                <VStack spacing={4}>
                  <Input
                    placeholder="Note Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    size="lg"
                    bg="white"
                    disabled={isCreating}
                  />
                  <Textarea
                    placeholder="Write your content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    bg="white"
                    resize="none"
                    disabled={isCreating}
                  />
                  <Button
                    type="submit"
                    colorScheme="teal"
                    width="full"
                    size="lg"
                    mt={2}
                    loading={isCreating} 
                    loadingText="Saving..."
                  >
                    Add Note
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card.Root>

          <Separator />

          {/* SKELETON LOADING STATE */}
          {isFetching ? (
             <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
               {[1, 2, 3].map((i) => (
                 <Card.Root key={i} bg="white" h="200px">
                   <CardBody>
                     <Stack spacing={4}>
                       <Skeleton height="20px" width="60%" />
                       <SkeletonText noOfLines={4} spacing="4" skeletonHeight="2" />
                     </Stack>
                   </CardBody>
                 </Card.Root>
               ))}
             </SimpleGrid>
          ) : (
            // ACTIVE DATA STATE
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {notes.map((note) => (
                <Card.Root key={note.id} variant="outline" bg="white" boxShadow="sm" _hover={{ boxShadow: "md", borderColor: "teal.200" }} transition="all 0.2s">
                  <CardBody>
                    {editingNoteId === note.id ? (
                      <VStack spacing={3}>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Edit Title"
                          fontWeight="bold"
                          autoFocus
                        />
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={4}
                        />
                        {editError && (
      <Alert.Root status="error" variant="subtle">
        <Alert.Indicator />
        <Box>
          <Alert.Title>Validation</Alert.Title>
          <Alert.Description>{editError}</Alert.Description>
        </Box>
      </Alert.Root>
    )}
                      </VStack>
                    ) : (
                      <Box>
                        <Heading size="sm" mb={2} color="teal.700">
                          {note.title}
                        </Heading>
                        <Text color="gray.600" noOfLines={4} whiteSpace="pre-wrap">
                          {note.content}
                        </Text>
                        <Badge mt={3} colorPalette="teal" variant="surface">
                           {new Date().toLocaleDateString()}
                        </Badge>
                      </Box>
                    )}
                  </CardBody>

                  <CardFooter justify="flex-end" pt={0}>
                    {editingNoteId === note.id ? (
                      <HStack>
                        <Button
                          size="sm"
                          colorScheme="green"
                          variant="solid"
                          onClick={() => editNote(note.id)}
                          loading={operatingId === note.id}
                          disabled={operatingId === note.id}
                        >
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={cancelEdit}
                          disabled={operatingId === note.id}
                        >
                          Cancel
                        </Button>
                      </HStack>
                    ) : (
                      <HStack>
                        <Button
                          size="sm"
                          variant="surface"
                          colorPalette="blue"
                          onClick={() => startEdit(note)}
                          disabled={operatingId === note.id}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          colorPalette="red"
                          variant="ghost"
                          onClick={() => deleteNote(note.id)}
                          loading={operatingId === note.id}
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

          {!isFetching && !pageError && notes.length === 0 && (
            <Box textAlign="center" py={12} borderRadius="md" border="2px dashed" borderColor="gray.300">
              <Heading size="sm" color="gray.500" mb={2}>It's quiet here...</Heading>
              <Text color="gray.400">Create your first note to get started!</Text>
            </Box>
          )}

        </VStack>
      </Container>
    </Box>
  );
}