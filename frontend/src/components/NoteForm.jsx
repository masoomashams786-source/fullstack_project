import { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Box,
  Stack,
  Input,
  Textarea,
  Button,
  HStack,
  Badge,
  Text,
  NativeSelect,
  Flex
} from "@chakra-ui/react";

export default function NoteForm({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState("");
  const [newTag, setNewTag] = useState("");
  const [noteTags, setNoteTags] = useState([]);
  const [error, setError] = useState("");

  // Fetch existing tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get("/tags"); // FIX: no trailing slash
        setTags(res.data.tags || []);
      } catch (err) {
        console.error("Failed to fetch tags:", err);
        setError("Failed to load tags");
      }
    };
    fetchTags();
  }, []);

  // Add existing tag to note
  const handleSelectTag = () => {
    if (!selectedTagId) return;
    const tag = tags.find((t) => t.id.toString() === selectedTagId.toString());
    if (tag && !noteTags.some((t) => t.id === tag.id)) {
      setNoteTags([...noteTags, tag]);
    }
    setSelectedTagId("");
  };

  // Remove tag from note
  const handleRemoveTag = (id) => {
    setNoteTags(noteTags.filter((t) => t.id !== id));
  };

  // Add new tag to backend
  const handleAddNewTag = async () => {
    const name = newTag.trim().toLowerCase();
    if (!name) return;
    if (tags.some((t) => t.name === name)) {
      setError("This tag already exists");
      return;
    }
    try {
      const res = await api.post("/tags", { name }); // FIX: no trailing slash
      setTags([...tags, res.data.tag]);
      setNoteTags([...noteTags, res.data.tag]);
      setNewTag("");
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create tag");
    }
  };

  // Submit note
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title cannot be empty");
      return;
    }

    const noteData = {
      title,
      content,
      tag_ids: noteTags.map((t) => t.id), // match backend
    };

    try {
      await api.post("/notes", noteData); // FIX: no trailing slash
      setTitle("");
      setContent("");
      setNoteTags([]);
      setError("");
      if (onSubmit) onSubmit(noteData);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create note");
    }
  };

  return (
    <Flex w="100%" justify="center" bg="gray.50" py={10}>
      <Box bg="white" p={6} borderRadius="md" shadow="md" maxW="600px" w="100%">
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <Text fontSize="xl" textAlign="center" fontWeight="bold" color="teal.700">
              Create New Note
            </Text>
            <Text fontSize="sm" textAlign="center" color="gray.700">
              What's on your mind today?
            </Text>

            {/* Title */}
            <Stack>
              <Text color="teal.700">Title</Text>
              <Input
                placeholder="Enter note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                color="teal.800"
                bg="white"
                _focus={{
                  borderColor: "teal.500",
                  boxShadow: "0 0 0 1px teal.500",
                }}
              />
            </Stack>

            {/* Content */}
            <Stack>
              <Text color="teal.700">Content</Text>
              <Textarea
                placeholder="Write your note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                color="teal.700"
                bg="white"
                _focus={{
                  borderColor: "teal.500",
                  boxShadow: "0 0 0 1px teal.500",
                }}
              />
            </Stack>

            {/* Select Existing Tag */}
            <Stack>
              <Text color="teal.700">Select Existing Tag</Text>
              <HStack>
                <NativeSelect.Root>
                  <NativeSelect.Field
                    value={selectedTagId}
                    onChange={(e) => setSelectedTagId(e.target.value)}
                  >
                    <option value="">-- Select a tag --</option>
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
                <Button size="sm" colorPalette="teal" onClick={handleSelectTag}>
                  Add
                </Button>
              </HStack>
            </Stack>

            {/* Create New Tag */}
            <Stack>
              <Text color="teal.700">Create New Tag</Text>
              <HStack>
                <Input
                  placeholder="New tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  color="teal.700"
                />
                <Button size="sm" colorPalette="teal" onClick={handleAddNewTag}>
                  Add
                </Button>
              </HStack>
            </Stack>

            {/* Selected Tags */}
            <Stack direction="row" spacing={2} wrap="wrap">
              {noteTags.map((tag) => (
                <Badge key={tag.id} colorPalette="teal" px={2} py={1} borderRadius="md">
                  <HStack spacing={1}>
                    <Text>{tag.name}</Text>
                    <Button
                      size="xs"
                      onClick={() => handleRemoveTag(tag.id)}
                      variant="ghost"
                      colorPalette="red"
                    >
                      x
                    </Button>
                  </HStack>
                </Badge>
              ))}
            </Stack>

            {/* Error */}
            {error && (
              <Text color="red.500" fontSize="sm">
                {error}
              </Text>
            )}

            {/* Submit */}
            <Button type="submit" colorPalette="teal">
              Submit
            </Button>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
}
