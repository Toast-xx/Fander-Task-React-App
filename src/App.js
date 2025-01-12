import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Import components
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import ProfileManagement from "./ProfileManagement";
import TaskForm from "./TaskForm";
import ReflectionHistory from "./ReflectionHistory";
import { ReflectionHistoryProvider, useReflectionHistory } from "./ReflectionHistoryContext";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
  });
  const [apiError, setApiError] = useState("");

  const { setReflectionHistory } = useReflectionHistory(); // Access reflection context

  // Check for authentication status on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      fetchProfile(); // Fetch profile data if authenticated
      fetchTasks(); // Fetch tasks if authenticated
    }
  }, []);

  // Fetch tasks from the backend
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch tasks.");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      setApiError(error.message);
    }
  };

  // Fetch user profile data from the backend
  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch profile.");
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      setApiError(error.message);
    }
  };

  // Add reflection history
  const addReflection = (taskId, reflection) => {
    // Find the task by its ID
    const task = tasks.find((t) => t.id === taskId);

    if (task) {
      setReflectionHistory((prevHistory) => [
        ...prevHistory,
        {
          title: task.title, // Include the task title
          description: task.description, // Include the task description
          reflection,
          date: new Date(), // Add the current date
        },
      ]);
    }
  };

  const openProfileManagement = () => {
    console.log("Opening Profile Management");
    setIsProfileOpen(true);
  };
  const closeProfileManagement = () => {
    console.log("Closing Profile Management");
    setIsProfileOpen(false);
  };

  const handleProfileUpdate = async (updatedProfile) => {
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedProfile),
      });
      setUserProfile(updatedProfile);
      setIsProfileOpen(false);
    } catch (error) {
      setApiError(error.message);
    }
  };

  const handleEditTask = (task) => {
    setIsFormOpen(true); // Open TaskForm
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <ReflectionHistoryProvider>
      <Router>
        <div className="App">
          <header>
            <nav>
              <ul>
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li>
                      <Link to="/reflection-history">Reflection History</Link>
                    </li>
                    <li>
                      <button onClick={openProfileManagement}>Profile</button>
                    </li>
                    <li>
                      <button onClick={handleLogout}>Logout</button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/login">Login</Link>
                    </li>
                    <li className="separator">/</li>
                    <li>
                      <Link to="/register">Register</Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </header>

          <Routes>
            <Route
              path="/"
              element={
                <main className="welcome-section">
                  <div className="welcome-message">
                    <h1>Welcome to Taskmaster!</h1>
                    <p>Organize your tasks and achieve your goals seamlessly!</p>
                  </div>
                </main>
              }
            />
            <Route
              path="/login"
              element={<Login setIsAuthenticated={setIsAuthenticated} authError={authError} setAuthError={setAuthError} />}
            />
            <Route
              path="/register"
              element={<Register setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Dashboard
                    tasks={tasks}
                    addReflection={addReflection}
                    onEdit={handleEditTask} // Pass the edit handler
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reflection-history"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <ReflectionHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <ProfileManagement profile={userProfile} onProfileUpdate={handleProfileUpdate} />
                </ProtectedRoute>
              }
            />
          </Routes>

          {/* TaskForm Modal */}
          {isFormOpen && <TaskForm tasks={tasks} />}

          {/* ProfileManagement Modal */}
          {isProfileOpen && (
            <ProfileManagement
              profile={userProfile}
              onProfileUpdate={handleProfileUpdate}
              onClose={closeProfileManagement}
            />
          )}

          {/* Display any API error messages */}
          {apiError && <div className="error-message">{apiError}</div>}
        </div>
      </Router>
    </ReflectionHistoryProvider>
  );
}

export default App;