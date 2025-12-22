import { Box, Text, Badge, Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import ConfirmDialog from "./confirmDialog";
import api from "../api/axios";
import useSWRMutation from "swr/mutation";
import NoteCardEditForm from "./notes/NoteCardEditForm";
import NoteCardHeader from "./notes/NoteCardHeader";
import NoteCardTags from "./notes/NoteCardTags";
import AddTagDialog from "./notes/AddTagDialog";
import { useTextSize } from "../context/TextSizeContext";

export default function NoteCard({
  note,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  isArchivedView = false,
  isTrashView = false,
  onRecover,
  onDeleteForever,
  allTags,
  isEditing,
  onUpdate,
  onCancel,
  operatingId,
  onEditTag,

  onAlertError,
  onAlertSuccess,

  onTagsChanged,
}) {
  const { trigger: deleteNoteTagTrigger } = useSWRMutation(
    `/notes/${note.id}/tags`,
    async (url, { arg }) => {
      await api.delete(`${url}/${arg.tagId}`);
      return arg.tagId;
    }
  );

  // ------------------ Local states ------------------
  const { textSize } = useTextSize();
  const [isDeleteNoteOpen, setIsDeleteNoteOpen] = useState(false);
  const [isDeleteTagOpen, setIsDeleteTagOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isUnarchiveOpen, setIsUnarchiveOpen] = useState(false);
  const [isRecoverOpen, setIsRecoverOpen] = useState(false);
  const [isDeleteForeverOpen, setIsDeleteForeverOpen] = useState(false);
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

  useEffect(() => {
    setLocalTitle(note.title);
    setLocalContent(note.content);
    setNoteTags(note.tags || []);
  }, [note]);

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

  // ------------------ mutation hook for global tags ------------------
  const { trigger: createTagTrigger } = useSWRMutation(
    "/tags",
    async (url, { arg }) => {
      const res = await api.post(url, { name: arg.name });
      return res.data.tag; // return the newly created tag
    }
  );

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
            tagToAttach = await createTagTrigger({ name: tag.name });
            // 2. COLLECT the new tag for global update
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

      if (onTagsChanged) {
        await onTagsChanged();
      }

      setIsAddTagDialogOpen(false);
      onAlertSuccess("Tags successfully attached to note!");
    } catch (err) {
      console.error(err);
      setTagAlert(err.response?.data?.error || "Failed to add tags");
    }
  };

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      borderColor="border.subtle"
      shadow="sm"
      bg={{ base: "white", _dark: "gray.900" }}
      borderRightWidth="1px"
    >
      {/* Note Editing */}
      {isEditing && !isTrashView ? (
        <NoteCardEditForm
          note={note}
          localTitle={localTitle}
          localContent={localContent}
          operatingId={operatingId}
          onUpdate={onUpdate}
          onCancel={onCancel}
          setLocalTitle={setLocalTitle}
          setLocalContent={setLocalContent}
        />
      ) : (
        <>
          {/* Note Header */}
          <NoteCardHeader
            note={note}
            isTrashView={isTrashView}
            operatingId={operatingId}
            onEdit={onEdit}
            setIsRecoverOpen={setIsRecoverOpen}
            setIsDeleteNoteOpen={setIsDeleteNoteOpen}
            setIsDeleteForeverOpen={setIsDeleteForeverOpen}
          />

          {/* Note Content */}
          <Text mt={3} fontSize={textSize} noOfLines={4} color="fg.muted">
            {note.content}
          </Text>
          <Badge fontSize={textSize} mt={2}>
            {new Date(note.created_at).toLocaleDateString()}
          </Badge>

          {/* Archive/Unarchive button - Hide in trash view */}
          {!isTrashView &&
            (isArchivedView ? (
              <Button
                mt={2}
                size="xs"
                variant="ghost"
                colorPalette="blue"
                onClick={() => setIsUnarchiveOpen(true)}
              >
                Unarchive?
              </Button>
            ) : (
              <Button
                mt={2}
                size="xs"
                variant="ghost"
                colorPalette="blue"
                onClick={() => setIsArchiveOpen(true)}
              >
                Archive?
              </Button>
            ))}

          {/* Tags Section */}
          <NoteCardTags
            noteTags={noteTags}
            isTrashView={isTrashView}
            editingTagId={editingTagId}
            editingTagName={editingTagName}
            onEditTagStart={(tagId, tagName) => {
              setEditingTagId(tagId);
              setEditingTagName(tagName);
            }}
            onEditTagCancel={() => {
              setEditingTagId(null);
              setEditingTagName("");
            }}
            onEditTagSave={handleTagEditSave}
            onDeleteTag={(tag) => {
              setSelectedTag(tag);
              setIsDeleteTagOpen(true);
            }}
            onAddTagClick={() => setIsAddTagDialogOpen(true)}
            setEditingTagName={setEditingTagName}
          />
        </>
      )}
      {/* ------------------- Confirm Dialogs ------------------- */}
      <ConfirmDialog
        isOpen={isDeleteTagOpen}
        onClose={() => setIsDeleteTagOpen(false)}
        title="Delete tag?"
        description={`Are you sure you want to delete "${selectedTag?.name}"?`}
        confirmText="Delete Tag"
        onConfirm={async () => {
          try {
            await deleteNoteTagTrigger({ tagId: selectedTag.id });
            setNoteTags(noteTags.filter((t) => t.id !== selectedTag.id));
            setIsDeleteTagOpen(false);

            if (onTagsChanged) {
              await onTagsChanged();
            }
          } catch (err) {
            console.error("Failed to delete tag:", err);
            if (onAlertError) onAlertError(err, "delete tag");
          }
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

      {/* Archive confirmation dialog */}
      <ConfirmDialog
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        title="Archive note?"
        description={`Are you sure you want to archive "${note.title}"?`}
        confirmText="Archive Note"
        onConfirm={async () => {
          try {
            await onArchive(note.id);
          } finally {
            setIsArchiveOpen(false);
          }
        }}
      />

      {/* Unarchive confirmation dialog */}
      <ConfirmDialog
        isOpen={isUnarchiveOpen}
        onClose={() => setIsUnarchiveOpen(false)}
        title="Unarchive note?"
        description={`Are you sure you want to unarchive "${note.title}"?`}
        confirmText="Unarchive Note"
        onConfirm={async () => {
          try {
            await onUnarchive(note.id);
          } finally {
            setIsUnarchiveOpen(false);
          }
        }}
      />

      {/* Recover confirmation dialog */}
      <ConfirmDialog
        isOpen={isRecoverOpen}
        onClose={() => setIsRecoverOpen(false)}
        title="Recover note?"
        description={`Are you sure you want to recover "${note.title}"? It will be restored to your notes.`}
        confirmText="Recover Note"
        onConfirm={async () => {
          try {
            await onRecover(note.id);
          } finally {
            setIsRecoverOpen(false);
          }
        }}
      />

      {/* Delete Forever confirmation dialog */}
      <ConfirmDialog
        isOpen={isDeleteForeverOpen}
        onClose={() => setIsDeleteForeverOpen(false)}
        title="Delete forever?"
        description={`Are you sure you want to permanently delete "${note.title}"? This action cannot be undone.`}
        confirmText="Delete Forever"
        onConfirm={async () => {
          try {
            await onDeleteForever(note.id);
          } finally {
            setIsDeleteForeverOpen(false);
          }
        }}
      />

      <AddTagDialog
        isOpen={isAddTagDialogOpen}
        onOpenChange={handleOpenTagDialog}
        allTags={allTags}
        noteTags={noteTags}
        tagsToAdd={tagsToAdd}
        selectedExistingTagId={selectedExistingTagId}
        newTagName={newTagName}
        tagAlert={tagAlert}
        onAddExistingTag={handleAddExistingTag}
        onAddNewTag={handleAddNewTag}
        onRemovePendingTag={(tag) => {
          setTagsToAdd(tagsToAdd.filter((t) => t !== tag));
          setTagAlert(null);
        }}
        onSaveTags={handleSaveTags}
        onClearAlert={() => setTagAlert(null)}
        setSelectedExistingTagId={setSelectedExistingTagId}
        setNewTagName={setNewTagName}
        setTagsToAdd={setTagsToAdd}
      />
    </Box>
  );
}
