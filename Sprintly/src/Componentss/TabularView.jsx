import {
  faArrowDown,
  faArrowUp,
  faBarsProgress,
  faCircleCheck,
  faSpinner,
  faCircleHalfStroke,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { faCircleStop } from "@fortawesome/free-regular-svg-icons";
import {  motion } from "framer-motion";
import TaskDetail from "./TaskDetails/TaskDetail.jsx";



export const TabularView = (props) => {
  const headers = [
    "Title",
    "Created By",
    "Assignee",
    "Start Date",
    "End Date",
    "Priority",
    "Status",
    "Completed On",
  ];
  const [datas, setData] = useState([]);
  const selectedGroup = useSelector((state)=>state.groupBy.groupByField)
  const searchQuery = useSelector((state) => state.search.searchQuery)
  const [isLoading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [visiblity, setVisiblity] = useState(false);
   const [refresh, setRefresh] = useState(Date.now)
  
  
  const appliedFilters = useSelector((state) => state.filters.filters);
  

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tasks")
      .then((res) => {setData(res.data);
        setLoading(false);
       
      })
      .catch((err) => console.log("Failed to retrieve tasks", err));
     // setLoading(false);
  }, []);

  let filteredData = datas
    .filter((data) => data.projectName?.trim().toLowerCase() === props.projectname?.trim().toLowerCase())
    .sort((a, b) => {
      const priority = { High: 1, Medium: 2, Low: 3 };
      return priority[a.priority] - priority[b.priority];
    });
    filteredData = filteredData.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    filteredData = filteredData.filter((task) =>
      Object.keys(appliedFilters).every((filterKey) => {
        const filterValue = appliedFilters[filterKey];
        const taskValue = task[filterKey];
        if (!filterValue || filterValue.length === 0) return true; // Ignore empty filters
        if (Array.isArray(filterValue)) return filterValue.includes(taskValue);
        return filterValue === taskValue;
      })
    );
    
  
    const groupedTasks = selectedGroup ? groupTasks(filteredData, selectedGroup) : filteredData;
    
  return (
    <div className="p-4 overflow-x-auto max-h-[80vh] border-2 dark:border-gray-600 shadow rounded-lg dark:bg-gray-800 dark:text-gray-100">
      <p className="text-xl md:text-2xl font-bold mb-4">{props.projectname}</p>
      {(selectedGroup ? Object.entries(groupedTasks) : [["All Tasks", filteredData]]).map(([groupName, data]) => (//p-4 border-2 rounded-md shadow-lg
              <div key={groupName} className="mb-4 ">
                {selectedGroup && (<h2 className="text-lg font-bold text-gray-600 dark:text-gray-300">{groupName}</h2>)}
      <div className="overflow-x-auto">
        {isLoading ? (
                <div className="flex items-center justify-center">
                          <FontAwesomeIcon
                            icon={faSpinner}
                            spin
                            className="text-gray-600 dark:text-gray-100 text-2xl"
                          />
                        </div>
              ) :  (
        <table className="w-full min-w-[600px] border-collapse border border-gray-300 dark:border-gray-500">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-800 text-xs md:text-sm">
              {headers.map((header, index) => (
                <th key={index} className="border border-gray-300 dark:border-gray-600 p-2">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
              {filteredData.length > 0 ? (
              data.map((data, index) => (
                <tr key={index} className=" odd:bg-white even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-800 text-xs md:text-sm" onClick={() => openDetails(data)}>
                  <td className=" border border-gray-300 dark:border-gray-500 p-2 py-3 " >{data.title}</td>
                  <td className=" border border-gray-300 dark:border-gray-500 p-2 ">{data.createdBy}</td>
                  <td className=" border border-gray-300 dark:border-gray-500 p-2" >{data.assignee}</td>
                  <td className=" border border-gray-300 dark:border-gray-500 p-2 text-nowrap" >{new Date(data.startDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</td>
                  <td className="border border-gray-300 dark:border-gray-500 p-2 text-nowrap"  >{new Date(data.endDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</td>
                  <td className="border border-gray-300 dark:border-gray-500 p-2 text-nowrap"  >
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        data.priority === "High"
                          ? " text-red-600"
                          : data.priority === "Medium"
                          ? " text-yellow-600"
                          : " text-green-600"
                      }`}
                    >
                      {data.priority === "High" && <FontAwesomeIcon icon={faArrowUp} className="pr-1" />}
                      {data.priority === "Medium" && <FontAwesomeIcon icon={faBarsProgress} className="pr-1" />}
                      {data.priority === "Low" && <FontAwesomeIcon icon={faArrowDown} className="pr-1" />}
                      {data.priority}
                    </span>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-500 p-2 text-nowrap"  onClick={() => openDetails(data)}>
                    {data.status === "Completed" ? (
                      <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 text-lg" />
                    ) : data.status === "In-Progress" ? (
                      <FontAwesomeIcon icon={faCircleHalfStroke} className="text-yellow-500 text-lg" />
                    ) : (
                      <FontAwesomeIcon icon={faCircleStop} className="text-gray-500 text-lg" />
                    )} {data.status}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-500 p-2 text-nowrap"  onClick={() => openDetails(data)}>
                    {data.completedOn ? new Date(data.completedOn).toLocaleDateString("en-US", { day: "numeric", month: "short" }) : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="text-center p-4">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
              )}
      </div>

      </div>
      ))}{selectedTask && (
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


export default TabularView;
