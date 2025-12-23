import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { mutate } from "swr";
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
  Flex,
} from "@chakra-ui/react";
import { toaster } from "./ui/toaster";

export default function NoteForm({ allTags = [] }) {
  // ← ACCEPT PROP
  const navigate = useNavigate();
  const formRef = useRef(null);

  // Auto-scroll and focus on mobile
  useEffect(() => {
    if (window.innerWidth <= 768 && formRef.current) {
      formRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      const input = formRef.current.querySelector("input");
      input?.focus();
    }
  }, []);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteTags, setNoteTags] = useState([]); // Array of tag IDs
  const [selectedTagId, setSelectedTagId] = useState("");
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");

  // Use allTags from Dashboard prop
  const tags = allTags; // ← USE PROP INSTEAD OF LOCAL STATE

  // Add existing tag to note
  const handleSelectTag = () => {
    if (!selectedTagId) return;
    const tagId = Number(selectedTagId);

    if (!noteTags.includes(tagId)) {
      setNoteTags([...noteTags, tagId]);
    }
    setSelectedTagId("");
  };

  // Remove tag from note
  const handleRemoveTag = (id) => {
    setNoteTags(noteTags.filter((tagId) => tagId !== id));
  };

  // Add new tag to backend
  const handleAddNewTag = async () => {
    const name = newTag.trim().toLowerCase();
    if (!name) return;

    // Check if tag already exists
    if (tags.some((t) => t.name.toLowerCase() === name)) {
      setError("This tag already exists. Please select it from the dropdown.");
      return;
    }

    try {
      const res = await api.post("/tags", { name });
      const newTagObj = res.data.tag;

      // Add to note's tags
      setNoteTags([...noteTags, newTagObj.id]);

      setNewTag("");
      setError("");

      // Revalidate notes to refresh tags globally
      await mutate("/notes");

      toaster.create({
        title: "Tag created successfully",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create tag");
    }
  };

  // Submit note
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title cannot be empty");
      return;
    }

    const noteData = {
      title,
      content,
      tag_ids: noteTags,
    };

    try {
      await api.post("/notes", noteData);
      await mutate("/notes");

      toaster.create({
        title: "Note created successfully",
        type: "success",
      });

      // Clear form fields
      setTitle("");
      setContent("");
      setNoteTags([]);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create note");
    }
  };

  // Get selected tag objects for display
  const selectedTags = tags.filter((tag) => noteTags.includes(tag.id));

  return (
    <Flex w="100%" justify="center" bg="bg.page" py={10}>
      <Box
        ref={formRef}
        bg={{ base: "white", _dark: "gray.900" }}
        p={6}
        borderRadius="lg"
        shadow="sm"
        borderWidth="2px"
        borderColor="border.subtle"
        w="full"
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <Text
              fontSize="xl"
              textAlign="center"
              fontWeight="bold"
              color="teal.700"
            >
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
              {selectedTags.map((tag) => (
                <Badge
                  key={tag.id}
                  colorPalette="teal"
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  <HStack spacing={1}>
                    <Text>{tag.name}</Text>
                    <Button
                      size="xs"
                      onClick={() => handleRemoveTag(tag.id)}
                      variant="ghost"
                      colorPalette="red"
                    >
                      ×
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
