import { faFolder } from "@fortawesome/free-regular-svg-icons";
import {
  faBorderAll,
  faList,
  faTableList,
  faTrash,
  faEllipsisV,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../Header/PageHeader.jsx";
import AddProject from "./AddProject.jsx";
import { GetProjectData } from "../functions/GetProjectData.jsx";

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const [isTabular, setTabular] = useState(false);
  const [isCardView, setCardView] = useState(true);
  //const [deleteProjVisible, setDeleteProjVisible] = useState(false);
  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;
  const currentUserName = JSON.parse(localStorage.getItem("user"))?.name;
  const [reason, setReason] = useState("");
  const [projects, setProjects] = useState([]);
  const [isAddProjectVisible, setAddProjectVisible] = useState(false);
  const [deleteProjVisible, setDeleteProjVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showBudgetColumn, setShowBudgetColumn] = useState(true);
  const [isOptionsOpen, setOptionsOpen] = useState(false);
  const [projectManagers, setProjectManagers] = useState({});
  const [isLoading,setIsLoading]=useState(false);

  useEffect(() => {
  const fetchProjectManagers = async () => {
    let data = {};
    for (let project of projects) {
      const res = await GetProjectData(project.pname);
      data[project.pname] = res;
    }
    setProjectManagers(data);
    setIsLoading(false); // ✅ Move isLoading = false here
  };

  if (projects.length > 0) {
    fetchProjectManagers();
  }
}, [projects]);

  const handleProjectClick = (project) => {
    navigate(`/overview/${project.pname}`, {
      state: { page: "project-dashboard" },
    });
  };

  const handleFilesClick = (project) => {
    navigate(`/overview/${project.pname}`, {
      state: { page: "project-dashboard", isFilesPassed: true },
    });
  };

  // const [openTask,setOpenTask]=useState(false)

  const openAddProject = () => {
    setAddProjectVisible(true);
  };

  const closeAddProject = () => {
    setAddProjectVisible(false);
  };

  useEffect(() => {
    setIsLoading(true);
    axios
      .post("http://localhost:5000/api/fetchProjects")
      .then((res) => {

        setProjects(res.data);
        console.log(res.data);
      })
      .catch((err) => {console.log("error fetching projects", err)
        setIsLoading(false);

      });
  }, []);

  const handleDelete = (project) => {
    setSelectedProject(project);
    setDeleteProjVisible(true);
  };

  const deleteProjectRequest = async (projectID) => {
    try {
      await axios.post(
        `http://localhost:5000/requests/deleteProjectRequest/${projectID}`,
        {
          reason: reason,
          userID: currentUserId,
        }
      );

      toast.success("Project deletion request submitted");
      setDeleteProjVisible(false);
      setSelectedProject(null);
      setReason("");
    } catch (err) {
      console.log("Error sending request to backend", err);
      toast.warn("Request not sent");
    } finally {
      setDeleteProjVisible(false);
      setReason("");
    }
  };

  return (
    <div>
      <PageHeader page="home" openAddProject={openAddProject} />
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 mt-4">
        <div className="flex space-x-2">
          <button
            className={`px-2 border-black dark:border-white border-r text-gray-500 hover:text-blue-400  dark:hover:text-blue-400 hover:bg-blue-100  ${
              isCardView ? "!text-blue-400 bg-blue-200 " : ""
            }`}
            title="Card view"
            onClick={() => {
              setCardView(true);
              setTabular(false);
            }}
          >
            <FontAwesomeIcon icon={faBorderAll} />
          </button>
          <button
            className={`px-2 border-black dark:border-white text-gray-500 hover:text-blue-400 dark:hover:text-blue-400 hover:bg-blue-100   ${
              isTabular ? "!text-blue-400 bg-blue-200 " : ""
            }`}
            title="Tabular"
            onClick={() => {
              setCardView(false);
              setTabular(true);
            }}
          >
            <FontAwesomeIcon icon={faTableList} />
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setOptionsOpen(!isOptionsOpen)}
            className="text-gray-500 hover:text-blue-400 dark:hover:text-blue-400 p-1"
            title="Options"
          >
            <FontAwesomeIcon icon={faEllipsisV} />
          </button>
          {isOptionsOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
              <button
                onClick={() => {
                  setShowBudgetColumn(!showBudgetColumn);
                  setOptionsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                {showBudgetColumn ? "Hide Budget Column" : "Show Budget Column"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border dark:border-gray-800 rounded-md  mt-1">
        {isLoading ? (
                <div className="flex items-center justify-center m-4">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    className="text-gray-600 dark:text-gray-100 text-2xl"
                  />
                </div>
              ) : (<>
        {isCardView && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">

            {isLoading
  ? [...Array(3)].map((_, index) => (
      <div
        key={index}
        className="border m-2 rounded-xl p-4 shadow-md animate-pulse bg-gray-100 dark:bg-gray-700 h-[150px]"
      >
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
        <div className="flex gap-5">
          <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    ))
  : projects.map((project, index) => (

              <div
                key={index}
                onClick={() => handleProjectClick(project)}
                className={`border border-t-4 m-2 rounded-xl p-4 cursor-pointer shadow-md transition-transform hover:scale-105 ${
                  project.pstatus === "In-Progress"
                    ? "border-amber-400"
                    : project.pstatus === "Completed"
                    ? "border-green-500"
                    : "border-red-500"
                }
              }`}
              >
                <p className="text-xl font-semibold mb-2 dark:text-white">
                  {project.pname}
                </p>
                <p className="italic dark:text-white">{project.pdescription}</p>
                <div className="flex gap-5 p-4">
                <Link to={`/project-page/${project.pname}`} className="-mt-1">
                   {" "}
                   <FontAwesomeIcon
                    
                     className=" dark:text-white hover:text-blue-500 dark:hover:text-blue-500"
                     icon={faList}
                     title="Task List"
                     onClick={(e) => {
                       e.stopPropagation();
                     }}
                   />
                 </Link>
                 <FontAwesomeIcon
                   className="dark:text-white hover:text-blue-500 dark:hover:text-blue-500"
                   icon={faFolder}
                   title="Files"
                   onClick={(e) => {
                     e.stopPropagation();
                     handleFilesClick(project);
                   }}
                 />
                  {currentUserId === projectManagers[project.pname] && (
                    <FontAwesomeIcon
                      className="dark:text-white hover:text-blue-500 dark:hover:text-blue-500"
                      icon={faTrash}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project);
                      }}
                    />
                  )}
                </div>
              </div>
            ))}

            {deleteProjVisible && selectedProject && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white dark:bg-gray-800 m-2 p-6 rounded-lg shadow-lg w-96">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Project Deletion Request
        </h2>
        
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <label className="text-gray-700 dark:text-gray-300 font-medium">Project Name:</label>
          <input
            type="text"
            value={selectedProject.pname}
            disabled
            className="w-full p-2 mt-1 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="text-gray-700 dark:text-gray-300 font-medium">Requested By:</label>
          <input
            type="text"
            value={currentUserName}
            disabled
            className="w-full p-2 mt-1 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="text-gray-700 dark:text-gray-300 font-medium">Reason:</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full h-24 p-2 mt-1 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white"
            placeholder="Enter Reason for deletion request"
          />
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            onClick={() => setDeleteProjVisible(false)}
          >
            Cancel
          </button>
          <button
            onClick={() => deleteProjectRequest(selectedProject._id)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  </div>
)}

          </div>
        )} 
        {isTabular && (
          <div className="p-4 overflow-x-auto max-h-[80vh] border-2 dark:border-gray-600 shadow-lg rounded-lg dark:bg-gray-800 dark:text-gray-100">
            {/* Desktop Table */}
            <table className="hidden md:table w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-900 text-xs md:text-sm font-semibold">
                  <th className="border border-gray-300 dark:border-gray-500 p-2">
                    Sl No
                  </th>
                  <th className="border border-gray-300 dark:border-gray-500 p-2">
                    Project
                  </th>
                  <th className="border border-gray-300 dark:border-gray-500 p-2">
                    Start Date
                  </th>
                  <th className="border border-gray-300 dark:border-gray-500 p-2">
                    End Date
                  </th>
                  <th className="border border-gray-300 dark:border-gray-500 p-2">
                    Manager
                  </th>
                  <th className="border border-gray-300 dark:border-gray-500 p-2">
                    Status
                  </th>
                  {showBudgetColumn && (
                    <>
                      <th className="border border-gray-300 dark:border-gray-500 p-2">
                        Issued Budget
                      </th>
                      <th className="border border-gray-300 dark:border-gray-500 p-2">
                        Used Budget
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {projects.length > 0 ? (
                  projects.map((project, index) => (
                    <tr
                      onClick={() => handleProjectClick(project)}
                      key={index}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200"
                    >
                      <td className="border border-gray-300 dark:border-gray-500 p-2 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-500 p-2 text-center">
                        {project.pname}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-500 p-2 text-center">
                        {new Date(project.pstart).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-500 p-2 text-center">
                        {new Date(project.pend).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-500 p-2 text-center">
                        {project.pmanager}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-500 p-2 text-center font-medium">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            project.pstatus === "Completed"
                              ? "text-green-600"
                              : project.pstatus === "In-Progress"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {project.pstatus}
                        </span>
                      </td>
                      {showBudgetColumn && (
                        <>
                          <td className="border border-gray-300 dark:border-gray-500 p-2 text-center">
                            {project.budget}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-500 p-2 text-center">
                            {project.usedBudget}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="border px-4 py-2 text-center dark:text-white"
                      colSpan="6"
                    >
                      No time entries available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <div
                    key={index}
                    onClick={() => handleProjectClick(project)}
                    className="border border-gray-300 dark:border-gray-500 p-4 rounded-lg shadow-sm dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Sl No:</span>
                      <span>{index + 1}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Project:</span>
                      <span>{project.pname}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Start Date:</span>
                      <span>
                        {new Date(project.pstart).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">End Date:</span>
                      <span>
                        {new Date(project.pend).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Manager:</span>
                      <span>{project.pmanager}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Status:</span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          project.pstatus === "Completed"
                            ? "text-green-400"
                            : project.pstatus === "In-Progress"
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {project.pstatus}
                      </span>
                    </div>
                    {showBudgetColumn && (
                      <>
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold">Issued Budget:</span>
                          <span>{project.budget}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Used Budget:</span>
                          <span>{project.usedBudget}</span>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center dark:text-white">
                  No time entries available.
                </p>
              )}
            </div>
          </div>
        )}
      </>
              )}
      </div>
      {isAddProjectVisible && (
        <div className="fixed inset-0 z-50">
          <AddProject visiblity={isAddProjectVisible} close={closeAddProject} />
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
