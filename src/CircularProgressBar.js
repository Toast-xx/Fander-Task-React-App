import React, { useEffect } from "react";

const CircularProgressBar = ({ progress, totalTasks, totalCompletedTasks }) => {
  useEffect(() => {
    console.log("CircularProgressBar props:", { progress, totalTasks, totalCompletedTasks });
  }, [progress, totalTasks, totalCompletedTasks]);

  return (
    <div className="circular-progress-bar-container">
      <div className="circular-progress-bar">
        {/* Circular progress bar */}
        <svg width="100%" height="100%" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" stroke="#ddd" strokeWidth="10" fill="none" />
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="#4caf50"  // Color for completed tasks
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${progress} ${100 - progress}`}  // Creates the progress circle
            strokeDashoffset="25"
          />
        </svg>
        
        {/* Task Info */}
        <div className="task-info">
          <h4>{totalCompletedTasks} / {totalTasks} Completed</h4>
          <h5>{progress ? progress.toFixed(2) : 0}% Progress</h5>
        </div>
      </div>
    </div>
  );
};

export default CircularProgressBar;