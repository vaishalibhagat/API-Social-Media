import React from "react";
import { createRoot } from "react-dom/client"; // Import createRoot
import App from "./App";
import { UserProvider } from "./components/UserContext";

// Find the root element in the DOM
const rootElement = document.getElementById("root");

// Create a root and render the app
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);
