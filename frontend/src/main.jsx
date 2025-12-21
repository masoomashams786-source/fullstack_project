import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./pages/auth-context.jsx";

import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { Provider } from "@/components/ui/provider";
import { TextSizeProvider } from "./context/TextSizeContext";

import { system } from "./theme";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider value={system}>
      {" "}
      {/* ✅ USE YOUR SYSTEM */}
      <ColorModeProvider>
        <BrowserRouter>
          <Provider>
            <AuthProvider>
              <TextSizeProvider>
                <App />
              </TextSizeProvider>
            </AuthProvider>
          </Provider>
        </BrowserRouter>
      </ColorModeProvider>
    </ChakraProvider>
  </React.StrictMode>
);
