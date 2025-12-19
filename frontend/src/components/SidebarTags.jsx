import { 
    Stack, 
    Button, 
    Flex, 
    Icon, 
    Text, 
    Checkbox, 
    Separator// Using Separator for compatibility
} from "@chakra-ui/react";
import { FiTag, FiFilter } from "react-icons/fi";
import { useState, useMemo, useEffect } from "react";

const INITIAL_TAG_LIMIT = 3; 

export default function SidebarTags({ 
    collapsed, 
    allTags, 
    currentFilterTagIds=[],
    onApplyFilter
}) {
    
   const [localSelectedTagIds, setLocalSelectedTagIds] = useState(
        Array.isArray(currentFilterTagIds) ? currentFilterTagIds : []
    );
    const [showAllTags, setShowAllTags] = useState(false);

   

    // 3. Memoized and SAFE Sorting Logic
   
       const sortedTags = useMemo(() => {
        if (!Array.isArray(allTags) || allTags.length === 0) {
            return [];
        }
        const validTags = allTags.filter(tag => tag && tag.name);
        return [...validTags].sort((a, b) => a.name.localeCompare(b.name));
    }, [allTags]);


    // 4. Determine which tags to display based on the "Show All" toggle
    const tagsToDisplay = showAllTags 
        ? sortedTags 
        : sortedTags.slice(0, INITIAL_TAG_LIMIT);

    // 5. Calculate visible and hidden counts
    const hiddenTagCount = sortedTags.length > INITIAL_TAG_LIMIT 
        ? sortedTags.length - INITIAL_TAG_LIMIT 
        : 0;

    // 6. Handler for Checkbox Toggle
    const handleTagToggle = (tagId) => {
        setLocalSelectedTagIds(prevIds => {
            if (prevIds.includes(tagId)) {
                return prevIds.filter(id => id !== tagId);
            } else {
                return [...prevIds, tagId];
            }
        });
    };
    
    // 7. Check if the local selection differs from the global active filter
    const isCurrentTagsArray = Array.isArray(currentFilterTagIds);

    // Compare local selection (sorted copy) with global state (sorted copy)
    const filterIsPending = 
        !isCurrentTagsArray || // If the prop is somehow broken, assume pending
        (JSON.stringify([...localSelectedTagIds].sort()) !== 
         JSON.stringify([...currentFilterTagIds].sort()));

    return (
        <Stack spacing={1}>
            {/* Tag Header */}
            <Flex align="center" ml={collapsed ? 0 : 3} mb={2} pl={collapsed ? 0 : 3}>
                <Icon as={FiTag} boxSize={5} />
                {!collapsed && (
                    <Text ml={4} fontSize="sm" fontWeight="bold">
                        Tags ({sortedTags.length})
                    </Text>
                )}
            </Flex>

            {/* Dynamic Checkbox Tag List */}
            <Stack spacing={2} pl={collapsed ? 0 : 3} maxH="40vh" overflowY="auto">
    {tagsToDisplay.map((tag) => (
        <Flex
            key={tag.id}
            align="center"
            justify={collapsed ? "center" : "flex-start"}
            px={collapsed ? 0 : 3}
            py={1}
            _hover={{ bg: "gray.100", cursor: "pointer" }}
            onClick={() => handleTagToggle(tag.id)} 
        >
            {/* Checkbox using Chakra v3 syntax */}
            <Checkbox.Root
                checked={localSelectedTagIds.includes(tag.id)}
                onCheckedChange={(e) => { 
            
                    handleTagToggle(tag.id); 
                }}
                mr={3}
                colorPalette="teal"
            >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
            </Checkbox.Root>
            
            {/* Tag Name */}
            {!collapsed && (
                <Text fontSize="sm" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                    {tag.name}
                </Text>
            )}
        </Flex>
    ))}
</Stack>
            {/* Show All / Show Less Link */}
            {!collapsed && hiddenTagCount > 0 && (
                <Button
                    variant="link"
                    size="sm"
                    justifyContent="flex-start"
                    onClick={() => setShowAllTags(!showAllTags)}
                    pl={3}
                    mt={1}
                    color="teal.600"
                >
                    {showAllTags 
                        ? "Show Less" 
                        : `Show All (${hiddenTagCount} more)`
                    }
                </Button>
            )}

            <Separator my={4} borderColor="gray.200" />

            {/* Apply Filter Button (The explicit action button) */}
            {!collapsed && (
                <Button
                    leftIcon={<FiFilter />}
                    colorPalette="blue" // Your chosen surface colorScheme
                    size="sm"
                    width="full"
                    mt={2}
                    disabled={!filterIsPending} 
                    onClick={() => onApplyFilter(localSelectedTagIds)}
                >
                    Apply Filter ({localSelectedTagIds.length})
                </Button>
            )}
        </Stack>
    );
}