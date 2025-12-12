import {
  Box,
  Heading,
  Text,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";

export default function NoteCard({ note }) {
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="md"
      shadow="sm"
      bg="white"
    >
      {/* Header: Title + Actions */}
      <HStack justify="space-between" align="start">
        <Heading size="md" color="teal.600">
          {note.title}
        </Heading>

        <HStack>
          <IconButton
            size="sm"
            icon={<EditIcon />}
            aria-label="Edit note"
            variant="ghost"
            colorScheme="teal"
          />
          <IconButton
            size="sm"
            icon={<DeleteIcon />}
            aria-label="Delete note"
            variant="ghost"
            colorScheme="red"
          />
        </HStack>
      </HStack>

      {/* Content */}
      <Text mt={3} noOfLines={4} color="gray.700">
        {note.content}
      </Text>

      {/* Tags section will go here later */}
    </Box>
  );
}
