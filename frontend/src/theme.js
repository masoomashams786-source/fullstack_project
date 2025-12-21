import { createSystem, defaultConfig } from "@chakra-ui/react";

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        midnight: {
          950: { value: "#0F172A" }, // Deep background
          900: { value: "#1E293B" }, // Sidebar/Container
          800: { value: "#334155" }, // Cards/Active states
          700: { value: "#475569" }, // Borders/Icons
        },
        brand: {
          500: { value: "#3B82F6" }, // The bright blue "New Note" button
        },
      },
    },
    semanticTokens: {
      colors: {
        // The main app background (Deepest navy)
        "bg.app": {
          value: { base: "white", _dark: "{colors.midnight.950}" },
        },
        // Sidebar and Note List area
        "bg.sidebar": {
          value: { base: "gray.50", _dark: "{colors.midnight.900}" },
        },
        // Individual Note Cards
        "bg.card": {
          value: { base: "white", _dark: "{colors.midnight.800}" },
        },
        // Borders and dividers
        "border.muted": {
          value: { base: "gray.200", _dark: "{colors.midnight.700}" },
        },
        // Main Text
        "fg.default": {
          value: { base: "black", _dark: "gray.100" },
        },
        // Muted text (dates/descriptions)
        "fg.muted": {
          value: { base: "gray.600", _dark: "gray.400" },
        },
      },
    },
  },
});