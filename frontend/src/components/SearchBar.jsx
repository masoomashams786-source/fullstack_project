import { useState, useEffect, useRef } from "react";
import { Input, CloseButton, Box, Text, HStack, Kbd } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { HiX } from "react-icons/hi";

export default function SearchBar({
  onSearch,
  placeholder = "Search notes...",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Notify parent of search changes
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to clear search
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setSearchQuery("");
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClear = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  return (
    <Box w="full" maxW="600px" mx="auto" position="relative">
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        pl={12}
        pr={searchQuery ? 12 : 40}
        size="lg"
        bg={{ base: "white", _dark: "gray.900" }}
        borderColor="gray.300"
        _hover={{ borderColor: "teal.400" }}
        _focus={{
          borderColor: "teal.500",
          boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)",
          borderRadius: "lg",
        }}
        aria-label="Search notes"
      />

      {/* Search Icon */}
      <Box
        position="absolute"
        left={3}
        top="50%"
        transform="translateY(-50%)"
        pointerEvents="none"
        color="gray.400"
      >
        <FiSearch size={20} />
      </Box>

      {/* Clear Button */}
      {searchQuery && (
        <CloseButton
          position="absolute"
          right={2}
          top="50%"
          transform="translateY(-50%)"
          size="sm"
          variant="ghost"
          aria-label="Clear search"
          onClick={handleClear}
        >
          <HiX />
        </CloseButton>
      )}

      {/* Keyboard Shortcut Hint */}
      {!searchQuery && (
        <HStack
          position="absolute"
          right={3}
          top="50%"
          transform="translateY(-50%)"
          pointerEvents="none"
          spacing={1}
        >
          <Kbd>Ctrl</Kbd>
          <Text fontSize="xs" color="gray.400">
            +
          </Text>
          <Kbd>K</Kbd>
        </HStack>
      )}
    </Box>
  );
}
