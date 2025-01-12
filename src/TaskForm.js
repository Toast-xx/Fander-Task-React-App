import React, { useState, useEffect } from "react";
import "./styles/TaskForm.css";

const TaskForm = ({ addTask, taskToEdit, cancelEdit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("yetToDo");
  const [subtasks, setSubtasks] = useState([{ name: "", completed: false }]);
  const [dueDate, setDueDate] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [image, setImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchTaskDetails = async (taskId) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response text:', errorText);
          throw new Error(`Failed to fetch task details: ${errorText}`);
        }

        const task = await response.json();
        console.log('Fetched task details:', task);

        setTitle(task.title || "");
        setDescription(task.description || "");
        setPriority(task.priority || "medium");
        setStatus(task.status || "yetToDo");
        setSubtasks(Array.isArray(task.subtasks) ? task.subtasks : [{ name: "", completed: false }]);
        setDueDate(task.due_date ? task.due_date.split("T")[0] : ""); // Ensure field name matches and format date
        setTaskId(task.id);
        setImage(task.image || null);
      } catch (error) {
        console.error('Error fetching task details:', error);
      }
    };

    if (taskToEdit) {
      if (taskToEdit.id) {
        fetchTaskDetails(taskToEdit.id);
      } else {
        console.error("taskToEdit exists but has no id property.");
        alert('Error: taskToEdit exists but has no id property.');
      }
    } else {
      setTaskId(Date.now());
    }
  }, [taskToEdit]);

  const normalizeDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Title before submit:', title);
    // Basic Validation
    if (!title || title.trim() === '') {
      alert('Title is required');
      return;
    }

    if (!priority || priority.trim() === '') {
      alert('Priority is required');
      return;
    }

    if (!status || status.trim() === '') {
      alert('Status is required');
      return;
    }

    if (!dueDate) {
      alert('Due Date is required');
      return;
    }

    // Ensure that subtasks are properly validated
    if (subtasks.some(subtask => subtask.name.trim() === "")) {
      alert('Subtasks must have names');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const taskData = {
        id: taskId,
        title,
        description,
        priority,
        status,
        subtasks,
        due_date: normalizeDate(dueDate),
      };

      console.log('Task Data:', taskData);

      let response;
      if (taskToEdit && taskToEdit.id) {  // Crucial check!
        const taskId = taskToEdit.id; // Extract taskId for clarity

        response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(taskData)
        });

      } else if (taskToEdit) {
        console.error("taskToEdit exists but has no id property.");
        // Handle the case where taskToEdit exists but lacks an ID appropriately (e.g., display an error message to the user)
        alert('Error: taskToEdit exists but has no id property.');
        return;
      } else {
        // Existing POST logic
        response = await fetch(`http://localhost:5000/api/tasks`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(taskData)
        });
      }

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        throw new Error(`Failed to save task: ${errorText}`);
      }

      const result = await response.json();
      console.log('Task saved:', result);

      // Handle image upload separately if an image is provided
      if (image) {
        const imageData = new FormData();
        imageData.append("image", image);

        const imageResponse = await fetch(`http://localhost:5000/api/tasks/${result.id}/image`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: imageData
        });

        if (!imageResponse.ok) {
          const imageErrorText = await imageResponse.text();
          console.error('Error response text:', imageErrorText);
          throw new Error(`Failed to upload image: ${imageErrorText}`);
        }

        const imageResult = await imageResponse.json();
        console.log('Image uploaded:', imageResult);
        result.image = imageResult.image;
      }

      addTask(result); // Update the state with the new task
      setSuccessMessage("Task added successfully!"); // Set success message
      setTimeout(() => {
        setSuccessMessage(""); // Clear success message after a delay
        cancelEdit(); // Reset or close the modal
      }, 2000);

    } catch (error) {
      console.error('Error saving task:', error);
      // Handle error (e.g., show error message to user)
      alert(`Error: ${error.message}`);
    }
  };

  const handleSubtaskChange = (index, field, value) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index][field] = value;
    setSubtasks(newSubtasks);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h3>{taskToEdit ? "Edit Task" : "Add New Task"}</h3>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div className="form-group">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="yetToDo">Yet to Do</option>
          <option value="inProgress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="form-group">
        <label>Subtasks</label>
        {subtasks.map((subtask, index) => (
          <div key={index} className="subtask">
            <input
              type="checkbox"
              checked={subtask.completed}
              onChange={() =>
                handleSubtaskChange(index, "completed", !subtask.completed)
              }
            />
            <input
              type="text"
              value={subtask.name}
              onChange={(e) =>
                handleSubtaskChange(index, "name", e.target.value)
              }
              placeholder="Subtask name"
              required
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setSubtasks((prev) => [...prev, { name: "", completed: false }])
          }
        >
          Add Subtask
        </button>
      </div>
      <div className="form-group">
        <label>Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Task Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {image && <img src={URL.createObjectURL(image)} alt="Task Preview" className="image-preview" />}
      </div>
      <button type="submit">{taskToEdit ? "Save Changes" : "Add Task"}</button>
      <button type="button" onClick={cancelEdit}>
        Cancel
      </button>
    </form>
  );
};

export default TaskForm;