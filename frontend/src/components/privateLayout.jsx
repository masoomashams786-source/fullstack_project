import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Flex, VStack, Heading, Button } from "@chakra-ui/react";
import { useContext } from "react";
import { AuthContext } from "../pages/auth-context";

export default function PrivateLayout() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Flex minH="100vh" direction="column">
      {/* Header */}
      <Flex
        as="header"
        bg="teal.600"
        color="white"
        align="center"
        justify="space-between"
        px={6}
        py={4}
      >
        <Heading size="md">Welcome</Heading>
        <Button colorScheme="teal" variant="Surface" 
        colorPalette={"teal"}
        onClick={logout}>
          Logout
        </Button>
      </Flex>

      {/* Main Content */}
      <Box as="main" flex="1" bg="gray.50" p={6}>
        {/* Outlet will render the child route component */}
        <Outlet />
      </Box>

      {/* Footer */}
      <Box as="footer" textAlign="center" py={4} bg="gray.200">
        &copy; {new Date().getFullYear()} My App
      </Box>
    </Flex>
  );
}
