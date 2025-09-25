import React, { useEffect, useState } from "react";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import gantt from "dhtmlx-gantt";
import axios from "axios";


const Gantt = ({ projectname, isSubtask, taskId }) => {
  const [tasks, setTasks] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let response;
        if (isSubtask) {
          response = await axios.post(`http://localhost:5000/api/getSubTasks/${taskId}`);
        } else {
          response = await axios.get("http://localhost:5000/api/tasks");
        }
        const data = response.data;
        const filteredTasks = isSubtask ? data : data.filter(task => task.projectName === projectname);
        setTasks(filteredTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };


    fetchTasks();
  }, [projectname, isSubtask, taskId]);

  useEffect(() => {
    gantt.config.date_format = "%d-%m-%Y";
    gantt.config.autosize = window.innerWidth < 768 ? "xy" : false;

    // Define column structure
    gantt.config.columns = [
      { name: "text", label: "Task Name", tree: true, width: 200, resize: true },
      { name: "start_date", label: "Start Date", align: "center", width: 100, resize: true },
      { name: "end_date", label: "End Date", align: "center", width: 100, resize: true }
    ];

    // Format date for display
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return gantt.date.date_to_str("%d-%m-%Y")(date);
    };

    const todayStr = gantt.date.date_to_str("%d-%m-%Y")(new Date());

  //highlight current date
  gantt.templates.scale_cell_class = function (date) {
    return gantt.date.date_to_str("%d-%m-%Y")(date) === todayStr ? "today-header" : "";
  };

  gantt.templates.task_class = function (start, end, task) {
    if (task.status === "Completed") {
        return "completed-task"; 
    } else if (task.status === "In-Progress") { // Ensure this matches your actual status value
        return "in-progress-task";  // Ensure it matches the CSS class name
    }
    return "";
};


    // Initialize Gantt
    gantt.init("gantt");
    gantt.clearAll();

    gantt.parse({
      data: tasks.map(task => ({
        id: task._id,
        text: task.title,
        start_date: formatDate(task.startDate),
        end_date: formatDate(task.endDate),
        progress: task.status === "Completed" ? 1 : 0,
        status: task.status,
      })),
    });

    // Handle Task Updates
    gantt.attachEvent("onAfterTaskUpdate", async (id, task) => {
      try {
        if (isSubtask) {
          await axios.post(`http://localhost:5000/api/editSubTask/${taskId}/${task.id}`, {
            title: task.text,
            startDate: task.start_date,
            endDate: task.end_date
          });
        } else {
          await axios.post(`http://localhost:5000/api/updateDates/${task.id}`, {
            startDate: task.start_date,
            endDate: task.end_date
          });
        }
        console.log("Task updated successfully!");
      } catch (error) {
        console.error("Error updating task:", error);
      }
    });

  }, [tasks]);


  return (
    <div className="p-4 shadow-lg bg-white dark:bg-gray-800 dark:text-gray-300 rounded-lg">
    <div className="flex justify-between">
    <h2 className="text-xl font-semibold mb-4">{projectname} - Gantt Chart</h2>
    <div className=" flex space-x-2 text-xs">
      <div className="flex ">
        <p className="w-3 h-3 rounded-full bg-gray-500 mt-0.5"></p>
        <p>-No Progress</p>
      </div>
      <div className="flex">
        <p className="w-3 h-3 rounded-full bg-yellow-500 mt-0.5"></p>
        <p>-In-Progress</p>
      </div>
      <div className="flex">
        <p className="w-3 h-3 rounded-full bg-green-500 mt-0.5"></p>
        <p>-Completed</p>
      </div>
      
    </div>
    </div>

      <div className="w-full overflow-x-hidden overflow-y-hidden">
        <div id="gantt" className={`w-full h-[77vh] dark:bg-gray-600 ${isSubtask ? "h-[50vh]" : ""}`}></div>
      </div>
    </div>
  );
};

export default Gantt;
