import React, { createContext, useContext, useState } from 'react';

const ReflectionHistoryContext = createContext();

export const ReflectionHistoryProvider = ({ children }) => {
  const [reflectionHistory, setReflectionHistory] = useState([]);

  return (
    <ReflectionHistoryContext.Provider value={{ reflectionHistory, setReflectionHistory }}>
      {children}
    </ReflectionHistoryContext.Provider>
  );
};

export const useReflectionHistory = () => {
  const { reflectionHistory, setReflectionHistory } = useContext(ReflectionHistoryContext);

  const addReflection = (taskId, reflection) => {
    setReflectionHistory((prevHistory) => [
      ...prevHistory,
      { taskId, reflection, date: new Date().toISOString() },
    ]);
  };

  return { reflectionHistory, setReflectionHistory, addReflection };
};