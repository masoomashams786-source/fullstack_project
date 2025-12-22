import { Box, SimpleGrid, Skeleton, Heading, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import NoteCard from "../../NoteCard";
import { useSort } from "../../../context/SortContext";

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
  singleColumn = false,
}) {
  const { sortOrder } = useSort();

  // Filter and search notes (then sort)
  const processedNotes = useMemo(() => {
    // Step 1: Filter out archived notes - only show non-archived notes
    let filtered = notes.filter((note) => !note.is_archived);

    // Step 2: Apply tag filter
    if (selectedTagIds.length > 0) {
      filtered = filtered.filter((note) =>
        note.tags.some((tag) => selectedTagIds.includes(tag.id))
      );
    }

    // Step 3: Apply search filter
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

    // Step 4: Sort by date (after all filtering is done)
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return sorted;
  }, [notes, selectedTagIds, searchQuery, sortOrder]);

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

  if (processedNotes.length === 0) {
    return (
      <Box textAlign="center" py={24} color="gray.600">
        <Heading color="teal.600" mb={4}>
          {searchQuery.trim() ? "No Results Found" : "No Notes"}
        </Heading>
        <Text>
          {searchQuery.trim()
            ? "No notes match your search query."
            : "Create your first note to get started."}
        </Text>
      </Box>
    );
  }

  return (
    <SimpleGrid
      columns={
        singleColumn
          ? { base: 1 } // 1 column when form is shown
          : { base: 1, md: 2, lg: 3 } // Responsive: 1 on mobile, 2 on tablet, 3 on desktop
      }
      gap={6}
    >
      {processedNotes.map((note) => (
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
