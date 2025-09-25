import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TaskOverview = ({ projectName }) => {
  const [statusData, setStatusData] = useState({
    noProgress: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchStatusData = async () => {
      if (!projectName) return;

      try {
        const response = await fetch(
          `http://localhost:5000/api/tasks/${projectName}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const tasks = await response.json();

        const noProgress = tasks.filter(
          (task) => task.status === "No Progress"
        ).length;
        const inProgress = tasks.filter(
          (task) => task.status === "In-Progress"
        ).length;
        const completed = tasks.filter(
          (task) => task.status === "Completed"
        ).length;
        const total = tasks.length;

        setStatusData({ noProgress, inProgress, completed, total });
      } catch (error) {
        console.error("Error fetching task status:", error);
      }
    };

    fetchStatusData();
  }, [projectName]);

  const completionPercentage =
    statusData.total > 0
      ? Math.round(
          (statusData.noProgress * 0 +
            statusData.inProgress * 50 +
            statusData.completed * 100) /
            statusData.total
        )
      : 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm rounded-lg p-4 text-center">
  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 my-8">
    Task Overview
  </h2>
  <div className="relative w-36 h-36 mx-auto">
  <svg className="w-full h-full" viewBox="0 0 120 120">
    <circle
      className="text-gray-300"
      strokeWidth="12"
      stroke="currentColor"
      fill="transparent"
      r="50"
      cx="60"
      cy="60"
    />
    <motion.circle
      className="text-blue-500"
      strokeWidth="12"
      strokeDasharray="314.16"
      strokeDashoffset={314.16}
      strokeLinecap="round"
      stroke="currentColor"  
      fill="transparent"
      r="50"
      cx="60"
      cy="60"
      animate={{
        strokeDashoffset: 314.16 - (completionPercentage / 100) * 314.16,
      }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      style={{ rotate: -90, transformOrigin: "50% 50%" }}
    />
  </svg>
  <span className="absolute inset-0 flex items-center justify-center text-3xl font-extrabold text-gray-700 dark:text-gray-200">
    {completionPercentage}%
  </span>
</div>

  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
    Overall Progress
  </p>
</div>

  );
};

export default TaskOverview;
