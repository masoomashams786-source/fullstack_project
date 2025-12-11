import { useState, useEffect } from "react";
import { Box, Heading, Field, Input, Button, Text } from "@chakra-ui/react";
import api from "../api/axios"; 
function Tags() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [error, setError] = useState("");

  
  
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get("/tags");
        setTags(response.data.tags);
      } catch (err) {
        console.error("Failed to fetch tags:", err);
        setError("Failed to load tags");
      }
    };
    fetchTags();
  }, []);

  
  const handleAddTag = async () => {
    const name = newTag.trim().toLowerCase();
    if (!name) return;

    if (tags.some((tag) => tag.name === name)) {
      setError("This tag already exists");
      return;
    }

    try {
      const response = await api.post("/tags", { name }); 
      setTags([...tags, response.data.tag]);
      setNewTag("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create tag");
    }
  };


  const startEditingTag = (tag) => {
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
    setError("");
  };

  
  const saveEditedTag = async () => {
    const name = editingTagName.trim().toLowerCase();
    if (!name) return;

    if (tags.some((tag) => tag.name === name && tag.id !== editingTagId)) {
      setError("This tag already exists");
      return;
    }

    try {
      const response = await api.put(`/tags/${editingTagId}`, { name }); // PUT /tags/:id
      setTags(tags.map((tag) => (tag.id === editingTagId ? response.data.tag : tag)));
      setEditingTagId(null);
      setEditingTagName("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update tag");
    }
  };

 
  const handleDeleteTag = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this tag?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/tags/${id}`); // DELETE /tags/:id
      setTags(tags.filter((tag) => tag.id !== id));
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete tag");
    }
  };

  return (
    <Box p={4}>
      <Heading size="md" mb={4}>Tags Component</Heading>

      <Field.Root>
        <Field.Label>Create Tag</Field.Label>
        <Input
          placeholder="Subject"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
        />
      </Field.Root>

      {error && <Text color="red.500" mt={1}>{error}</Text>}

      <Button mt={2} onClick={handleAddTag} disabled={!newTag.trim()}>
        Add Tag
      </Button>

      <ul style={{ marginTop: "16px" }}>
        {tags.map((tag) => (
          <li key={tag.id} style={{ marginBottom: "8px" }}>
            {editingTagId === tag.id ? (
              <>
                <Input
                  size="sm"
                  value={editingTagName}
                  onChange={(e) => setEditingTagName(e.target.value)}
                  display="inline-block"
                  width="auto"
                />
                <Button size="sm" colorScheme="green" onClick={saveEditedTag} ml={2}>
                  Save
                </Button>
                <Button
                  size="sm"
                  ml={1}
                  onClick={() => {
                    setEditingTagId(null);
                    setEditingTagName("");
                    setError("");
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {tag.name}{" "}
                <Button size="sm" onClick={() => startEditingTag(tag)} ml={2}>
                  Edit
                </Button>
                <Button size="sm" colorScheme="red" onClick={() => handleDeleteTag(tag.id)} ml={1}>
                  Delete
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </Box>
  );
}

export default Tags;
