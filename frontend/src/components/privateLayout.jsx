import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Flex, VStack, Heading, Button } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { AuthContext } from "../pages/auth-context";
import { ColorModeButton } from "@/components/ui/color-mode";
import Sidebar from "./sidebar";

export default function PrivateLayout() {
  const { user, logout } = useContext(AuthContext);
  const [view, setView] = useState("all-notes");

  return (
    <Flex minH="100vh" direction="column">
      <Flex
        as="header"
        bg="teal.600"
        color="white"
        align="center"
        justify="space-between"
        px={6}
        py={4}
      >
        <Heading size="md">Welcome to your app {user?.name}!</Heading>

        
         <ColorModeButton  color='white'/>
      </Flex>

      <Flex flex="1">
       <Outlet context={{ view, setView }} />
      </Flex>

      {/* Footer */}
      <Box as="footer" textAlign="center" py={4} bg="gray.200">
        &copy; {new Date().getFullYear()} My App
      </Box>
    </Flex>
  );
}
