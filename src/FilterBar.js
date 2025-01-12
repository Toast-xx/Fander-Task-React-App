import React, { useState } from "react";

const FilterBar = ({ onFilterChange }) => {
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const handleFilterChange = (filterType, value) => {
    // Update state
    if (filterType === "status") {
      setStatus(value);
    } else if (filterType === "priority") {
      setPriority(value);
    }

    // Send the updated filter data to the parent component
    onFilterChange({
      status: filterType === "status" ? value : status,
      priority: filterType === "priority" ? value : priority,
    });
  };

  return (
    <div className="filter-bar">
      <label htmlFor="status-filter">Filter by Status:</label>
      <select
        id="status-filter"
        onChange={(e) => handleFilterChange("status", e.target.value)}
        value={status}
      >
        <option value="">All Status</option>
        <option value="yetToDo">Yet to Do</option>
        <option value="inProgress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <label htmlFor="priority-filter">Filter by Priority:</label>
      <select
        id="priority-filter"
        onChange={(e) => handleFilterChange("priority", e.target.value)}
        value={priority}
      >
        <option value="">All Priority</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  );
};

export default FilterBar;