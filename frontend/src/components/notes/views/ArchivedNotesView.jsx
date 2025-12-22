import {
  Box,
  SimpleGrid,
  Skeleton,
  Alert,
  Button,
  Heading,
} from "@chakra-ui/react";
import { useMemo } from "react";
import NoteCard from "../../NoteCard";

export default function ArchivedNotesView({
  notes,
  isLoading,
  error,
  searchQuery = "",
  onUnarchive,
  onEdit,
  onDelete,
  editingNoteId,
  onUpdate,
  onCancel,
  operatingId,
  onEditTag,
  allTags,
  onAlertError,
  onAlertSuccess,
  onTagsChanged,
  onRetry,
}) {
  // Filter notes by search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;

    const query = searchQuery.toLowerCase().trim();
    return notes.filter((note) => {
      const titleMatch = note.title?.toLowerCase().includes(query);
      const contentMatch = note.content?.toLowerCase().includes(query);
      const tagMatch = note.tags?.some((tag) =>
        tag.name.toLowerCase().includes(query)
      );
      return titleMatch || contentMatch || tagMatch;
    });
  }, [notes, searchQuery]);
  if (isLoading) {
    return (
      <SimpleGrid columns={{ md: 3 }} gap={6}>
        {[1, 2, 3].map((i) => (
          <Box key={i} p={4} shadow="md" borderWidth="1px">
            <Skeleton height="20px" mb={4} />
            <Skeleton height="60px" />
          </Box>
        ))}
      </SimpleGrid>
    );
  }

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Title>Unable to load archived notes</Alert.Title>
        <Alert.Description>
          <Button size="xs" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </Alert.Description>
      </Alert.Root>
    );
  }

  if (notes.length === 0) {
    return (
      <Box textAlign="center" py={24} color="gray.600">
        <Heading color="teal.600" mb={4}>
          No Archived Notes
        </Heading>
        <p>You haven't archived any notes yet.</p>
      </Box>
    );
  }

  if (searchQuery.trim() && filteredNotes.length === 0) {
    return (
      <Box textAlign="center" py={24} color="gray.600">
        <Heading color="teal.600" mb={4}>
          No Results Found
        </Heading>
        <p>No archived notes match your search query.</p>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={{ md: 3 }} gap={6}>
      {filteredNotes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          onUnarchive={onUnarchive}
          isArchivedView={true}
          isEditing={editingNoteId === note.id}
          onUpdate={onUpdate}
          onCancel={onCancel}
          operatingId={operatingId}
          onEditTag={onEditTag}
          allTags={allTags}
          onAlertError={onAlertError}
          onAlertSuccess={onAlertSuccess}
          onTagsChanged={onTagsChanged}
        />
      ))}
    </SimpleGrid>
  );
}
