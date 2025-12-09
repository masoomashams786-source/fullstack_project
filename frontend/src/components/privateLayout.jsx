import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Flex, VStack, Heading, Button } from "@chakra-ui/react";
import { useContext } from "react";
import { AuthContext } from "../pages/auth-context";
import Sidebar from "./sidebar";


export default function PrivateLayout() {
  const { user, logout } = useContext(AuthContext);

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
        <Heading size="md">Welcome to you app
, {user?.name}!


        </Heading>
        
        <Button colorPalette="gray" variant="surface" 
        
        onClick={logout}>
          Logout
        </Button>
      </Flex>

      
       <Flex minH="100vh">
      <Sidebar />                         {/* left column */}
      <Box flex="1" bg="gray.50" p={6}>   {/* right column */}
        <Outlet />
      </Box>
    </Flex>

      {/* Footer */}
      <Box as="footer" textAlign="center" py={4} bg="gray.200">
        &copy; {new Date().getFullYear()} My App
      </Box>
    </Flex>
  );
}
