import React, { useContext } from "react";
import {
  Button,
  Box,
  Stack,
  Flex,
  Icon,
  Text,
  Separator,
} from "@chakra-ui/react";
import {
  FiFileText,
  FiPlus,
  FiTag,
  FiArchive,
  FiTrash,
  FiLogOut,
} from "react-icons/fi";
import { AuthContext } from "../pages/auth-context";
import { Link } from "react-router-dom";
import SidebarTags from "./SidebarTags";

export default function Sidebar({
  collapsed = false,
  onSelect,
  allTags,
  currentFilterTagIds,
  onApplyFilter,
}) {
  const { logout } = useContext(AuthContext);

  return (
    <Box
      as="nav"
      w={collapsed ? "72px" : "240px"}
      bg={{ base: "white", _dark: "gray.800" }}
      borderRightWidth="1px"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      h="100vh"
      p={4}
      position="sticky"
      top="0"
      zIndex="10"
      transition="width 0.2s ease-in-out"
    >
      <Stack height="full" justify="space-between" align="stretch">
        <Stack>
          {/* Brand */}
          <Flex
            px={2}
            py={2}
            justify={collapsed ? "center" : "flex-start"}
            align="center"
            h="40px"
          >
            <Text
              fontSize="lg"
              fontWeight="bold"
              color="teal.600"
              whiteSpace="nowrap"
            >
              {!collapsed ? "MyNotes" : "MN"}
            </Text>
          </Flex>

          {/* Section 1: All Notes & New Note */}
          <Stack spacing={1} mt={4}>
            <Button
              as={Link}
              to="/dashboard"
              variant="ghost"
              justifyContent={collapsed ? "center" : "flex-start"}
              onClick={() => {
                onApplyFilter && onApplyFilter([]);
                onSelect("all-notes");
              }}
            >
              <Icon as={FiFileText} boxSize={5} />
              {!collapsed && <Text ml={3}>All Notes</Text>}
            </Button>
            <Button
              as={Link}
              to="/new-note"
              variant="ghost"
              justifyContent={collapsed ? "center" : "flex-start"}
              onClick={() => onSelect("new-note")}
            >
              <Icon as={FiPlus} boxSize={5} />
              {!collapsed && <Text ml={3}>New Note</Text>}
            </Button>
          </Stack>

          <Separator my={4} borderColor="gray.200" />

          {/* Section 2: Tags */}

          <SidebarTags
            collapsed={collapsed}
            allTags={allTags}
            currentFilterTagIds={currentFilterTagIds}
            onApplyFilter={onApplyFilter}
          />

          <Separator my={4} borderColor="gray.200" />

          {/* Section 3: Archived & Trash */}
          <Stack spacing={1} pl={collapsed ? 0 : 3}>
            <Button
              variant="ghost"
              justifyContent={collapsed ? "center" : "flex-start"}
              onClick={() => {
                // Clear tag filters when viewing archived notes
                onApplyFilter && onApplyFilter([]);
                onSelect("archived");
              }}
            >
              <Icon as={FiArchive} boxSize={5} />
              {!collapsed && <Text ml={3}> Archived</Text>}
            </Button>
            <Button
              variant="ghost"
              justifyContent={collapsed ? "center" : "flex-start"}
              onClick={() => {
                // Clear tag filters when viewing trash
                onApplyFilter && onApplyFilter([]);
                onSelect("trash");
              }}
            >
              <Icon as={FiTrash} boxSize={5} />
              {!collapsed && <Text ml={3}>Trash</Text>}
            </Button>
          </Stack>
        </Stack>

        <Box>
          <Separator mb={4} borderColor="gray.200" />
          <Button
            variant="ghost"
            width="full"
            justifyContent={collapsed ? "center" : "flex-start"}
            onClick={logout}
          >
            <Icon as={FiLogOut} boxSize={5} />
            {!collapsed && <Text ml={3}>Logout</Text>}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
