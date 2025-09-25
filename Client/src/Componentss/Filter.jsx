import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setFilters, clearFilter } from "../Redux/filterslice.jsx";

const Filter = ({ visibility, close, context, applyFilters, projectName }) => {
  const [selectedNames, setSelectedNames] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState([]);
  const [selectedCreatedBy, setSelectedCreatedBy] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState([]);
  const [userList, setUserList] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

  const dispatch = useDispatch();

  useEffect(() => {
    setIsDarkMode(localStorage.getItem("theme") === "dark");
    axios
      .get("http://localhost:5000/api/getUsers")
      .then((response) => setUserList(response.data.users))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const contextOptions = {
    team_management: {
      names: userList.map((user) => ({ value: user.name, label: user.name })),
      positions: [
        { value: "Head", label: "Head" },
        { value: "Team Leader", label: "Team Leader" },
        { value: "Employee", label: "Employee" },
      ],
      projects: [
        { value: "Sprintly", label: "Sprintly" },
        { value: "Medicare", label: "Medicare" },
        { value: "Patent Exchange", label: "Patent" },
      ],
    },
    task_list: {
      createdBy: userList.map((user) => ({ value: user.name, label: user.name })),
      status: [
        { value: "No Progress", label: "No Progress" },
        { value: "In-Progress", label: "In Progress" },
        { value: "Completed", label: "Completed" },
      ],
      priority: [
        { value: "High", label: "High" },
        { value: "Medium", label: "Medium" },
        { value: "Low", label: "Low" },
      ],
      assignee: userList.map((user) => ({ value: user.name, label: user.name })),
    },
  };

  const { names = [], createdBy = [], priority = [], status = [], positions = [], projects = [], assignee = [] } =
    contextOptions[context] || {};

  const clearFilters = () => {
    setSelectedNames([]);
    setSelectedPositions([]);
    setSelectedProjects([]);
    setSelectedCreatedBy([]);
    setSelectedStatus([]);
    setSelectedPriority([]);
    setSelectedAssignee([]);
    dispatch(clearFilter());
  };

  const handleApply = () => {
    const filters = {
      names: selectedNames.map((item) => item.value),
      positions: selectedPositions.map((item) => item.value),
      projects: selectedProjects.map((item) => item.value),
    };

    if (context === "task_list") {
      filters.createdBy = selectedCreatedBy.map((item) => item.value);
      filters.status = selectedStatus.map((item) => item.value);
      filters.priority = selectedPriority.map((item) => item.value);
      filters.assignee = selectedAssignee.map((item) => item.value);

      dispatch(setFilters(filters));
    } else {
      applyFilters(filters);
    }
    close();
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? "#374151" : "white",
      borderColor: isDarkMode ? "#4b5563" : "#d1d5db",
      color: isDarkMode ? "#f3f4f6" : "#111827",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? "#374151" : "white",
      color: isDarkMode ? "#f3f4f6" : "#111827",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? "#6b7280" : "#e5e7eb",
    }),
    input: (base) => ({
      ...base,
      color: isDarkMode ? "#f3f4f6" : "#111827",
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
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50 transition-opacity duration-300 ${
        visibility ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-gray-800 shadow-2xl w-full h-full max-w-md overflow-hidden rounded-lg"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Filter</h2>
          <button
            type="button"
            onClick={close}
            className="text-gray-800 bg-gray-200 px-4 py-2 dark:bg-gray-500 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-400 mb-2"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {context === "team_management" ? "Name" : "Created By"}
            </label>
            <Select
              options={context === "team_management" ? names : createdBy}
              value={context === "team_management" ? selectedNames : selectedCreatedBy}
              onChange={context === "team_management" ? setSelectedNames : setSelectedCreatedBy}
              isMulti
              styles={customStyles}
            />
          </div>

          {context === "task_list" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignee</label>
              <Select
                options={assignee}
                value={selectedAssignee}
                onChange={setSelectedAssignee}
                isMulti
                styles={customStyles}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {context === "team_management" ? "Position" : "Status"}
            </label>
            <Select
              options={context === "team_management" ? positions : status}
              value={context === "team_management" ? selectedPositions : selectedStatus}
              onChange={context === "team_management" ? setSelectedPositions : setSelectedStatus}
              isMulti
              styles={customStyles}
            />
          </div>

          {!projectName && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {context === "team_management" ? "Project" : "Priority"}
              </label>
              <Select
                options={context === "team_management" ? projects : priority}
                value={context === "team_management" ? selectedProjects : selectedPriority}
                onChange={context === "team_management" ? setSelectedProjects : setSelectedPriority}
                isMulti
                styles={customStyles}
              />
            </div>
          )}

          <div className="flex justify-center space-x-4 mt-8">
            <button
              type="button"
              onClick={clearFilters}
              className="text-gray-800 bg-gray-200 px-6 py-2 dark:bg-gray-500 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-400 transition-all duration-200"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="text-white bg-gradient-to-r from-blue-400 to-blue-800 px-6 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Filter;
