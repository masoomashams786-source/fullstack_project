import { HStack, Box, Text, IconButton, Input, Button } from "@chakra-ui/react";
import { FiTag, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

export default function NoteCardTags({
  noteTags,
  isTrashView,
  editingTagId,
  editingTagName,
  onEditTagStart,
  onEditTagCancel,
  onEditTagSave,
  onDeleteTag,
  onAddTagClick,
  setEditingTagName,
}) {
  // Read-only tags for trash view
  if (isTrashView && noteTags && noteTags.length > 0) {
    return (
      <HStack mt={3} spacing={2} wrap="wrap">
        {noteTags.map((tag) => (
          <HStack
            key={tag.id}
            spacing={1}
            px={2}
            py={1}
            borderRadius="md"
            bg="gray.400"
            align="center"
          >
            <Box as={FiTag} color="white" boxSize={3} />
            <Text fontSize="sm" color="white">
              {tag.name}
            </Text>
          </HStack>
        ))}
      </HStack>
    );
  }

  // Editable tags for normal view
  if (!isTrashView) {
    return (
      <HStack mt={3} spacing={2} wrap="wrap">
        {noteTags?.map((tag) => (
          <HStack
            key={tag.id}
            spacing={1}
            px={2}
            py={1}
            borderRadius="md"
            bg="teal.600"
            align="center"
          >
            <Box as={FiTag} color="white" boxSize={3} />

            {/* Tag editing */}
            {editingTagId === tag.id ? (
              <>
                <Input
                  size="xs"
                  value={editingTagName}
                  onChange={(e) => setEditingTagName(e.target.value)}
                  width="100px"
                  bg="white"
                  color="black"
                />
                <Button
                  size="xs"
                  colorPalette="green"
                  onClick={onEditTagSave}
                >
                  Save
                </Button>
                <Button
                  size="xs"
                  colorPalette="gray"
                  variant="surface"
                  onClick={onEditTagCancel}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Text fontSize="sm" color="white">
                  {tag.name}
                </Text>
                <IconButton
                  size="sm"
                  boxSize={4}
                  as={FiEdit2}
                  aria-label="Edit tag"
                  variant="ghost"
                  colorPalette="teal"
                  color="white"
                  onClick={() => onEditTagStart(tag.id, tag.name)}
                />
                <IconButton
                  size="sm"
                  boxSize={4}
                  as={FiTrash2}
                  aria-label="Delete tag"
                  variant="ghost"
                  colorPalette="red"
                  onClick={() => onDeleteTag(tag)}
                />
              </>
            )}
          </HStack>
        ))}

        {/* Add Tag Icon */}
        <IconButton
          size="sm"
          boxSize={4}
          as={FiPlus}
          aria-label="Add tag"
          variant="ghost"
          colorPalette="teal"
          onClick={onAddTagClick}
        />
      </HStack>
    );
  }

  return null;
}

