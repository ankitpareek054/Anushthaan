import { faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const AddTask = ({ name, defaultProjectName, visiblity, close, task, setRefresh }) => {
  const [assigneeSelected, setAssigneeSelected] = useState(null);
  const [assignee, setAssignee] = useState([]);
  const [statusSelected, setStatusSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState([]);
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const today = new Date().toISOString().split('T')[0]; // to prevent past date to be selected as Task end date in edit
  const minEndDate = new Date(minDate) > new Date(today) ? minDate : today; // to prevent past date to be selected as Task end date in edit



  const [status] = useState([
    { value: "Completed", label: "Completed" },
    { value: "No Progress", label: "No Progress" },
    { value: "In-Progress", label: "In-Progress" },
  ]);
  const [prioritySelected, setPrioritySelected] = useState(null);
  const [priority] = useState([
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" }
  ]);
  const [projectnameSelected, setProjectNameSelected] = useState(null);
  const [projectname, setProjectName] = useState([]);
  // New state for visibility selection
  const [visibilitySelected, setVisibilitySelected] = useState();
  const visibilityOptions = [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" }
  ];

  const [isHome, setIsHome] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if ((name === "project" || name === "edit") && defaultProjectName) {
      setProjectNameSelected({ value: defaultProjectName, label: defaultProjectName });
      setIsHome(false);
    }
  }, [name, defaultProjectName]);

  //edit task default displays
  (name === "edit" &&
    (
      useEffect(() => {

        setAssigneeSelected({ value: task.assigneeId, label: task.assignee })
        setStatusSelected({ value: task.status, label: task.status })
        setPrioritySelected({ value: task.priority, label: task.priority })
        document.getElementById("project-name").value = task.title;
        document.getElementById("project-description").value = task.description;
        document.getElementById("start-date").value = new Date(task.startDate).toISOString().split('T')[0];
        document.getElementById("end-date").value = new Date(task.endDate).toISOString().split('T')[0];
        setVisibilitySelected({ value: task.visibility, label: task.visibility })
      }, [])
    )
  )


  // project date range
  useEffect(() => {
    if (project) {
      setMinDate(project.pstart?.split("T")[0] || "");
      setMaxDate(project.pend?.split("T")[0] || "");
    }
  }, [project]);






  // Fetching members based on project selected
  useEffect(() => {
    if (projectnameSelected) {
      axios
        .post(`http://localhost:5000/api/getMembers/${projectnameSelected.value}`)
        .then((res) => {
          const members = res.data.map((member) => ({ value: member._id, label: member.name }));
          if (name !== "edit") {
            setAssignee([
              { value: "Unassigned", label: "Unassigned", isDisabled: true, style: { backgroundColor: "gray" } },
              ...members
            ]);
            setAssigneeSelected({ value: "Unassigned", label: "Unassigned" });
          } else {
            setAssigneeSelected({ value: task.assigneeId, label: task.assignee });
            setAssignee([
              { value: "Unassigned", label: "Unassigned", isDisabled: true, style: { backgroundColor: "gray" } },
              ...members
            ]);
          }
        })
        .catch(() => console.error("Error fetching assignees"));
    } else {
      setAssignee([]);
      setAssigneeSelected(null);
    }
  }, [projectnameSelected]);

  // Fetching projects
  useEffect(() => {
    // refactored for start date within proj range
    axios
      .post("http://localhost:5000/api/fetchProjects")
      .then((res) => {
        setProjectName(res.data.map((project) => ({ value: project.pname, label: project.pname })));

        if (defaultProjectName) {
          const selectedProj = res.data.find((proj) => proj.pname === defaultProjectName);
          setProject(selectedProj);
          setMinDate(selectedProj?.pstart?.split("T")[0] || "");
          setMaxDate(selectedProj?.pend?.split("T")[0] || "");
        }
      })
      .catch((err) => console.error("Error fetching projects", err));
  }, []);

  //added for start date within proj range
  useEffect(() => {
    if (projectnameSelected && projectname.length > 0) {
      const selectedProj = projectname.find((p) => p.value === projectnameSelected.value);
      if (selectedProj) {
        axios.post("http://localhost:5000/api/fetchProjects")
          .then((res) => {
            const matched = res.data.find(p => p.pname === projectnameSelected.value);
            setProject(matched);
            setMinDate(matched?.pstart?.split("T")[0] || "");
            setMaxDate(matched?.pend?.split("T")[0] || "");
          });
      }
    }
  }, [projectnameSelected]);


  useEffect(() => {
    console.log("Updated project state:", project);
  }, [project]);

  const handleSubmit = async (event) => {
    setIsLoading(true)
    event.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!projectnameSelected) {
      toast.error("Please select a project.");
      setIsLoading(false);
      return;
    }
    if (!assigneeSelected || assigneeSelected.value === "Unassigned") {
      toast.error("Please select an assignee.");
      setIsLoading(false)
      return;
    }
    if (document.getElementById("start-date").value > document.getElementById("end-date").value) {
      document.getElementById("end-date").setCustomValidity("End date must be greater than or equal to start date.");
      document.getElementById("end-date").reportValidity(); // Show error immediately
      setIsLoading(false);
      return;
    }

    const formData = {
      title: document.getElementById("project-name").value,
      description: document.getElementById("project-description").value,
      projectName: projectnameSelected?.value || "None",
      assignee: assigneeSelected?.label || "Unassigned",
      assigneeId: assigneeSelected?.value || null,
      status: statusSelected?.value || "No Progress",
      priority: prioritySelected?.value || "Low",
      startDate: document.getElementById("start-date").value,
      endDate: document.getElementById("end-date").value,
      createdBy: user?.name,
      createdById: user?._id,
      visibility: visibilitySelected?.value || "public"
    };
    // Storing task
    if (name === "edit") {
      await axios
        .post(`http://localhost:5000/api/editTask/${task._id}`, formData)
        .then(() => {
          setIsLoading(false)
          close();
          toast.success("Task updated");
          setRefresh(Date.now());
        })
        .catch((err) => {
          setIsLoading(false)
          toast.error("Failed to update task");
          console.log("Error updating task", err);
        });
    } else {
      console.log(visibilitySelected);
      await axios
        .post("http://localhost:5000/api/addTasks", formData)
        .then(() => {
          setIsLoading(false)
          close();
          toast.success("Task added successfully");
        })
        .catch(() => {
          setIsLoading(false)
          toast.error("Failed to add task");
        })
    }
  };



  return (
    <div className={`fixed inset-0 flex items-center ${name === "edit" ? "justify-start" : "justify-center"}  p-4 bg-gray-900 bg-opacity-50 z-50 transition-opacity duration-300 ${visiblity ? "opacity-100 bg-gray-950 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      <form className="relative bg-white dark:bg-gray-700 dark:text-gray-100 p-5 rounded-md shadow-md w-[95%] lg:w-[60%] md:w-[80%] transition-transform duration-500" onSubmit={handleSubmit}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{name === "edit" ? "Edit Task" : "Add Task"}</h2>
          <button
            type="button"
            className="text-gray-800 bg-gray-200 px-4 py-2 dark:bg-gray-500 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-400 mb-2"
            onClick={close}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        {/* Title Field */}
        <div className="relative mb-4">
          <input type="text" id="project-name" className="peer w-full border-b border-gray-300 dark:bg-gray-700 dark:text-gray-100 px-3 pt-6 pb-2 focus:outline-none focus:border-b-blue-500  autofill:bg-transparent autofill:shadow-none"
            placeholder=" " />
          <label
            htmlFor="project-name"
            className="absolute left-3 top-1 text-gray-500 text-sm transition-all duration-200 transform peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500"
          >
            Title
          </label>
        </div>
        {/* Description Field */}
        <div className="relative mb-4">
          <input type="text" id="project-description" className="peer w-full border-b dark:bg-gray-700  dark:text-gray-100 border-gray-300 px-3 pt-6 pb-2 focus:outline-none focus:border-b-blue-500"
            placeholder=" "
          />
          <label htmlFor="project-description" className="absolute left-3 top-1 text-gray-500 text-sm transition-all duration-200 transform peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500">
            Description
          </label>
        </div>
        <div className="relative mb-4 flex items-center">
          <label className="block text-gray-500 dark:text-gray-400 ">Project</label>
          <Select options={isHome ? projectname : []} value={projectnameSelected} onChange={setProjectNameSelected} className='w-full ml-4' />
        </div>
        <div className='flex flex-col lg:flex-row justify-between'>
          <div className="relative mb-4 flex items-center">
            <label className="block text-gray-500 dark:text-gray-400 text-nowrap">Assign to</label>
            <Select
            options={assignee}
            value={assigneeSelected}
            onChange={setAssigneeSelected}
            isDisabled={!assignee.length}
            className="ml-2 w-52"
            placeholder="Select a project first"
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: isDarkMode ? '#374151' : '#fff',
                borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                '&:hover': {
                  borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                },
              }),
              singleValue: (baseStyles) => ({
                ...baseStyles,
                color: isDarkMode ? '#fff' : '#000',
              }),
              placeholder: (baseStyles) => ({
                ...baseStyles,
                color: isDarkMode ? '#9ca3af' : '#6b7280',
              }),
              menu: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: isDarkMode ? '#374151' : '#fff',
              }),
              option: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: state.isFocused ? (isDarkMode ? '#4b5563' : '#f3f4f6') : (isDarkMode ? '#374151' : '#fff'),
                color: isDarkMode ? '#fff' : '#000',
                '&:active': {
                  backgroundColor: isDarkMode ? '#4b5563' : '#f3f4f6',
                },
              }),
            }}
          />
          </div>
          <div className="relative mb-4  flex items-center">
 
            <label className="block text-gray-500 dark:text-gray-400 mr-5 lg:mr-2 md:mr-5">Status</label>
            <Select options={status} value={statusSelected} className="ml-2 w-52" onChange={setStatusSelected} />
          </div>
        </div>
        {/* Date Fields */}
        <div className="flex flex-col lg:flex-row justify-between">
          <div className="relative mb-4 flex items-center">
            <p className="text-gray-500 dark:text-gray-400 mr-4">Start Date:</p>
            <input
              type="date"
              id="start-date"
              required
              min={minDate}
              defaultValue={minDate}
              max={maxDate}
              className="border-b border-gray-300 px-3 pt-2 pb-2 text-gray-500 focus:outline-none focus:border-b-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div className="relative mb-4 flex items-center">
            <p className="text-gray-500 dark:text-gray-400 mr-4">End Date:</p>
            <input type="date" id="end-date" onChange={(e) => e.target.setCustomValidity("")} required
              min={minDate}
              defaultValue={minDate ? minDate : ""}
              max={maxDate}
              className="  border-b border-gray-300 px-3 pt-2 pb-2 text-gray-500 focus:outline-none focus:border-b-blue-500 dark:bg-gray-700  dark:text-gray-100" />
          </div>
        </div>
        <p className="font-thin text-xs -mt-3 mb-2">Note: Date range will be within projects duration</p>
        <div className="relative mb-4 flex items-center">
          <label className="block text-gray-500 dark:text-gray-400 mr-4">Priority</label>
          <Select
            options={priority}
            value={prioritySelected}
            onChange={setPrioritySelected}
            className="ml-2 w-full"
 
          />
        </div>
        {/* Visibility Dropdown */}
        <div className="relative mb-4 flex items-center">
          <label className="block text-gray-500 dark:text-gray-400">Visibility</label>
          <Select
            options={visibilityOptions}
            value={visibilitySelected}
            onChange={setVisibilitySelected}
            className="ml-4 w-52"
 
          />
        </div>
        <button
          type="submit" disabled={isLoading}
          className="mt-5 w-24 bg-gradient-to-r from-blue-400 to-blue-900 text-white p-2 rounded-md transition-colors duration-200"
        >
          {isLoading ? (<FontAwesomeIcon
            icon={faSpinner}
            spin
            className=" text-lg"
          />) : (name === "edit" ? "Save changes" : "Add Task")
          }
        </button>
      </form>
    </div>
  );
};
export default AddTask;