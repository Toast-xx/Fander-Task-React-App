import React, { useEffect, useState } from "react";
import axios from "axios"; // Import axios for making HTTP requests

const ReflectionHistory = () => {
  const [reflectionHistory, setReflectionHistory] = useState([]);
  const [error, setError] = useState("");

  // Fetch reflection history when the component mounts
  useEffect(() => {
    const fetchReflectionHistory = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tasks/reflection-history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setReflectionHistory(response.data); // Set fetched data to state
        console.log('Fetched reflection history:', response.data);
      } catch (err) {
        console.error('Error fetching reflection history:', err);
        setError("Failed to load reflection history.");
      }
    };

    fetchReflectionHistory();
  }, []);

  return (
    <div>
      <h1>Reflection History</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {reflectionHistory.length > 0 ? (
          reflectionHistory.map((entry, index) => (
            <li key={index}>
              <h3>{entry.title}</h3> {/* Display task title */}
              <p><strong>Description:</strong> {entry.description}</p>
              <p><strong>Reflection:</strong> {entry.reflection_history}</p>
              <p><strong>Date:</strong> {new Date(entry.updatedat).toLocaleString()}</p>
            </li>
          ))
        ) : (
          <p>No reflections found.</p>
        )}
      </ul>
    </div>
  );
};

export default ReflectionHistory;