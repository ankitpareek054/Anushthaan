import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import axios from "axios";

const Filter = ({ onFilter, onClose, onClear, visibility }) => {
  const roles = ["Software Developer Intern", "Team Leader", "Software Developer Intern", "Project Manager", "Frontend Developer", "Manager"];
  const reportToOptions = ["goutham.ganglia@gmail.com", "namesh.ganglia@gmail.com", "shreyas.ganglia@gmail.com", "ankit.ganglia@gmail.com"];
  const [projectOptions, setProjectOptions] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    setIsDarkMode(localStorage.getItem("theme") === "dark");

    // Fetching projects
    axios
      .post("http://localhost:5000/api/fetchProjects")
      .then((res) => {
        setProjectOptions(res.data.map((project) => ({ value: project.pname, label: project.pname })));
      })
      .catch((err) => console.error("Error fetching projects", err));
  }, []);

  const handleApplyFilters = () => {
    const role = document.getElementById("filterRole").value;
    const experience = document.getElementById("filterExperience").value;
    const reportTo = document.getElementById("filterReportTo").value;
    const project = document.getElementById("filterProject").value;
    onFilter(role, experience, reportTo, project);
    onClose();
  };

  const handleClearFilters = () => {
    document.getElementById("filterRole").value = "";
    document.getElementById("filterExperience").value = "";
    document.getElementById("filterReportTo").value = "";
    document.getElementById("filterProject").value = "";
    onFilter("", "", "", "");
    onClear();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50 transition-opacity duration-300 ${visibility ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
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
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Filter Users</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-800 bg-gray-200 px-4 py-2 dark:bg-gray-500 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-400 mb-2"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select
                id="filterRole"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Roles</option>
                {roles.map((role, index) => (
                  <option key={index} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience</label>
              <select
                id="filterExperience"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Experience Levels</option>
                <option value="Intern">Intern</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report To</label>
              <select
                id="filterReportTo"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Report To</option>
                {reportToOptions.map((email, index) => (
                  <option key={index} value={email}>{email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project</label>
              <select
                id="filterProject"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Projects</option>
                {projectOptions.map((project, index) => (
                  <option key={index} value={project.value}>{project.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={handleClearFilters}
              className="text-gray-800 bg-gray-200 px-6 py-2 dark:bg-gray-500 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-400 transition-all duration-200"
            >
              Clear Filters
            </button>
            <button
              onClick={handleApplyFilters}
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
