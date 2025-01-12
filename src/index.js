import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { ReflectionHistoryProvider, useReflectionHistory } from "./ReflectionHistoryContext"; // Ensure this is correct
import axios from "axios"; // Import axios to make API requests

const root = ReactDOM.createRoot(document.getElementById("root"));

const ReflectionHistoryFetcher = () => {
  const { setReflectionHistory } = useReflectionHistory(); // Access setter function from context

  useEffect(() => {
    const fetchReflectionHistory = async () => {
      try {
        const response = await axios.get("/api/reflectionHistory"); // Fetch reflection history from the back-end
        setReflectionHistory(response.data); // Set reflection history to context
      } catch (error) {
        console.error("Error fetching reflection history:", error);
      }
    };

    fetchReflectionHistory(); // Fetch history on mount
  }, [setReflectionHistory]);

  return null; // No UI needed, only fetching data
};

root.render(
  <React.StrictMode>
    <ReflectionHistoryProvider>
      <ReflectionHistoryFetcher /> {/* Fetch reflection history when app starts */}
      <App />
    </ReflectionHistoryProvider>
  </React.StrictMode>
);
