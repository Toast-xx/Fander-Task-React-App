import React, { useState, useEffect, useCallback } from "react";
import TaskBoardContainer from "./TaskBoardContainer";
import FilterBar from "./FilterBar";
import TaskForm from "./TaskForm";
import CircularProgressBar from "./CircularProgressBar"; // Import CircularProgressBar component
import "./styles/Dashboard.css";
import { useReflectionHistory } from "./ReflectionHistoryContext"; // Import context for reflections

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [filters, setFilters] = useState({ status: "", priority: "" }); // State for filters
  const { setReflectionHistory } = useReflectionHistory(); // Get setter function from context
  const [progressData, setProgressData] = useState({ progress: 0, totalTasks: 0, totalCompletedTasks: 0 });

  // Fetch task progress from the API
  const fetchTaskProgress = useCallback(() => {
    console.log("Fetching task progress from API...");
    fetch("http://localhost:5000/api/tasks/progress", {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((response) => {
        console.log("API response status:", response.status);
        return response.json();
      })
      .then((data) => {
        console.log("Fetched task progress:", data);
        setProgressData(data);
      })
      .catch((error) => console.error("Error fetching task progress:", error));
  }, []);

  // Fetch tasks from the API
  const fetchTasks = useCallback(() => {
    console.log("Fetching tasks from API...");
    fetch("http://localhost:5000/api/tasks", {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => {
        console.log("API response status:", response.status);
        return response.json();
      })
      .then((data) => {
        console.log("Fetched tasks:", data);
        if (Array.isArray(data)) {
          setTasks(data); // Ensure data is an array before setting it
          fetchTaskProgress(); // Fetch task progress after setting tasks
        } else {
          console.error("Fetched data is not an array:", data);
        }
      })
      .catch((error) => console.error("Error fetching tasks:", error));
  }, [fetchTaskProgress]);

  const handleEditTask = (task) => {
    setIsFormOpen(true); // Open TaskForm
    setTaskToEdit(task); // Set the task to be edited
  };

  useEffect(() => {
    fetchTasks(); // Initial fetch

    const intervalId = setInterval(fetchTasks, 5000); // Fetch tasks every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [fetchTasks]);

  useEffect(() => {
    console.log("Progress data updated:", progressData);
  }, [progressData]);

  const parseDate = (dateStr) => {
    if (!dateStr) {
      console.warn("parseDate received undefined dateStr");
      return new Date(); // Return the current date or handle it as needed
    }
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate)) {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    console.log(`Parsed date for ${dateStr}:`, parsedDate);
    return parsedDate;
  };

  const getTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const todayDate = `${year}-${month}-${day}`;
    console.log("Today's date:", todayDate);
    return todayDate;
  };

  const today = getTodayDate();  // Used for filtering tasks by today's date

  const handleAddTask = (task) => {
    console.log("Adding task:", task);
    if (taskToEdit) {
      // Handle editing an existing task (PUT request)
      console.log("Editing task with ID:", taskToEdit.id);
      fetch(`http://localhost:5000/api/tasks/${taskToEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(task),
      })
        .then((response) => {
          console.log("Response status:", response.status);
          return response.json();
        })
        .then((updatedTask) => {
          console.log("Updated task:", updatedTask);
          setTasks((prevTasks) =>
            prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
          );
          fetchTaskProgress(); // Fetch task progress after updating a task
        })
        .catch((error) => console.error("Error updating task:", error));
    } else {
      // Add new task (POST request)
      console.log("Adding new task");
      fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(task),
      })
        .then((response) => {
          console.log("Response status:", response.status);
          return response.json();
        })
        .then((newTask) => {
          console.log("New task added:", newTask);
          setTasks((prevTasks) => [...prevTasks, newTask]);
          fetchTaskProgress(); // Fetch task progress after adding a new task
        })
        .catch((error) => console.error("Error adding task:", error));
    }
    setIsFormOpen(false);
    setTaskToEdit(null);
  };

  const cancelEdit = () => {
    console.log("Cancelling edit");
    setIsFormOpen(false);
    setTaskToEdit(null);
  };

  const handleDeleteTask = (taskId) => {
    console.log("Deleting task with ID:", taskId);
    fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(() => {
        console.log("Task deleted");
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        fetchTaskProgress(); // Fetch task progress after deleting a task
      })
      .catch((error) => console.error("Error deleting task:", error));
  };

  // Add reflection to history
  const handleAddReflection = (taskId, reflection) => {
    console.log("Adding reflection for task ID:", taskId, "Reflection:", reflection);
    fetch(`http://localhost:5000/api/tasks/${taskId}/reflection`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ reflection }),
    })
      .then((response) => {
        console.log("Response status:", response.status);
        return response.json();
      })
      .then((updatedTask) => {
        console.log("Reflection added and task marked as complete:", updatedTask);
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId)); // Remove the task from the dashboard
        setReflectionHistory((prevHistory) => [
          ...prevHistory,
          {
            title: updatedTask.title,
            description: updatedTask.description,
            reflection: updatedTask.reflection_history,
            date: updatedTask.updatedat,
          },
        ]);
        fetchTaskProgress(); // Fetch task progress after marking a task as complete
      })
      .catch((error) => console.error("Error adding reflection:", error));
  };

  // Mark task as complete
  const handleMarkAsComplete = (taskId) => {
    console.log("Marking task as complete with ID:", taskId);
    fetch(`http://localhost:5000/api/tasks/${taskId}/complete`, {
      method: "PATCH",
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((response) => {
        console.log("Response status:", response.status);
        return response.json();
      })
      .then((updatedTask) => {
        console.log("Task marked as complete:", updatedTask);
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
        );
        fetchTaskProgress(); // Fetch task progress after marking a task as complete
      })
      .catch((error) => console.error("Error marking task as complete:", error));
  };

  // Filter tasks based on selected filters
  const filteredTasks = Array.isArray(tasks) ? tasks.filter((task) => {
    const matchesStatus = filters.status ? task.status === filters.status : true;
    const matchesPriority = filters.priority ? task.priority === filters.priority : true;
    return matchesStatus && matchesPriority;
  }) : [];
  console.log("Filtered tasks:", filteredTasks);

  const dailyTasks = filteredTasks.filter((task) => {
    const taskDueDate = parseDate(task.due_date);
    const isDailyTask = taskDueDate.toDateString() === new Date(today).toDateString() && task.status !== "completed";
    if (isDailyTask) console.log("Daily task:", task);
    return isDailyTask;
  });

  const upcomingTasks = filteredTasks.filter((task) => {
    const taskDueDate = parseDate(task.due_date);
    const isUpcomingTask = taskDueDate > new Date(today) && task.status !== "completed";
    if (isUpcomingTask) console.log("Upcoming task:", task);
    return isUpcomingTask;
  });

  const incompleteTasks = filteredTasks.filter((task) => {
    const taskDueDate = parseDate(task.due_date);
    const isIncompleteTask = taskDueDate < new Date(today) && task.status !== "completed";
    if (isIncompleteTask) console.log("Incomplete task:", task);
    return isIncompleteTask;
  });

  const handleFilterChange = (filterType, value) => {
    console.log("Changing filter:", filterType, "Value:", value);
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value,
    }));
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome to the Dashboard</h1>
        <button onClick={() => setIsFormOpen(true)} className="add-task-btn">
          Add Task
        </button>
      </div>

      <FilterBar onFilterChange={handleFilterChange} /> {/* FilterBar for filtering tasks */}

      {isFormOpen && (
        <TaskForm
          addTask={handleAddTask}
          taskToEdit={taskToEdit}
          cancelEdit={cancelEdit}
        />
      )}

      {!isFormOpen && (
        <>
          <div className="task-boards">
            {[ 
              { title: "Daily Tasks", tasks: dailyTasks, emptyMessage: "No tasks for today!", taskSection: "daily" },
              { title: "Upcoming Tasks", tasks: upcomingTasks, emptyMessage: "No upcoming tasks!", taskSection: "upcoming" },
              { title: "Incomplete Tasks", tasks: incompleteTasks, emptyMessage: "No incomplete tasks!", taskSection: "incomplete" },
            ].map(({ title, tasks, emptyMessage, taskSection }) => (
              <TaskBoardContainer
                key={taskSection}
                title={title}
                tasks={tasks}
                emptyMessage={emptyMessage}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onReflectionSubmit={handleAddReflection}
                onMarkAsComplete={handleMarkAsComplete}
                taskSection={taskSection}
              />
            ))}
          </div>

          <div className="progress-bar-container">
            <div className="circular-progress-bar">
              <CircularProgressBar
                progress={progressData.progress}
                totalTasks={progressData.totalTasks}
                totalCompletedTasks={progressData.totalCompletedTasks}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;