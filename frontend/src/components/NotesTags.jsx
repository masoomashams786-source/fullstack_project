import {
    Badge,
    Button,
    HStack,
    Stack,
    Text
} from "@chakra-ui/react";
import { useTextSize } from "../context/TextSizeContext";
 const { textSize } = useTextSize();
const NotesTags = ({ noteTags, onDeleteTag }) => {
  return (
    <Stack direction="row" spacing={2} wrap="wrap">
      {noteTags.map((tag) => (
        <Badge key={tag.id} colorPalette="teal" px={2} py={1} borderRadius="md">
          <HStack spacing={1}>
            <Text fontSize={textSize}  >{tag.name}</Text>
            <Button
              size="xs"
              onClick={() => onDeleteTag(tag.id)}
              variant="ghost"
              colorPalette="red"
            >
              x
            </Button>
          </HStack>
        </Badge>
      ))}
    </Stack>
  );
};

export default NotesTags;