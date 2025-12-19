import {
  Dialog,
  Portal,
  Stack,
  Text,
  HStack,
  NativeSelect,
  Input,
  Button,
  Badge,
  IconButton,
  Alert,
} from "@chakra-ui/react";
import { FiTrash2 } from "react-icons/fi";

export default function AddTagDialog({
  isOpen,
  onOpenChange,
  allTags,
  noteTags,
  tagsToAdd,
  selectedExistingTagId,
  newTagName,
  tagAlert,
  onAddExistingTag,
  onAddNewTag,
  onRemovePendingTag,
  onSaveTags,
  onClearAlert,
  setSelectedExistingTagId,
  setNewTagName,
  setTagsToAdd,
}) {
  const currentTagsInDialog = [...noteTags, ...tagsToAdd];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Add Tags to Note</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body pb="4">
              <Stack gap="4">
                {/* Alert Component */}
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
                          onClearAlert();
                        }}
                      >
                        <option value="">-- Select a tag --</option>
                        {allTags
                          .filter((tag) => !noteTags.some((nt) => nt.id === tag.id))
                          .map((tag) => (
                            <option key={tag.id} value={tag.id}>
                              {tag.name}
                            </option>
                          ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                    <Button size="sm" colorPalette="teal" onClick={onAddExistingTag}>
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
                        onClearAlert();
                      }}
                    />
                    <Button size="sm" colorPalette="teal" onClick={onAddNewTag}>
                      Add
                    </Button>
                  </HStack>
                </Stack>

                {/* Combined Tag Preview */}
                <Stack>
                  <Text color="teal.700" fontWeight="medium">
                    Tags to be Attached
                  </Text>
                  <HStack spacing={2} wrap="wrap">
                    {currentTagsInDialog.map((tag, index) => (
                      <Badge
                        key={tag.id || `new-${index}`}
                        colorPalette={
                          noteTags.some((t) => t.id === tag.id) ? "gray" : "teal"
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
                            onClick={() => onRemovePendingTag(tag)}
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
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={onSaveTags} disabled={tagsToAdd.length === 0}>
                Save ({tagsToAdd.length} Tag{tagsToAdd.length !== 1 ? "s" : ""})
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

