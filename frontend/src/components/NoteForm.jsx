import { useEffect, useState } from "react";
import api, { getAllTags, getLoggedInUserNotes } from "../api/axios";
import useSWR, { mutate } from "swr";
import { fetcher } from "../api/axios";
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
import NotesTags from "./NotesTags";

export default function NoteForm() {
  const { data: userNotes, isLoading } = useSWR(
    "user/notes",
    getLoggedInUserNotes
  );
  const [tags, setTags] = useState([]);
  useEffect(() => {
    if (userNotes) {
      // [[{"id": 1}, {"id:" }]]
      const notesTags = userNotes.notes.map((n) => n.tags).flat();
      const uniqueTags = [];
      notesTags.forEach((tag) => {
        const tagExist = uniqueTags.find((t) => t.id == tag.id);
        if (!tagExist) {
          uniqueTags.push(tag);
        }
      });
      setTags(uniqueTags);
    }
  }, [userNotes]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteTags, setNoteTags] = useState([]);

  const [selectedTagId, setSelectedTagId] = useState("");
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  // const handleSelectTag = () => {}
  // Add existing tag to note
  const handleSelectTag = () => {
    if (!selectedTagId) return;
    const tagExist = noteTags.indexOf(Number(selectedTagId));
    if (tagExist === -1) {
      setNoteTags([...noteTags, Number(selectedTagId)]);
    }
    setSelectedTagId("");
    // setNoteTags([...new Set([...noteTags, selectedTagId])]);
  };

  // // Remove tag from note
  const handleRemoveTag = (id) => {
    setNoteTags(noteTags.filter((tagId) => tagId !== id));
  };

  // const handleAddNewTag = () => {}

  // // Add new tag to backend
  const handleAddNewTag = async () => {
    const name = newTag.trim().toLowerCase();
    if (!name) return;
    if (noteTags.some((t) => t.name === name)) {
      setError("This tag already exists");
      return;
    }
    try {
      const res = await api.post("/tags", { name });
      const newTagObj = res.data.tag;

      setNoteTags([...noteTags, newTagObj]);
      setNewTag("");
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create tag");
    }
  };

  // const handleSubmit = () => {}
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
      // invalidate cache to re-fetch notes
      // mutate("/notes")
      toaster.create({
        title: "Note created",
      });

      // Clear form fields
      setTitle("");
      setContent("");
      setNoteTags([]);
    } catch (err) {
      console.error(err);
      setError("Failed to create note");
    }
  };

  if (isLoading) {
    return <p>Loading Tags/Notes</p>;
  }

  // noteTags [1,2,3,4]
  // [ {"id":1 ,name: "Javascript"}]

  const selectedTags = tags.filter((tag) => noteTags.includes(tag.id));
  console.log({ selectedTags, noteTags, tags });

  return (
    <Flex w="100%" justify="center" bg="gray.50" py={10}>
      <Box bg="white" p={6} borderRadius="md" shadow="md" maxW="600px" w="100%">
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
            <NotesTags noteTags={selectedTags} onDeleteTag={handleRemoveTag} />

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
