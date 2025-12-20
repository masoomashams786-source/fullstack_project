import { Box, Flex } from "@chakra-ui/react";
import Dashboard from "./Dashboard";
import NoteForm from "@/components/NoteForm";

export default function DashboardWithNoteForm() {
  return (
    <Flex gap={6} w="full" h="full">
      {/* Main Dashboard - takes remaining space */}
      <Box flex="1">
        <Dashboard showNoteFormPanel={true} />
      </Box>

      {/* Right Side Panel - NoteForm */}
      <Box 
        w="400px" 
        position="sticky" 
        top="0" 
        h="fit-content" 
        maxH="100vh" 
        overflowY="auto"
        bg="white"
        p={6}
        borderRadius="md"
        shadow="md"
      >
        <NoteForm />
      </Box>
    </Flex>
  );
}