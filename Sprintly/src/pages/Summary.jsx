import React, { useEffect, useState, useRef } from "react";
import {faXmark,faEllipsisV,faCheckCircle,faSyncAlt,faPlusCircle,faCalendarAlt,} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import SummaryCard from "../Componentss/SummaryCard.jsx";
import TaskOverview from "../Componentss/TaskOverview.jsx";
import TaskStatus from "../Componentss/TaskStatus.jsx";
import TaskDistribution from "../Componentss/TaskDistribution.jsx";
import ScheduledVariance from "../Componentss/ScheduledVariance.jsx";
import EffortDistribution from "../Componentss/EffortDistribution.jsx";
import EngagementChart from "../Componentss/EngagementChart.jsx";
import BudgetUsage from "../Componentss/BudgetUsage.jsx";

const Summary = ({ visibility, close, context, projectName }) => {
  const nav = useNavigate();
  const [summaryData, setSummaryData] = useState([]);
  const [showTaskOverview, setShowTaskOverview] = useState(true);
  const [showTaskStatus, setShowTaskStatus] = useState(true);
  const [showTaskDistribution, setShowTaskDistribution] = useState(true);
  const [showScheduledVariance, setShowScheduledVariance] = useState(true);
  const [showEngagementChart, setShowEngagementChart] = useState(true);
  const [showEffortDistribution, setShowEffortDistribution] = useState(true);
  const [showBudgetUsage, setShowBudgetUsage] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  const optionsRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      nav("/user-registration");
    }
  }, [nav]);

  useEffect(() => {
    const fetchSummaryData = async () => {
      if (!projectName) return;
      try {
        const response = await fetch(
          `http://localhost:5000/api/tasks/${projectName}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const tasks = await response.json();

        let completed = 0,updated = 0,created = 0,due = 0;
        if (tasks.length > 0) {
          const now = new Date();
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          const nextSevenDays = new Date();
          nextSevenDays.setDate(now.getDate() + 7);

          completed = tasks.filter((task) => task.status === "Completed").length;
          updated = tasks.filter((task) => task.status === "In-Progress").length;
          created = tasks.filter((task) => new Date(task.createdAt) >= sevenDaysAgo).length;
          due = tasks.filter((task) =>new Date(task.endDate) >= now && new Date(task.endDate) <= nextSevenDays).length;
        }

        setSummaryData([
          { icon: <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />, label: "Completed", value: completed },
          { icon: <FontAwesomeIcon icon={faSyncAlt} className="text-blue-500" />, label: "In-Progress", value: updated },
          { icon: <FontAwesomeIcon icon={faPlusCircle} className="text-purple-500" />, label: "Created in last 7 days", value: created },
          { icon: <FontAwesomeIcon icon={faCalendarAlt} className="text-yellow-500" />, label: "Due in the next 7 days", value: due },
        ]);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchSummaryData();
  }, [projectName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close only if clicked outside both the dropdown and button
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target) &&
        !event.target.closest("#options-button")
      ) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle function for each component
  const handleToggle = (component) => {
    switch (component) {
      case "TaskOverview":
        setShowTaskOverview((prev) => !prev);
        break;
      case "TaskStatus":
        setShowTaskStatus((prev) => !prev);
        break;
      case "TaskDistribution":
        setShowTaskDistribution((prev) => !prev);
        break;
      case "ScheduledVariance":
        setShowScheduledVariance((prev) => !prev);
        break;
      case "EngagementChart":
        setShowEngagementChart((prev) => !prev);
        break;
      case "EffortDistribution":
        setShowEffortDistribution((prev) => !prev);
        break;
      case "BudgetUsage":
        setShowBudgetUsage((prev) => !prev);
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={`${
        context !== "dashboard" ? "fixed inset-0 z-50" : ""
      } flex items-center justify-end bg-white lg:bg-gray-900 lg:bg-opacity-70 md:bg-gray-900 md:bg-opacity-70 transition-opacity duration-300 overflow-y-auto`}
    >
      <div
        className={`relative bg-white p-5 h-full shadow-md w-full ${
          context !== "dashboard" ? "lg:w-[60%] md:w-[60%] rounded-md" : ""
        } transition-transform duration-500 dark:bg-gray-800 dark:text-gray-200`}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Task Summary
          </h1>
          <div className="flex gap-2 items-center">
            {/* 3-dots options menu */}
            <button
              id="options-button"
              onClick={() => setShowOptions(!showOptions)}
              className="text-gray-600 hover:text-gray-800 p-1 dark:text-gray-300 dark:hover:text-white"
            >
              <FontAwesomeIcon icon={faEllipsisV} />
            </button>

            {/* Dropdown menu for show/hide components */}
            {showOptions && (
              <div
                ref={optionsRef}
                className="absolute bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-md p-2 right-0 mt-48 mr-5 w-64 sm:w-48 md:w-64 max-h-60 overflow-auto"
              >
                <div className="flex flex-col space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showTaskOverview}
                      onChange={() => handleToggle("TaskOverview")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Task Overview</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showTaskStatus}
                      onChange={() => handleToggle("TaskStatus")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Task Status</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showTaskDistribution}
                      onChange={() => handleToggle("TaskDistribution")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Task Distribution</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showScheduledVariance}
                      onChange={() => handleToggle("ScheduledVariance")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Scheduled Variance</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showEngagementChart}
                      onChange={() => handleToggle("EngagementChart")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Engagement Chart</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showEffortDistribution}
                      onChange={() => handleToggle("EffortDistribution")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Effort Distribution</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showBudgetUsage}
                      onChange={() => handleToggle("BudgetUsage")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Budget Usage</span>
                  </label>
                </div>
              </div>
            )}

            <button
              className={`${
                context !== "dashboard" ? "" : "hidden"
              } text-gray-800 bg-gray-200 px-4 py-2 dark:bg-gray-500 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-400 mb-2`}
              onClick={close}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-5 justify-center">
          {summaryData.map((item, index) => (
            <SummaryCard key={index} {...item} />
          ))}
        </div>

        {/* Conditional Rendering Based on Toggled State */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {showTaskOverview && <TaskOverview projectName={projectName} />}
          {showTaskStatus && <TaskStatus projectName={projectName} />}
          {showTaskDistribution && <TaskDistribution projectName={projectName} />}
          {showScheduledVariance && <ScheduledVariance projectName={projectName} />}
          {showEngagementChart && <EngagementChart projectName={projectName} />}
          {showEffortDistribution && <EffortDistribution projectName={projectName} />}
          {showBudgetUsage && <BudgetUsage projectName={projectName} />}

        </div>
      </div>
    </div>
  );
};

export default Summary;
