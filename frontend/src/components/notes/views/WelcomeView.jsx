import { Box, Heading } from "@chakra-ui/react";

export default function WelcomeView() {
  return (
    <Box textAlign="center" py={24} color="gray.600">
      <Heading color="teal.600" mb={4}>
        Welcome back 👋
      </Heading>
      <p>Select something from the sidebar to begin.</p>
    </Box>
  );
}
