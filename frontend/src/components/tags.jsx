import React from 'react';
import { useState } from 'react';
import { Box, Heading } from '@chakra-ui/react';

function Tags() {
    const [tags, setTags] = useState([
        "Work",
        "Study",
        "Personal"
    ]);

    const [newTag, setNewTag] = useState('');

    const handleAddTag = (newTag) => {
        setTags([...tags, newTag]);
        setNewTag('');
    }   
  return (
    <Box p={4}>
      <Heading size="md" mb={4}>
        Tags Component
      </Heading>
      <ul>
        {tags.map((tag, index) => (
          <li key={index}>{tag}</li>
        ))}
      </ul>
    </Box>
  );
}

export default Tags;
        