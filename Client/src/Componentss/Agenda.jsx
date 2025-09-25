import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faBarsProgress,
  faArrowDown,
  faCalendar,
  faAnglesLeft,
  faAnglesRight
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { motion } from "framer-motion";
import TaskDetail from "./TaskDetails/TaskDetail.jsx";

const TaskCalendar = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [visiblity, setVisiblity] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [weekStart, setWeekStart] = useState(getStartOfCurrentWeek());
  const prevDateRef = useRef("");
  const [refresh, setRefresh] = useState(Date.now)

  const openDetails = (taskdeet) => {
    setSelectedTask(taskdeet);
    setTimeout(() => setVisiblity(true), 100); // Small delay for smooth effect
  };

  const closeDetails = () => {
    setSelectedTask(null);
    setTimeout(() => setVisiblity(false), 100);
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tasks")
      .then((res) => {
        const sortedTasks = res.data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        setTasks(sortedTasks);
      })
      .catch((err) => console.log("failed to retrieve tasks", err));
  }, []);

  useEffect(() => {
    filterTasksByWeek();
  }, [tasks, weekStart]);

  const filterTasksByWeek = () => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const filtered = tasks.filter(task => {
      const taskDate = new Date(task.startDate);
      return taskDate >= weekStart && taskDate <= weekEnd;
    });

    setFilteredTasks(filtered);
  };

  const handlePrevWeek = () => {
    setWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  function getStartOfCurrentWeek() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as the start
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }

  function getWeekEnd(startOfWeek) {
    const weekEnd = new Date(startOfWeek);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return weekEnd;
  }

  return (
    <div className="p-4 border-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 shadow mt-3 rounded-lg overflow-y-auto max-h-[84vh] w-full lg-[75%]" style={{ scrollbarWidth:"thin"}}>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl text-gray-600 font-bold dark:text-gray-300">Agenda</h1>
        <div className="flex space-x-2">
          <button onClick={handlePrevWeek} className="px-4 py-2 border border-blue-400 text-blue-400 dark:text-blue-300 hover:bg-gray-500 rounded ">
            <FontAwesomeIcon icon={faAnglesLeft}/>Prev
          </button>
          <button onClick={handleNextWeek} className="px-4 py-2 border border-blue-400 text-blue-400 dark:text-blue-300 hover:bg-gray-500 rounded ">
            Next<FontAwesomeIcon icon={faAnglesRight}/>
          </button>
        </div>
      </div>
      
        {filteredTasks.length === 0 ? (
          <div className="p-4">
          <h1 className="w-full text-gray-500 dark:text-gray-100 font-bold text-center text-lg">No Agenda for this week</h1>
          <p className="w-full text-gray-500 dark:text-gray-100 text-center">
            {weekStart.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })} - {getWeekEnd(weekStart).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
          </p>
        </div>
        ) : (
          (prevDateRef.current=""),
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          {filteredTasks.map((task, index) => (
            <div key={index}>
              {prevDateRef.current !== new Date(task.startDate).toLocaleDateString("en-US") ? (
                (prevDateRef.current = new Date(task.startDate).toLocaleDateString("en-US")),
                <div
                  className={`p-4 ${new Date(task.startDate).toDateString() === new Date().toDateString()
                    ? "bg-blue-100 text-blue-600 dark:bg-gray-600 dark:text-blue-300 border border-blue-300"
                    : "bg-gray-100 dark:bg-gray-700"  
                    }`}
                >
                  {new Date(task.startDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              ) : (
                ""
              )}

              <div className="flex flex-wrap lg:flex-nowrap items-center p-4 space-x-2 w-full" onClick={() => openDetails(task)}>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${task.priority === "High"
                    ? "bg-red-100 text-red-600"
                    : task.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-500"
                    }`}
                >
                  {task.priority === "High" && (
                    <FontAwesomeIcon icon={faArrowUp} className="text-sm" />
                  )}
                  {task.priority === "Medium" && (
                    <FontAwesomeIcon icon={faBarsProgress} className="text-sm" />
                  )}
                  {task.priority === "Low" && (
                    <FontAwesomeIcon icon={faArrowDown} className="text-sm" />
                  )}
                  <span>{task.priority}</span>
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full text-nowrap ${task.status === "Completed"
                    ? "bg-green-100 text-green-600"
                    : task.status === "In-Progress"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-gray-100 text-gray-600"
                    }`}
                >
                  {task.status}
                </span>
                <span className="flex-1 text-sm">{task.title}</span>
                <span className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <FontAwesomeIcon icon={faCalendar} />
                  <span>
                    {new Date(task.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </span>
              </div>
            </div>
           
          ))}</div>
        )}
        {selectedTask && (
        <motion.div
        className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-end"
        initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.5 }}
      >
          <TaskDetail
            proptask={selectedTask}
            closeDetails={closeDetails}
            isVisible={visiblity}
            setTaskRefresh={setRefresh}
          />
        </motion.div>
      )}

      </div>
    
  );
};

export default TaskCalendar;
