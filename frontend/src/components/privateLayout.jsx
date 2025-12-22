import Logo from "../img/Logo.png";
import React, { useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Flex, Heading, Button, HStack, Image } from "@chakra-ui/react";
import { AuthContext } from "../pages/auth-context";
import { ColorModeButton } from "@/components/ui/color-mode";
import { useTextSize } from "../context/TextSizeContext";
import { FiType, FiCalendar } from "react-icons/fi";
import { useSort } from "../context/SortContext";

export default function PrivateLayout() {
  const { user, logout } = useContext(AuthContext);
  const [view, setView] = useState("all-notes");
  const { textSize, cycleTextSize } = useTextSize();
  const { sortOrder, toggleSortOrder } = useSort();

  return (
    <Flex minH="100vh" direction="column">
      <Flex
        as="header"
        bg="teal.600"
        position="sticky"
        top="0"
        zIndex="1000"
        align="center"
        justify="space-between"
        px={6}
        py={4}
      >
        <Flex align="center">
          <Image src={Logo} alt="Logo" boxSize="80px" borderRadius="full" />
        </Flex>

        <HStack spacing={3}>
          {/* Sort Button */}
          <Button
            onClick={toggleSortOrder}
            size="sm"
            color="white"
            colorPalette="gray"
            variant="outline"
            _hover={{
              bg: "whiteAlpha.200",
              color: "white",
            }}
          >
            <FiCalendar style={{ marginRight: "3px" }} />:{" "}
            {sortOrder === "newest" ? "Newest" : "Oldest"}
          </Button>

          {/* Text Size Button */}
          <Button
            onClick={cycleTextSize}
            size="sm"
            color="white"
            colorPalette="gray"
            variant="outline"
            _hover={{
              bg: "whiteAlpha.200",
              color: "white",
            }}
          >
            <FiType style={{ marginRight: "3px" }} />: {textSize.toUpperCase()}
          </Button>

          <ColorModeButton
            _hover={{
              bg: "whiteAlpha.200",
              color: "white",
            }}
            color="white"
          />
        </HStack>
      </Flex>

      <Flex flex="1">
        <Outlet context={{ view, setView }} />
      </Flex>
    </Flex>
  );
}
