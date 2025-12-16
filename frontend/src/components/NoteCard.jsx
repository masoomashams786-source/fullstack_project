import {
  Box,
  Heading,
  Text,
  HStack,
  IconButton,
  Input,
  Textarea,
  Stack,
  Button,
  Badge,
  Dialog,
  Portal,
  NativeSelect,
  Alert,
} from "@chakra-ui/react";
import { FiEdit2, FiTrash2, FiPlus, FiTag } from "react-icons/fi";
import { useState } from "react";
import ConfirmDialog from "./confirmDialog";
import api from "../api/axios";

export default function NoteCard({
  note,
  onEdit,
  onDelete,
  allTags,
  isEditing,
  onUpdate,
  onCancel,
  operatingId,
  onEditTag,
  onDeleteTag,
  onAlertError,
  onAlertSuccess,
  setGlobalTags,
}) {
  // ------------------ Local states ------------------
  const [isDeleteNoteOpen, setIsDeleteNoteOpen] = useState(false);
  const [isDeleteTagOpen, setIsDeleteTagOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [localTitle, setLocalTitle] = useState(note.title);
  const [localContent, setLocalContent] = useState(note.content);

  const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState(false);
  const [selectedExistingTagId, setSelectedExistingTagId] = useState("");
  const [selectedExistingTags, setSelectedExistingTags] = useState([]);
  const [newTags, setNewTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");

  const [noteTags, setNoteTags] = useState(note.tags || []);
  const [tagsToAdd, setTagsToAdd] = useState([]);
  const [tagAlert, setTagAlert] = useState(null);
  const currentTagsInDialog = [...noteTags, ...tagsToAdd];

  // ------------------ Handlers ------------------
  const handleOpenTagDialog = (isOpen) => {
    setIsAddTagDialogOpen(isOpen);
    // Reset temporary states when dialog is opened or closed
    if (isOpen) {
      setTagsToAdd([]);
      setNewTagName("");
      setSelectedExistingTagId("");
      setTagAlert(null);
    }
  };

  const isDuplicateTag = (tag) => {
    return currentTagsInDialog.some(
      (t) =>
        (tag.id && t.id === tag.id) ||
        t.name.toLowerCase() === tag.name.toLowerCase()
    );
  };

  const handleTagEditSave = () => {
    const trimmedName = editingTagName.trim();

    if (!trimmedName) {
      onAlertError(
        { response: { data: { error: "Tag name cannot be empty." } } },
        "validate tag"
      );
      return;
    }

    const isDuplicateOnNote = note.tags.some(
      (tag) =>
        tag.id !== editingTagId &&
        tag.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicateOnNote) {
      onAlertError(
        {
          response: {
            data: {
              error: `The tag name "${trimmedName}" already exists on this note.`,
            },
          },
        },
        "validate tag"
      );
      return;
    }

    onEditTag(editingTagId, trimmedName, note.id);

    setEditingTagId(null);
    setEditingTagName("");
  };

  // ------------------ Add Existing Tag ------------------
  const handleAddExistingTag = () => {
    if (!selectedExistingTagId) {
      setTagAlert("Please select a tag from the list.");
      return;
    }

    const tag = allTags.find((t) => t.id === parseInt(selectedExistingTagId));
    if (!tag) return;

    if (noteTags.some((t) => t.id === tag.id)) {
      setTagAlert(`"${tag.name}" is already on this note.`);
      return;
    }

    if (tagsToAdd.some((t) => t.id === tag.id)) {
      setTagAlert(`"${tag.name}" is already selected to be added.`);
      return;
    }

    setTagsToAdd([...tagsToAdd, tag]);
    setSelectedExistingTagId(""); // Clear selection
    setTagAlert(null);
  };

  // ------------------ Add New Tag ------------------
  const handleAddNewTag = () => {
    const name = newTagName.trim();
    if (!name) {
      setTagAlert("Tag name cannot be empty.");
      return;
    }

    const existingGlobalTag = allTags.find(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );

    if (existingGlobalTag) {
      if (noteTags.some((t) => t.id === existingGlobalTag.id)) {
        setTagAlert(
          `"${name}" already exists and is attached to this note. Use the 'Select Existing Tag' list.`
        );
        setNewTagName("");
        return;
      }

      if (tagsToAdd.some((t) => t.id === existingGlobalTag.id)) {
        setTagAlert(`"${name}" is already selected to be added.`);
        setNewTagName("");
        return;
      }

      setTagsToAdd([...tagsToAdd, existingGlobalTag]);
      setNewTagName("");
      setTagAlert(null);
      return;
    }

    if (
      tagsToAdd.some(
        (t) => t.name.toLowerCase() === name.toLowerCase() && !t.id
      )
    ) {
      setTagAlert(`"${name}" is already waiting to be added as a new tag.`);
      setNewTagName("");
      return;
    }

    // New, unique, non-global tag. Add it to tagsToAdd with only a name.
    setTagsToAdd([...tagsToAdd, { name, isNew: true }]);
    setNewTagName("");
    setTagAlert(null);
  };

  // ------------------ Save Tags ------------------
  // NoteCard.jsx

  // ------------------ Save Tags (CORRECTED VERSION) ------------------
  const handleSaveTags = async () => {
    if (tagsToAdd.length === 0) {
      setIsAddTagDialogOpen(false);
      return;
    }

    try {
      const newlyAttachedTags = [...noteTags];
      const tagsToProcess = [...tagsToAdd]; // 1. Define the array to track tags newly created globally
      const globallyNewTags = [];

      for (const tag of tagsToProcess) {
        let tagToAttach = tag;

        if (!tag.id) {
          const existingGlobalTag = allTags.find(
            (t) => t.name.toLowerCase() === tag.name.toLowerCase()
          );
          if (existingGlobalTag) {
            tagToAttach = existingGlobalTag;
          } else {
            // Create new tag in backend
            const res = await api.post("/tags", { name: tag.name });
            tagToAttach = res.data.tag; // 2. COLLECT the new tag for global update
            globallyNewTags.push(tagToAttach);
          }
        }

        if (!newlyAttachedTags.some((t) => t.id === tagToAttach.id)) {
          await api.post(`/notes/${note.id}/tags`, { tag_id: tagToAttach.id });
          newlyAttachedTags.push(tagToAttach);
        }
      }

      setNoteTags(newlyAttachedTags);
      setTagsToAdd([]);
      setNewTagName("");
      setIsAddTagDialogOpen(false); // 3. Use the collected tags to update the global state

      if (globallyNewTags.length > 0) {
        setGlobalTags((prevTags) => [...prevTags, ...globallyNewTags]);
      }

      onAlertSuccess("Tags successfully attached to note!");
    } catch (err) {
      console.error(err);
      setTagAlert(err.response?.data?.error || "Failed to add tags");
    }
  };

  // Remove tag from note locally (frontend only)
  const handleRemoveNoteTag = (id) => {
    setNoteTags(noteTags.filter((t) => t.id !== id));
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" shadow="sm" bg="white">
      {/* ------------------- Note Editing ------------------- */}
      {isEditing ? (
        <Stack key={`edit-${note.id}`} gap={2}>
          <Input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Note title"
          />
          <Textarea
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            placeholder="Note content"
          />
          <HStack mt={2}>
            <Button
              size="sm"
              colorPalette="green"
              onClick={() => onUpdate(note.id, localTitle, localContent)}
              isLoading={operatingId === note.id}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="surface"
              colorPalette="gray"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </HStack>
        </Stack>
      ) : (
        <>
          {/* ------------------- Note Header ------------------- */}
          <HStack justify="space-between" align="start">
            <Heading size="md" color="teal.700">
              {note.title}
            </Heading>
            <HStack spacing={1}>
              <IconButton
                size="sm"
                boxSize={5}
                as={FiEdit2}
                aria-label="Edit note"
                variant="ghost"
                colorPalette="teal"
                onClick={() => onEdit(note)}
              />
              <IconButton
                size="sm"
                boxSize={5}
                as={FiTrash2}
                aria-label="Delete note"
                variant="ghost"
                colorPalette="red"
                onClick={() => setIsDeleteNoteOpen(true)}
              />
            </HStack>
          </HStack>

          {/* ------------------- Note Content ------------------- */}
          <Text mt={3} noOfLines={4} color="gray.700">
            {note.content}
          </Text>
          <Badge mt={2}>{new Date(note.created_at).toLocaleDateString()}</Badge>

          {/* ------------------- Tags Section ------------------- */}
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
                      onClick={handleTagEditSave}
                    >
                      Save
                    </Button>
                    <Button
                      size="xs"
                      colorPalette="gray"
                      variant="surface"
                      onClick={() => {
                        setEditingTagId(null);
                        setEditingTagName("");
                      }}
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
                      onClick={() => {
                        setEditingTagId(tag.id);
                        setEditingTagName(tag.name);
                      }}
                    />
                    <IconButton
                      size="sm"
                      boxSize={4}
                      as={FiTrash2}
                      aria-label="Delete tag"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => {
                        setSelectedTag(tag);
                        setIsDeleteTagOpen(true);
                      }}
                    />
                  </>
                )}
              </HStack>
            ))}

            {/* ------------------- Add Tag Icon ------------------- */}
            <IconButton
              size="sm"
              boxSize={4}
              as={FiPlus}
              aria-label="Add tag"
              variant="ghost"
              colorPalette="teal"
              onClick={() => setIsAddTagDialogOpen(true)}
            />
          </HStack>
        </>
      )}
      {/* ------------------- Confirm Dialogs ------------------- */}
      <ConfirmDialog
        isOpen={isDeleteTagOpen}
        onClose={() => setIsDeleteTagOpen(false)}
        title="Delete tag?"
        description={`Are you sure you want to delete "${selectedTag?.name}"?`}
        confirmText="Delete Tag"
        onConfirm={() => {
          onDeleteTag(selectedTag.id, note.id);
          setIsDeleteTagOpen(false);
        }}
      />
      <ConfirmDialog
        isOpen={isDeleteNoteOpen}
        onClose={() => setIsDeleteNoteOpen(false)}
        title="Delete note?"
        description={`Are you sure you want to delete "${note.title}"?`}
        confirmText="Delete Note"
        onConfirm={() => {
          onDelete(note.id);
          setIsDeleteNoteOpen(false);
        }}
      />

      <Dialog.Root
        open={isAddTagDialogOpen}
        onOpenChange={handleOpenTagDialog} // Use new handler
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Add Tags to Note</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pb="4">
                <Stack gap="4">
                  {/* ------------------- Alert Component ------------------- */}
                  {tagAlert && (
                    <Stack gap="4" width="full">
                      <Alert.Root status="error">
                        <Alert.Indicator />
                        <Alert.Title>{tagAlert}</Alert.Title>
                      </Alert.Root>
                    </Stack>
                  )}

                  {/* Existing tags selection */}
                  <Stack>
                    <Text color="teal.700" fontWeight="medium">
                      Select Existing Tag
                    </Text>
                    <HStack>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          as="select"
                          value={selectedExistingTagId}
                          style={{ maxHeight: "200px", overflowY: "auto" }}
                          onChange={(e) => {
                            setSelectedExistingTagId(e.target.value);
                            setTagAlert(null); // Clear alert on change
                          }}
                        >
                          <option value="">-- Select a tag --</option>
                          {allTags
                            // Filter out tags already attached to the note
                            .filter(
                              (tag) => !noteTags.some((nt) => nt.id === tag.id)
                            )
                            .map((tag) => (
                              <option key={tag.id} value={tag.id}>
                                {tag.name}
                              </option>
                            ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                      <Button
                        size="sm"
                        colorPalette="teal"
                        onClick={handleAddExistingTag}
                      >
                        Add
                      </Button>
                    </HStack>
                  </Stack>

                  {/* New tags input */}
                  <Stack>
                    <Text color="teal.700">Create New Tag</Text>
                    <HStack>
                      <Input
                        placeholder="New tag name"
                        value={newTagName}
                        onChange={(e) => {
                          setNewTagName(e.target.value);
                          setTagAlert(null); // Clear alert on change
                        }}
                      />
                      <Button
                        size="sm"
                        colorPalette="teal"
                        onClick={handleAddNewTag}
                      >
                        Add
                      </Button>
                    </HStack>
                  </Stack>

                  {/* ------------------- Combined Tag Preview ------------------- */}
                  <Stack>
                    <Text color="teal.700" fontWeight="medium">
                      Tags to be Attached
                    </Text>
                    <HStack spacing={2} wrap="wrap">
                      {currentTagsInDialog.map((tag, index) => (
                        <Badge
                          key={tag.id || `new-${index}`}
                          colorPalette={
                            noteTags.some((t) => t.id === tag.id)
                              ? "gray"
                              : "teal"
                          }
                          px={2}
                          py={1}
                          borderRadius="md"
                        >
                          {tag.name}
                          {/* Remove button for pending tags only */}
                          {!noteTags.some((t) => t.id === tag.id) && (
                            <IconButton
                              size="xs"
                              boxSize={3}
                              ml={1}
                              as={FiTrash2}
                              aria-label={`Remove pending tag ${tag.name}`}
                              variant="ghost"
                              colorPalette="red"
                              onClick={() => {
                                setTagsToAdd(
                                  tagsToAdd.filter((t) => t !== tag)
                                );
                                setTagAlert(null);
                              }}
                            />
                          )}
                        </Badge>
                      ))}
                      {currentTagsInDialog.length === 0 && (
                        <Text fontSize="sm" color="gray.500">
                          No tags selected yet.
                        </Text>
                      )}
                    </HStack>
                  </Stack>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  variant="outline"
                  onClick={() => handleOpenTagDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveTags}
                  disabled={tagsToAdd.length === 0}
                >
                  Save ({tagsToAdd.length} Tag
                  {tagsToAdd.length !== 1 ? "s" : ""})
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
