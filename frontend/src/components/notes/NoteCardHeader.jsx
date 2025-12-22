import { HStack, Heading, IconButton, Button } from "@chakra-ui/react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useTextSize } from "../../context/TextSizeContext";

export default function NoteCardHeader({
  note,
  isTrashView,
  operatingId,
  onEdit,
  setIsRecoverOpen,
  setIsDeleteNoteOpen,
  setIsDeleteForeverOpen,
}) {
  const { textSize, cycleTextSize } = useTextSize();
  return (
    <HStack justify="space-between" align="start">
      <Heading size={textSize} color="teal.700">
        {note.title}
      </Heading>
      <HStack spacing={1}>
        {isTrashView ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              colorPalette="green"
              onClick={() => setIsRecoverOpen(true)}
              isLoading={operatingId === note.id}
            >
              Recover
            </Button>
            <IconButton
              size="sm"
              boxSize={5}
              as={FiTrash2}
              aria-label="Delete forever"
              variant="ghost"
              colorPalette="red"
              onClick={() => setIsDeleteForeverOpen(true)}
            />
          </>
        ) : (
          <>
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
          </>
        )}
      </HStack>
    </HStack>
  );
}
