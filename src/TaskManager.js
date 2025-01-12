import React, { useState, useEffect } from "react";
import TaskBoardContainer from "./TaskBoardContainer";
import TaskForm from "./TaskForm";
import "./styles/TaskManager.css";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [taskToEdit, setTaskToEdit] = useState(null); // For editing tasks

  // Function to add a new task
  const addTask = async (task) => {
    try {
      const response = await fetch("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Ensure the body is sent as JSON
        },
        body: JSON.stringify(task), // Convert the task object to a JSON string
      });

      const newTask = await response.json();
      if (response.ok) {
        setTasks((prevTasks) => [...prevTasks, newTask]); // Add the new task to the list
      } else {
        console.error("Error adding task:", newTask);
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Function to edit a task
  const onEdit = async (task) => {
    setTaskToEdit(task); // Set the task to be edited
  };

  useEffect(() => {
    // Fetch the list of tasks on component mount
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks");
        const data = await response.json();
        if (response.ok) {
          setTasks(data);
        } else {
          console.error("Error fetching tasks:", data);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []); // Empty dependency array ensures this effect runs once on component mount

  return (
    <div className="task-manager">
      {/* Pass down taskToEdit to pre-fill the form if editing */}
      <TaskForm addTask={addTask} taskToEdit={taskToEdit} />
      <TaskBoardContainer
        title="All Tasks"
        tasks={tasks}
        emptyMessage="No tasks available"
        onEdit={onEdit} // Pass the onEdit function as a prop
      />
    </div>
  );
};

export default TaskManager;
