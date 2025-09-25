import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCircle,
  faSpinner,
  faCheckCircle,
  faUserCircle,
  faCalendarAlt,
  faExpand,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import TaskDetail from "./TaskDetails/TaskDetail.jsx";

const Kanban = ({isSubtask,taskId,taskAssignee,setRefresh}) => {
 
  const { title } = useParams();
  
 const [selectedTask, setSelectedTask] = useState(null);
  const [visiblity, setVisiblity] = useState(false);
  const [refresh, setTaskRefresh] = useState(Date.now)

  
  const [columns, setColumns] = useState({
    noprogress: {
      name: "No Progress",
      tasks: [],
      show: true,
      icon: faCircle,
    },
    inprogress: {
      name: "In Progress",
      tasks: [],
      show: true,
      icon: faSpinner,
    },
    completed: {
      name: "Completed",
      tasks: [],
      show: true,
      icon: faCheckCircle,
    },
  });
  const openDetails = (taskdeet) => {
      setSelectedTask(taskdeet);
      setTimeout(() => setVisiblity(true), 100); 
    };
    useEffect(() => {
      if (selectedTask) {
        setVisiblity(true);
      }
    }, [selectedTask]);
  
  
    const closeDetails = () => {
      setSelectedTask(null);
      setTimeout(() => setVisiblity(false), 100);
    };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let res;
        let newColumns;
  
        if (isSubtask) {
          res = await axios.post(`http://localhost:5000/api/getSubTasks/${taskId}`);
          console.log("hey",res.data)
          newColumns = {
            noprogress: {
              ...columns.noprogress,
              tasks: res.data.filter(task => task.status === "No Progress"),
            },
            inprogress: {
              ...columns.inprogress,
              tasks: res.data.filter(task => task.status === "In-Progress"),
            },
            completed: {
              ...columns.completed,
              tasks: res.data.filter(task => task.status === "Completed"),
            },
          };
        } else {
          res = await axios.get('http://localhost:5000/api/tasks');
          newColumns = {
            noprogress: {
              ...columns.noprogress,
              tasks: res.data.filter(task => task.status === "No Progress" && task.projectName === title),
            },
            inprogress: {
              ...columns.inprogress,
              tasks: res.data.filter(task => task.status === "In-Progress" && task.projectName === title),
            },
            completed: {
              ...columns.completed,
              tasks: res.data.filter(task => task.status === "Completed" && task.projectName === title),
            },
          };
        }
  
        console.log(newColumns); 
        setColumns(newColumns); 
  
      } catch (err) {
        console.log("Failed to retrieve tasks:", err);
      }
    };
  
    fetchData();
  
  }, [isSubtask, taskId, title]);

  const toggleVisibility = (columnKey) => {
    setColumns((prev) => ({
      ...prev,
      [columnKey]: { ...prev[columnKey], show: !prev[columnKey].show },
    }));
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, columnKey) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
  
    setColumns((prevColumns) => {
      const sourceColumnKey = Object.keys(prevColumns).find((key) =>
        prevColumns[key].tasks.some((task) => task._id === taskId)
      );
  
      if (!sourceColumnKey || sourceColumnKey === columnKey) return prevColumns;
  
      const task = prevColumns[sourceColumnKey].tasks.find((t) => t._id === taskId);
      const updatedSourceTasks = prevColumns[sourceColumnKey].tasks.filter((t) => t._id !== taskId);
  
      // Convert frontend columnKey to database format
      let newStatus;
      if (columnKey === "noprogress") newStatus = "No Progress";
      else if (columnKey === "inprogress") newStatus = "In-Progress";
      else if (columnKey === "completed") newStatus = "Completed";
  
      const updatedDestinationTasks = [...prevColumns[columnKey].tasks, { ...task, status: newStatus }];
  
      const newState = {
        ...prevColumns,
        [sourceColumnKey]: { ...prevColumns[sourceColumnKey], tasks: updatedSourceTasks },
        [columnKey]: { ...prevColumns[columnKey], tasks: updatedDestinationTasks },
      };
  
      // Call API to update in database
      updateStatus(taskId, newStatus);
  
      return newState;
    });
  };
  
  const updateStatus = async (taskId, status) => {
    if(!isSubtask){
      try {
        console.log(taskId,status)
        const response = await axios.post("http://localhost:5000/api/updateStatus", { taskId, status })
        .then(res=>{console.log("Task status updated")
          // toast.success("Marked as ",status)
        })
        .catch(err=>console.log("Drag and drop failed"))
        
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    }else{

    }
    try {
      await axios.post(`http://localhost:5000/api/updateSubTaskStatus/${taskId}`, {
          status: status
      })
      setRefresh(Date.now())
      
  } catch (err) {
      console.error('Error updating subtask status', err)
  }
  };


  
  

  return (
    <>
    {!isSubtask && (
      <>
          <p className="text-xl font-bold text-gray-600  dark:text-gray-300 px-4 pt-4">{title}-Task List</p>
          <div className="my-6 bg-gray-200 dark:bg-gray-600 h-[1px] mx-2 "></div>
      </>
    )}

    <div className={`flex flex-col md:flex-row lg:flex-row gap-4 p-4  pt-0 overflow-x-auto  ${isSubtask? "bg-gray-50 dark:border-gray-500 dark:bg-gray-800":""} ` } style={{ scrollbarWidth: "none" }}>
      
      {Object.keys(columns).map((key) => {
        const column = columns[key];
        return (
          <div
            key={key}
            className=" w-80 mt-2 rounded-md p-4 flex flex-col   dark:text-white  "
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, key)}
          >
            <div className="flex justify-between items-center ">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FontAwesomeIcon icon={column.icon} className="text-blue-500" />
                {column.name}
              </h2>
              {/* <button
                onClick={() => toggleVisibility(key)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label={column.show ? "Hide tasks" : "Show tasks"}
              >
                <FontAwesomeIcon icon={column.show ? faEyeSlash : faEye} />
              </button> */}
            </div>
            {column.show && (
              <div className="mt-4 space-y-4">
                {column.tasks.map((task,index) => (
                  <div
                    key={index}
                    className="relative bg-white p-4 rounded shadow-md border border-gray-200 dark:border-gray-500 hover:bg-slate-100 cursor-pointer group dark:bg-gray-800"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                  >
                    <h3 className="text-md font-semibold text-gray-800 mb-2 dark:text-gray-100">
                      {task.title}
                    </h3>
                    <h3 className="text-sm text-gray-800 mb-2 dark:text-gray-100">
                     Project: {title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
                      <FontAwesomeIcon icon={faUserCircle} />
                      <span>{!isSubtask?task.assignee:taskAssignee}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400  gap-2 mt-1">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <p>
                      <span className="text-blue-500">{new Date(task.startDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</span> {" -> "}
                      <span className="text-red-600">{new Date(task.endDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</span>
                      </p>
                    </div>
                    {!isSubtask && (
                      <button className="absolute bottom-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FontAwesomeIcon icon={faExpand}  onClick={() =>openDetails(task)} />
                    </button>
                    )}
                    
                  </div>


                ))}
              </div>
            )}
          </div>
        );
      })}
       {selectedTask && (
         <motion.div
         className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-end"
         initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.5 }}
       >
          <TaskDetail
            proptask={selectedTask}
            closeDetails={closeDetails}
            isVisible={visiblity}
            setTaskRefresh={setTaskRefresh}
          />
       </motion.div>
      )}
    </div>
    </>
  );
};

export default Kanban;
