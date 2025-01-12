import React from "react";
import TaskCard from "./TaskCard";

const TaskBoardContainer = ({
  title,
  tasks,
  emptyMessage,
  onEdit,
  onDelete,
  onReflectionSubmit,
  onMarkAsComplete,
}) => {
  console.log(`Rendering ${title} with tasks:`, tasks);
  return (
    <div className="task-board-container">
      <h2>{title}</h2>
      {tasks.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onReflectionSubmit={onReflectionSubmit}
            onMarkAsComplete={onMarkAsComplete}
            taskSection={title.toLowerCase()}
          />
        ))
      )}
    </div>
  );
};

export default TaskBoardContainer;