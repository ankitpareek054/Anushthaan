import {
  faAdd, faArrowDown, faArrowRight, faArrowUp, faBarsProgress, faChevronDown, faChevronUp, faCircleCheck, faCircleHalfStroke, faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddTask from "./AddTask.jsx";
import TaskDetail from "./TaskDetails/TaskDetail.jsx";
import axios from "axios";
import { distance2D, motion } from "framer-motion";
import { faCircleStop } from "@fortawesome/free-regular-svg-icons";
import { Button } from "@headlessui/react";
import { useSelector, useDispatch } from "react-redux";
import { BiSolidTimer } from "react-icons/bi";
import { LuCalendarCheck2 } from "react-icons/lu";
const TaskList = (props) => {

  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null);
  const [visiblity, setVisiblity] = useState(false);
  const [isMyTaskVisible, setIsMyTaskVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const [context, setContext] = useState(props.name); // Context: "home" or "project"
  //current user
  const user = localStorage.getItem("user")
  const parsedUser = JSON.parse(user)
  const currentUserId = parsedUser._id;
  const [showDropDown, setShowDropDown] = useState(true)
  const selectedGroup = useSelector((state) => state.groupBy.groupByField); // Get groupBy value from Redux
  const appliedFilters = useSelector((state) => state.filters.filters);
  const searchQuery = useSelector((state) => state.search.searchQuery)
  const [refresh, setRefresh] = useState(false);

  const openDetails = (taskdeet) => {
    setSelectedTask(taskdeet);
    setTimeout(() => setVisiblity(true), 100); // Small delay for smooth effect
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

  const [isAddTaskVisible, setAddTaskVisible] = useState(false);
  const openAddTask = () => {
    setAddTaskVisible(true);
  };
  const closeAddTask = () => {
    setAddTaskVisible(false);
  };

  useEffect(() => {
  setIsLoading(true);
  axios
    .get('http://localhost:5000/api/tasks')
    .then((res) => {
      setIsLoading(false);
      setTasks(res.data);
      props.setTaskList(res.data);
    })
    .catch((err) => {
      console.log("failed to retreive tasks", err);
      setIsLoading(false);
    });
}, [refresh]);


  useEffect(()=>{
    if(context==="project"){
      axios
      .post(`http://localhost:5000/api/updateProjectStatus/${props.projectname}`)
        .then(()=> console.log("success"))
        .catch((err)=>console.log("error checking tasks of project",err))
     
    }
  },[props.projectname,context])




  let filteredTasks = tasks
  if (context === "project") {
    filteredTasks = filteredTasks
      .filter(task =>
        task.projectName?.trim().toLowerCase() === props.projectname?.trim().toLowerCase()
      )
      .sort((a, b) => {
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  } else if (currentPath === "/my-tasks" || currentPath === "/home") {//displays createdby me tasks in tasklist too
  filteredTasks = filteredTasks
    .filter(task =>
      task.assigneeId === currentUserId || task.createdBy === parsedUser.name
    )
    .sort((a, b) => {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

  const groupTasks = (tasks, key) => {
    const grouped = {}; // Initialize an empty object to store the grouped tasks

    tasks.forEach((task) => {
      const groupKey = task[key] || "Uncategorized"; // Default to 'Uncategorized' if key is missing
      if (!grouped[groupKey]) {
        grouped[groupKey] = []; // Initialize the group if it doesn't exist
      }
      grouped[groupKey].push(task); // Add the task to the appropriate group
    });

    return grouped;
  };

  filteredTasks = filteredTasks.filter((task) =>
    Object.keys(appliedFilters).every((filterKey) => {
      const filterValue = appliedFilters[filterKey];
      const taskValue = task[filterKey];

      if (!filterValue || filterValue.length === 0) return true; // Ignore empty filters
      if (Array.isArray(filterValue)) return filterValue.includes(taskValue);
      return filterValue === taskValue;
    })
  );


  const groupedTasks = selectedGroup ? groupTasks(filteredTasks, selectedGroup) : filteredTasks;

  const [completedProgress, setcompletedProgress] = useState(0);
  const [inProgressPercentage, setInProgressPercentage] = useState(0);
  const [completeLength, setCompleteLength] = useState(0);
  const [inProgressLength, setInProgressLength] = useState(0);

  useEffect(() => {
    let visibleTasks = filteredTasks;
 
    if (currentPath !== "/my-tasks") {
      visibleTasks = filteredTasks.filter(task => task.visibility !== "private" || task.assigneeId==currentUserId);
    }
 
    if (visibleTasks.length > 0) {
      const totalTasks = visibleTasks.length;
      const completedTasks = visibleTasks.filter(task => task.status === "Completed").length;
      const inProgressTasks = visibleTasks.filter(task => task.status === "In-Progress" ).length;
 
      setInProgressLength(totalTasks - completedTasks);
      setCompleteLength(completedTasks);
      setcompletedProgress(Math.round((completedTasks / totalTasks) * 100));
      setInProgressPercentage(Math.round((inProgressTasks / totalTasks) * 100));
    } else {
      setInProgressLength(0);
      setCompleteLength(0);
      setcompletedProgress(0);
      setInProgressPercentage(0);
    }
  }, [tasks, context, props.projectname, currentPath, filteredTasks]);
 
  useEffect(() => {
    if (currentPath === "/my-tasks") {
      setIsMyTaskVisible(true);
    } else {
      setIsMyTaskVisible(false);
    }

  }, [currentPath, tasks]);


  return (
    <div
      className={`${context === "project"
        ? "w-[95vw] mr-auto   p-6 bg-white dark:bg-gray-800 border-2 dark:border-gray-600 shadow rounded-lg sm:w-full overflow-y-auto max-h-[78vh]"
        : " mr-auto mt-3 p-6 bg-white dark:bg-gray-800 border-2 dark:border-gray-600 shadow rounded-lg sm:w-full overflow-y-auto max-h-[84vh]"
        }`}
      style={{ scrollbarWidth: "none" }}
    >

      <div className="flex flex-col md:flex-row justify-between dark:text-gray-100">
        <h2 className="text-xl font-bold text-gray-600 mb-2 md:mb-6 dark:text-gray-300">{context === "project" ? props.projectname + "-" : ""}Task List</h2>
        {props.addtask === "yes" ? (
          <span>
            <button
              className="bg-gradient-to-r from-blue-400 to-blue-800 text-white p-2 rounded-md"
              onClick={openAddTask}
            >
              <FontAwesomeIcon icon={faAdd} className="mr-2" />
              Add task
            </button>
          </span>
        ) : (
          <div className="text-xs" title="Task's Progress">
            <p className={`${completedProgress == 0 ? "hidden" : "w-48 md:w-56"} `}>
              {/* <span
                style={{ display: "inline", marginLeft: `${completedProgress}%` }}
              >
                {completeLength} 
              </span> */}
              {/* {inProgressPercentage != 0 && (
                <span
                  style={{ display: "inline", marginLeft: `${inProgressPercentage}%` }}
                >
                  {inProgressLength}
                </span>
              )
              } */}

            </p>
            <div className="flex items-center ">

              <span >{completedProgress}%</span>
              <div className="flex w-48 md:w-56 bg-gray-200 h-2 rounded-lg overflow-hidden ml-1">
                <div
                  className="bg-blue-600 h-full"
                  style={{ width: `${completedProgress}%` }}
                ></div>
                {/* <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${(inProgressPercentage < 50) ? inProgressPercentage : 50}%` }}
                ></div> */}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-gray-600 dark:text-gray-100 text-2xl"
          />
        </div>
      ) : (
        filteredTasks.length === 0 ? (
          <h1 className="w-full text-gray-500 dark:text-gray-100 font-bold text-center  text-lg">
            {!searchQuery ? `No tasks to display ${context === "project" ? "in " + props.projectname : ""}` : "No result Found"}</h1>
        ) : (
          <>
          {!selectedGroup && (
  <>
    {currentPath === "/home" ? (
      // Home Route: 3 Columns
      <div className="hidden md:grid grid-cols-3 font-semibold text-gray-600 dark:text-gray-300 text-sm border-b border-gray-300 dark:border-gray-600 pb-2 mb-2">
        <div className="pl-4">Title</div>
        <div className="pl-16 2xl:pl-40 text-center">Date</div>
        <div className="pl-16 2xl:pl-60 text-center">Priority</div>
      </div>
    ) : (
      // Other Routes: 4 Columns
      <div className="hidden md:grid grid-cols-4 font-semibold text-gray-600 dark:text-gray-300 text-sm border-b border-gray-300 dark:border-gray-600 pb-2 mb-2">
        <div className="pl-4">Title</div>
        <div className="pl-4">{isMyTaskVisible ? "Assignor" : "Assignee"}</div>
        <div className="pl-4">Date</div>
        <div className="flex justify-between pr-4">
          <span className="min-w-[60px]">Priority</span>
          <span className="min-w-[60px]">Progress</span>
        </div>
      </div>
    )}
  </>
)}



          {(selectedGroup ? Object.entries(groupedTasks) : [["All Tasks", filteredTasks]]).map(
            ([groupName, tasks]) => (
              <div key={groupName} className={`mb-4 ${selectedGroup ? "p-4 -mx-2 border-2 rounded-md shadow-lg" : ""}`}>
                {selectedGroup && <h2 className="text-lg font-bold text-gray-600 dark:text-gray-300">{groupName}</h2>}
                <div className="space-y-0.5">
                  {tasks.map((task, index) =>
                    (task.visibility === "public" ||
                      (task.visibility === "private" && (task.createdBy === parsedUser.name || task.assigneeId === parsedUser._id))
                    ) && (
                      <div className="border-b dark:border-gray-600 last:border-none  " key={index}>
                        {/* ${new Date(task.endDate) < new Date() && task.status!=="Completed"?"border border-red-400":""} */}
                        {/* border border-red-400 dark:border-red-400 */}
                        <div
                          className={`relative p-4 py-1 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4  rounded-lg  md:flex-row lg:flex-row items-start   hover:bg-gray-50 dark:hover:bg-gray-700 `}
                          onClick={() => openDetails(task)}
                         
                        >
                          {/* Task Status Icon */}
                          <div className=" absolute left-0 top-2  ml-2 *:text-base">
                            {task.status === "Completed" ? (
                              <FontAwesomeIcon
                                icon={faCircleCheck}
                                className="text-green-500"
                              />
                            ) : task.status === "No Progress" ? (
                              <FontAwesomeIcon
                                icon={faCircleStop}
                                className="text-gray-500 dark:text-gray-200"
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faCircleHalfStroke}
                                className="text-yellow-500"
                              />
                            )}
                          </div>

                          {/* Task Details */}
                          {/* <div className="flex flex-col md:flex-row lg:flex-row flex-wrap pl-4 gap-2 dark:text-gray-100"> */}
                            <div className={`flex  flex-wrap ml-3 lg:flex-row py-1 items-center my-auto ${(context == "home" && !isMyTaskVisible)?"col-span-2":""}`}>
                             

                             
                                {context === "home" && (<span className="font-semibold text-gray-500 dark:text-gray-400 text-nowrap ">{task.projectName}-</span>)}
                                <span className={`text-gray-800  dark:text-gray-100 `}> {task.title}</span>
                               
                            </div>
                            {(isMyTaskVisible || context=="project") && (
                              <div className="flex flex-wrap items-center ">
                              <span className="bg-gray-200 dark:bg-gray-600 dark:text-gray-200 py-0.5 px-2 text-sm rounded-xl text-nowrap">
                                {isMyTaskVisible ? "Assignor: " + task.createdBy : "Assignee: " + task.assignee}
                                {/* Assignee: {task.assignee} */}
                              </span>
                             
                            </div>
                            )}
                           
                          {/* </div> */}
                          <div className="flex flex-nowrap mt-2">
                          {task.status === "Completed" ? (
                                <p className="p-0.5  text-sm text-green-500 flex flex-nowrap"><span><LuCalendarCheck2 className="mt-1" /></span> Completed {new Date(task.completedOn).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</p>
                              ):
                              (
                                <span className="p-0.5  text-sm text-nowrap dark:text-gray-100">
                                <span className="text-blue-500">{new Date(task.startDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</span><FontAwesomeIcon icon={faArrowRight} className="mx-1 text-gray-600 dark:text-gray-400 text-xs"/>

                                <span className={`text-red-500 ${new Date(task.endDate) < new Date() && task.status !== "Completed" ? "bg-red-100 px-2 rounded-md" : ""}`}> {new Date(task.endDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</span>
                                {(new Date(task.endDate) < new Date() && task.status !== "Completed") &&
                                (
                                  <BiSolidTimer className="text-xl text-red-400 my-auto ml-1 inline" />
                                )}
                              </span>
                              )
                              }
                                                         
                            </div>
                          {/* Priority and Progress */}
                          <div
                            className={`${context === "project"
                              ? "flex flex-col md:flex-row "
                              : " justify-end flex flex-row "
                              }`}
                          >
                            {/* Priority */}
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full  mx-2 text-nowrap space-x-1 w-fit mb-2  ${task.priority === "High"
                                ? " text-red-500"
                                : task.priority === "Medium"
                                  ? " text-yellow-600"
                                  : " text-green-500"
                                }`}
                            >
                              {task.priority === "High" && (
                                <FontAwesomeIcon icon={faArrowUp} className="text-xs" />
                              )}
                              {task.priority === "Medium" && (
                                <FontAwesomeIcon icon={faBarsProgress} className="text-xs" />
                              )}
                              {task.priority === "Low" && (
                                <FontAwesomeIcon icon={faArrowDown} className="text-xs" />
                              )}
                              <span>{task.priority}</span>
                            </span>

                            {(context === "project" || props.addtask === "no") &&
                              <div className="w-28 bg-gray-200 h-1 opacity-50 hover:opacity-100 rounded-lg overflow-hidden md:ml-auto my-auto">
                                <div className={`bg-amber-600 dark:bg-amber-400 h-full ${task.status === "Completed" ? "w-full" : task.status === "In-Progress" ? "w-1/2" : "w-0"} `}></div></div>
                            }
                          </div>

                        </div>
                        {task.subTasks.length > 0 && (
                          <div className="ml-0 md:ml-8  text-sm space-y-1 mb-2">
                            <Button className="w-6 md:hidden" onClick={() => setShowDropDown(!showDropDown)}><FontAwesomeIcon icon={!showDropDown ? faChevronDown : faChevronUp} /></Button>
                            {showDropDown && task.subTasks.map((subtask, index) => (
                              <div key={index} className="">
                                <p className="w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-200 p-2 rounded-md">

                                  <span className="mr-2 text-sm">
                                    {subtask.status === "Completed" ? (
                                      <FontAwesomeIcon
                                        icon={faCircleCheck}
                                        className="text-green-500"
                                      />
                                    ) : subtask.status === "No Progress" ? (
                                      <FontAwesomeIcon
                                        icon={faCircleStop}
                                        className="text-gray-500 dark:text-gray-200"
                                      />
                                    ) : (
                                      <FontAwesomeIcon
                                        icon={faCircleHalfStroke}
                                        className="text-yellow-500"
                                      />
                                    )}
                                  </span>
                                  {subtask.title}
                                  <span className="text-blue-500   ml-3">{new Date(subtask.startDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</span><FontAwesomeIcon icon={faArrowRight} className="mx-1 text-gray-600 dark:text-gray-400 text-xs"/>
                                  <span className="text-red-600">{new Date(subtask.endDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</span>
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  {/* )} */}
                </div>
              </div>
            )
          )}
          </>
            
        ))
        
      }

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
      {isAddTaskVisible && (
        <div className="fixed inset-0 z-50 w-[60%]">
          <AddTask visiblity={isAddTaskVisible} close={closeAddTask} name="home" />
        </div>
      )}
    </div>
  );
};

export default TaskList;