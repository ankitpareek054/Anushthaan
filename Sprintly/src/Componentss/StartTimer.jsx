
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom';
import { TimePicker } from 'rsuite';
import { NumberPicker } from "react-widgets";
import "react-widgets/styles.css";
import 'rsuite/TimePicker/styles/index.css';
import { getFormattedDate } from '../functions/getFormattedDate.jsx';

import Select from "react-select";
const StartTimer = ({ visibility, close ,setIsStarted,time}) => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
   const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  
  const currentUserId = JSON.parse(localStorage.getItem('user'))._id;
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tasks")
      .then((res) => {
        const foundUser = res.data.filter(user => user.assigneeId === currentUserId);
        setUser(foundUser);
        console.log("found:", foundUser);

        if (foundUser.length > 0) {
          // Convert to objects with label & value for Select

          const uniqueProjects = [...new Set(foundUser.map(project => project.projectName))];
          const projectData = uniqueProjects.map(project => ({
            label: project,
            value: project
          }));
          setProjects(projectData);
          console.log("p", projectData)
        }
      })
      .catch((err) => console.error("Error fetching user", err));
  }, [currentUserId]);


  const handleStart = async () => {
    
    if (!selectedProject) {
      toast.error("Please select a project before starting the timer.");
      return;
    }
  
    console.log("heck")
    axios
      .post("http://localhost:5000/api/startTimer", {
        userId: currentUserId,
        startTime: Date.now(),
        elapsedTime: time,
        breakTime: 0,
        projectName:selectedProject.value,
        date: getFormattedDate(),
        started: true,
      })
      .then((res) => {
        setIsStarted(true);
        localStorage.setItem("startedFor", selectedProject.value);
        
        close();
        console.log("check1")
        toast.success("Timer Started");
      })
      .catch((err) => {
        toast.error("error")
        console.log(err);
      });
  };

  const customStyles = {
    control: (base) => ({...base, backgroundColor: isDarkMode ? "#374151" : "white",borderColor: "#d1d5db",color: isDarkMode ? "#f3f4f6" : "black",}),
    menu: (base) => ({...base,backgroundColor: isDarkMode ? "#374151" : "white",zIndex: 10,}),
    option: (base, state) => ({...base,backgroundColor: state.isSelected? "#3b82f6": state.isFocused ? isDarkMode? "#4b5563": "#bfdbfe": "transparent",color: state.isSelected ? "white" : isDarkMode ? "#f3f4f6" : "black", }),
    singleValue: (base) => ({...base,color: isDarkMode ? "#f3f4f6" : "black",}),
    input: (base) => ({...base,color: isDarkMode ? "#f3f4f6" : "black", }),
    placeholder: (base) => ({...base,color: isDarkMode ? "#d1d5db" : "#6b7280",}),
  };

  return createPortal(
    <div className={`fixed inset-0 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 z-[1000] transition-opacity duration-300 
            ${visibility ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    >
      <form className={`relative bg-white dark:bg-gray-700  dark:text-gray-100 p-5 rounded-md shadow-md w-[90%] lg:w-[40%] md:w-[60%] transition-transform duration-500
                ${visibility ? "scale-100" : "scale-90"}`}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Select project</h2>
          <button
            className="text-gray-800 bg-gray-200 px-4 py-2 dark:bg-gray-500 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-400 mb-2"
            onClick={(e) => {
              e.preventDefault();
              close();
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <Select options={projects} value={selectedProject} onChange={setSelectedProject} placeholder="Select a project" className="w-full mt-2" styles={customStyles}/>
        <div className='flex justify-end gap-3'>
          <button
            className="mt-5  px-6 p-2 rounded-md border border-blue-500 text-blue-500 transform transition-transform duration-200 hover:scale-105"
            onClick={close}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="mt-5 px-6 p-2 rounded-md bg-gradient-to-r from-blue-400 to-blue-900 text-white transition-all duration-300 hover:from-blue-900 hover:to-blue-400"
            onClick={handleStart}
          >
            Start
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};

export default StartTimer;