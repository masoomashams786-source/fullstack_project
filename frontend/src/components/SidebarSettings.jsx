import { Button, Icon, Text } from "@chakra-ui/react";
import { FiSettings } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function SidebarSettings({ collapsed }) {
  return (
    <Button
      as={Link}
      to="/settings/change-password"
      variant="ghost"
      width="full"
      justifyContent={collapsed ? "center" : "flex-start"}
    >
      <Icon as={FiSettings} boxSize={5} />
      {!collapsed && <Text ml={3}>Settings</Text>}
    </Button>
  );
}
