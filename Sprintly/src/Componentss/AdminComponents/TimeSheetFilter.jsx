import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const TimeSheetFilter = ({ visibility, close, applyFilters, clearAllFilters }) => {
  const [date, setDate] = useState("");
  const [project, setProject] = useState("");
  const [status, setStatus] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    setIsDarkMode(localStorage.getItem("theme") === "dark");
  }, []);

  const handleApply = () => {
    applyFilters({ date, project, status });
    close();
  };

  const clearFilters = () => {
    setDate("");
    setProject("");
    setStatus("");
    clearAllFilters();
    close();
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? "#374151" : "white",  // Set background based on dark mode
      borderColor: "#d1d5db",
      color: isDarkMode ? "#f3f4f6" : "black",  // Set text color based on dark mode
      '&:hover': {
        borderColor: isDarkMode ? "#4b5563" : "#3b82f6", // Hover border color based on dark mode
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? "#374151" : "white",
      zIndex: 10,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? (isDarkMode ? "#4b5563" : "#3b82f6")  
        : state.isFocused
          ? (isDarkMode ? "#4b5563" : "#bfdbfe")
          : "transparent",
      color: state.isSelected
        ? "white" 
        : (isDarkMode ? "#f3f4f6" : "black"),
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? "#4b5563" : "#d1d6dc", 
      color: "white",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDarkMode ? "white" : "black",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color:isDarkMode ? "white" : "black",  
      
    }),
    singleValue: (base) => ({
      ...base,
      color: isDarkMode ? "#f3f4f6" : "black",
    }),
    input: (base) => ({
      ...base,
      color: isDarkMode ? "#f3f4f6" : "black",
    }),
    placeholder: (base) => ({
      ...base,
      color: isDarkMode ? "#d1d5db" : "#6b7280", 
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-0 flex items-center justify-end bg-gray-900 bg-opacity-50 z-50 transition-opacity duration-300 ${
        visibility ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <motion.form
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-white dark:bg-gray-700 p-5 rounded-md h-full shadow-md w-[60%] lg:w-[40%] md:w-[40%]"
      >
        {/* Header with Close Button */}
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            className="text-gray-800 bg-gray-200 px-4 py-2 dark:bg-gray-500 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-400"
            onClick={close}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Date Filter */}
        <div className="mb-4">
          <label className="text-gray-700 dark:text-gray-100 mb-2 block">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-gray-200"
            style={{
              maxWidth: "100%", // Ensures it does not overflow
            }}
          />
        </div>

        {/* Project Filter */}
        <div className="mb-4">
          <label className="text-gray-700 dark:text-gray-100 mb-2 block">Project</label>
          <input
            type="text"
            id="project"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-gray-200"
            placeholder="Search by project name"
          />
        </div>

        {/* Status Filter */}
        <div className="mb-4">
          <label className="text-gray-700 dark:text-gray-100 mb-2 block">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="">All</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Apply and Clear Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 w-full sm:w-auto"
            onClick={handleApply}
          >
            Apply
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="ml-10 bg-gray-300 text-black px-5 py-2 rounded-md hover:bg-gray-400 w-full sm:w-auto"
          >
            Clear
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default TimeSheetFilter;
