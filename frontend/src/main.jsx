import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './pages/auth-context.jsx';
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ColorModeProvider } from "@/components/ui/color-mode";


import { Provider } from "@/components/ui/provider"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider>
    <BrowserRouter>
      
    <Provider>
      <AuthProvider>
      <App />
      </AuthProvider>
    </Provider>
      
    </BrowserRouter>
     </ColorModeProvider>
    </ChakraProvider>
  </React.StrictMode>
);