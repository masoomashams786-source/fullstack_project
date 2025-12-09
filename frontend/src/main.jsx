import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './pages/auth-context.jsx';


import { Provider } from "@/components/ui/provider"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      
    <Provider>
      <AuthProvider>
      <App />
      </AuthProvider>
    </Provider>
      
    </BrowserRouter>
  </React.StrictMode>
);