import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TaskStatus = ({ projectName }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectName) return;

      try {
        const response = await fetch(`http://localhost:5000/api/tasks/${projectName}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const taskData = await response.json();

        const formattedTasks = taskData.map((task) => ({
          title: task.title, 
          progress:
            task.status === "Completed"
              ? 100
              : task.status === "In-Progress"
              ? 50
              : 0, 
        }));

        setTasks(formattedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [projectName]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm rounded-lg p-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Task Status</h2>

      {/* Scrollable Container */}
      <div className="max-h-64 overflow-y-auto pr-2">
        {tasks.length > 0 ? (
          tasks.map((task, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span className="truncate w-3/4">{task.title}</span>
                <span className="text-xs">{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-500 h-1.5 rounded-lg overflow-hidden">
                <motion.div
                  className="bg-blue-600 h-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-300 text-sm">No tasks available</p>
        )}
      </div>
    </div>
  );
};

export default TaskStatus;
