import { Stack, Input, Textarea, HStack, Button } from "@chakra-ui/react";

export default function NoteCardEditForm({
  note,
  localTitle,
  localContent,
  operatingId,
  onUpdate,
  onCancel,
  setLocalTitle,
  setLocalContent,
}) {
  return (
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
  );
}

