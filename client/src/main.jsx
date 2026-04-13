import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "./context/Provider.jsx";
import { PeerProvider } from "./context/PeerProvider.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider>
      <PeerProvider>
        <App />
      </PeerProvider>
    </Provider>
  </BrowserRouter>,
);
