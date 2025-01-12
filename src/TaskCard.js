import React, { useState } from "react";

const TaskCard = ({ task, onDelete, onReflectionSubmit, onEdit, onMarkAsComplete, taskSection }) => {
  const [reflection, setReflection] = useState("");

  const isPastDueDate = new Date(task.due_date) < new Date();

  const handleReflectionSubmit = async () => {
    if (reflection.trim() === "") {
      alert("Reflection cannot be empty");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${task.id}/reflection`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reflection }),
      });

      if (!response.ok) {
        throw new Error("Failed to add reflection");
      }

      const updatedTask = await response.json();
      onReflectionSubmit(updatedTask.id, reflection);
      setReflection("");
    } catch (error) {
      console.error("Error adding reflection:", error);
      alert("Error adding reflection");
    }
  };

  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <p>Due Date: {new Date(task.due_date).toLocaleDateString()}</p>
      <p>Status: {task.status === "completed" ? "Completed" : "Incomplete"}</p>
      {isPastDueDate && task.status !== "completed" && (
        <div>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Add your reflection"
          />
          <button onClick={handleReflectionSubmit}>Submit Reflection</button>
        </div>
      )}
      <button onClick={() => onMarkAsComplete(task.id)}>Mark as Complete</button>
      <button onClick={() => onEdit(task.id)}>Edit</button>
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </div>
  );
};

export default TaskCard;