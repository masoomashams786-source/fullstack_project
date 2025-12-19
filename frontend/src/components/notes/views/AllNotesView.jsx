import { Box, SimpleGrid, Skeleton, Heading, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import NoteCard from "../../NoteCard";

export default function AllNotesView({
  notes,
  isLoading,
  selectedTagIds,
  searchQuery = "",
  editingNoteId,
  operatingId,
  onEdit,
  onDelete,
  onArchive,
  onUpdate,
  onCancel,
  onEditTag,
  allTags,
  onAlertError,
  onAlertSuccess,
  onTagsChanged,
}) {
  // Filter and search notes
  const filteredNotes = useMemo(() => {
    // Filter out archived notes - only show non-archived notes
    let filtered = notes.filter((note) => !note.is_archived);

    // Apply tag filter
    if (selectedTagIds.length > 0) {
      filtered = filtered.filter((note) =>
        note.tags.some((tag) => selectedTagIds.includes(tag.id))
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((note) => {
        const titleMatch = note.title?.toLowerCase().includes(query);
        const contentMatch = note.content?.toLowerCase().includes(query);
        const tagMatch = note.tags?.some((tag) =>
          tag.name.toLowerCase().includes(query)
        );
        return titleMatch || contentMatch || tagMatch;
      });
    }

    return filtered;
  }, [notes, selectedTagIds, searchQuery]);

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

  if (filteredNotes.length === 0) {
    return (
      <Box textAlign="center" py={24} color="gray.600">
        <Heading color="teal.600" mb={4}>
          {searchQuery.trim() ? "No Results Found" : "No Notes"}
        </Heading>
        <p>
          {searchQuery.trim()
            ? "No notes match your search query."
            : "Create your first note to get started."}
        </p>
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
          onArchive={onArchive}
          isArchivedView={false}
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

