import React, { useEffect, useState } from "react";
import axios from "axios";
import { faPen, faTrash, faPlus, faFilter, faTimes, faPaperclip, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AddProject from "../Componentss/AddProject.jsx";
import ProjectFilter from "../Componentss/AdminComponents/ProjectFilter.jsx";
import EditProject from "../Componentss/AdminComponents/EditProject.jsx";
import DeleteProject from "../Componentss/AdminComponents/DeleteProject.jsx";
import { setFilters, clearFilter } from "../Redux/filterslice.jsx"; // for filter 
import AttachmentPopup from "../Componentss/AdminComponents/AttachmentPopUp.jsx"; // for attachment popup
import NamePopUp from "../Componentss/AdminComponents/NamePopUp.jsx";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getFormattedDateforInputedVal } from "../functions/admin/getFormattedDateforInputedVal.jsx";

const AdminProjManagement = () => {
  const headers = [
    "Project Name",
    "Description",
    "Start Date",
    "End Date",
    "Team Members",
    "Manager",
    "Attachments",
    "Status",
    "Actions",
  ];

  const dispatch = useDispatch();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [users, setUsers] = useState({});
  const [showAddProject, setShowAddProject] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false); // to manage Filter visibility
  const [hasFiltersApplied, setHasFiltersApplied] = useState(false); // to track if filters are applied
  const [showEditProject, setShowEditProject] = useState(false); // State to toggle EditProject modal
  const [editProjectId, setEditProjectId] = useState(null); // Store selected project ID
  const [showAttachmentsPopup, setShowAttachmentsPopup] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);// State for Delete Confirmation Popup
  const [projectToDelete, setProjectToDelete] = useState(null); // Stores the project to be deleted
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);// Access dark mode state from Redux
  const [projectAdded, setprojectAdded] = useState(false); //to handle auto-refresh on adding project
  const [dataLoaded, setDataLoaded] = useState(false); // Track when both projects & users are fetched

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const getManagerName = (project, users) => {
    if (!project) return "NA";
    const managerId = project.members ? Object.keys(project.members).find(
      (memberId) => project.members[memberId]?.position === "Project Manager"
    ) : null;

    if (managerId && users[managerId]) {
      return users[managerId].name;
    }

    if (project.projectCreatedBy && users[project.projectCreatedBy]) {
      return users[project.projectCreatedBy].name;
    }

    return "NA";
  };

  const fetchUsersAndProjects = async () => {
    try {
      setLoading(true); // Start loading

      // Fetch users and map userid with name
      const usersRes = await axios.get("http://localhost:5000/api/getUsers");
      const userMap = {};
      usersRes.data.users.forEach(user => {
        userMap[user._id] = user;
      });
      setUsers(userMap);

      // Fetch projects
      const projectsRes = await axios.post("http://localhost:5000/api/fetchProjects");
      setProjects(projectsRes.data);
      setFilteredProjects(projectsRes.data);

      // Mark as loaded only if both requests succeed
      setDataLoaded(true);
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  // Call the function inside useEffect
  useEffect(() => {
    fetchUsersAndProjects();
  }, [projectAdded]); // added projectAdded for auto-refresh on adding project

  //to handle auto-refresh on adding project
  const handleProjectAdded = () => {
    setprojectAdded(prev => !prev); // Toggle state to trigger refresh i.e If prev was false make it true and vice-versa
    setShowAddProject(false); // Close the modal
  };

  const handleEdit = (id) => {
    setEditProjectId(id);
    setShowEditProject(true);
  };

  const handleUpdateProject = async () => {
    await fetchUsersAndProjects(); // Refresh projects after edit
    setShowEditProject(false);
  };

  const handleDelete = async () => {
    if (projectToDelete) {
      try {
        const projectID = projectToDelete;
        await axios.delete(`http://localhost:5000/admin/deleteProjectAdmin/${projectID}`);

        setShowDeleteConfirm(false); // Hide confirmation modal
              toast.success("Project deleted successfully");
        
        await fetchUsersAndProjects(); // Refresh the list of projects after deletion
      } catch (err) {
        console.error("Error deleting project", err);
      }
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredProjects(
      projects.filter((project) => project.pname.toLowerCase().includes(query))
    );
  };

  const applyFilters = (filters) => {
    let filtered = projects;

    if (filters.startDate) {
      filtered = filtered.filter(project => new Date(project.pstart) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(project => new Date(project.pend) <= new Date(filters.endDate));
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter(project => filters.status.includes(project.pstatus));
    }

    setFilteredProjects(filtered);
    dispatch(setFilters(filters)); // Ensuring Redux state is updated
    setHasFiltersApplied(true); // to mark filters as applied
    setIsFilterVisible(false); // Close filter modal
  };

  const clearAllFilters = () => {
    setFilteredProjects(projects); // Restore all projects
    dispatch(clearFilter());
    setHasFiltersApplied(false);
  };

  return (
    <div className="p-4 border-2 dark:border-gray-600 shadow rounded-lg dark:bg-gray-700 dark:text-gray-100">
      <div className="text-2xl font-semibold mb-4">
        Project Management
        <div className="h-1 w-20 bg-black dark:bg-white rounded-full mt-2"></div>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
  <div className="w-full sm:flex-1">
    {/* Search Bar - Expands to take available space */}
    <input
      type="text"
      className="w-full h-[42px] px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
      placeholder="Search by Project Name..."
      value={searchQuery}
      onChange={handleSearch}
    />
  </div>
  <div className="flex gap-2 w-full sm:w-auto">
    {/* Filter Button with X Icon */}
    <div className="relative inline-block">
      <button
        className={`relative text-gray-500 dark:text-gray-300 p-2 rounded-md
          hover:bg-blue-100 hover:text-blue-500 dark:hover:text-blue-400
          ${hasFiltersApplied ? "bg-blue-100 !text-blue-500" : "bg-transparent"}
        `}
        onClick={() => !hasFiltersApplied && setIsFilterVisible(true)}
      >
        <span className="p-1">
          <FontAwesomeIcon icon={faFilter} />
        </span>
        <span className="hidden md:inline lg:inline">Filter</span>

        {hasFiltersApplied && (
          <button
            className="absolute -top-1 -right-2 bg-gray-400 text-white p-0.5 rounded-3xl text-xs
              hover:bg-gray-500 h-5 w-5 flex items-center justify-center z-10"
            onClick={(e) => {
              e.stopPropagation();
              clearAllFilters();
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </button>
    </div>
    {/* Create Project Button */}
    <button
      className="text-white px-4 py-2 rounded-md bg-gradient-to-r from-blue-400 to-blue-900 transition-colors duration-200 shadow-md hover:from-blue-500 hover:to-blue-800 flex items-center justify-center w-fit min-w-[160px] max-w-[200px]"
      onClick={() => setShowAddProject(true)}
    >
      <FontAwesomeIcon icon={faPlus} className="mr-2" />
      <span className="font-medium">Create Project</span>
    </button>
  </div>
</div>



      {/* Show Filter Component when isFilterVisible is true */}
      {isFilterVisible && (
        <ProjectFilter
          visibility={isFilterVisible}
          close={() => {
            setIsFilterVisible(false); //Closing filter when clicking "X" inside ProjectFilter
          }}
          applyFilters={(filters) => {
            applyFilters(filters);
            setIsFilterVisible(false); //Ensuring it closes after applying filters
          }}
          clearFilters={clearAllFilters}
        />
      )}

      {!dataLoaded ? (
        <div className="flex items-center justify-center py-10">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-gray-600 dark:text-gray-100 text-3xl"
          />
        </div>
      ) : (
        <>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse border border-gray-300 dark:border-gray-500">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-800 text-xs md:text-sm">
                  {headers.map((header, index) => (
                    <th key={index} className="border border-gray-300 dark:border-gray-500 p-2 text-left">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project._id} className="odd:bg-white even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-600 text-xs md:text-sm">
                      <td className="border border-gray-300 dark:border-gray-500 p-2">{project.pname}</td>
                      <td className="border border-gray-300 dark:border-gray-500 p-2">{project.pdescription}</td>
                      <td className="border border-gray-300 dark:border-gray-500 p-2 text-nowrap">{getFormattedDateforInputedVal(project.pstart?.slice(0, 10))}</td>
                      <td className="border border-gray-300 dark:border-gray-500 p-2 text-nowrap">{getFormattedDateforInputedVal(project.pend?.slice(0, 10))}</td>
                      <td className="border border-gray-300 dark:border-gray-500 p-2">
                        <span className="block md:inline"><NamePopUp
                          title="Team Members"
                          members={Object.keys(project.members || {})
                            .filter(memberId => project.members[memberId]?.position !== "Project Manager") // Exclude Manager
                            .map(memberId => users[memberId]?.name || "Unknown")}
                        /></span>
                      </td>
                      <td className="border border-gray-300 dark:border-gray-500 p-2"><NamePopUp
                        title="Project Manager"
                        members={getManagerName(project, users) ? [getManagerName(project, users)] : []}
                      /></td>
                      <td className="border border-gray-300 dark:border-gray-500 p-2">
                        {Array.isArray(project.pAttachments) && project.pAttachments.length > 0 ? (
                          <button
                            className="text-sm text-gray-500 font-bold hover:text-blue-500 dark:text-gray-200 cursor-pointer flex items-center gap-1"
                            onClick={() => {
                              setSelectedAttachments(project.pAttachments);
                              setShowAttachmentsPopup(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faPaperclip} />
                            Attachments
                          </button>
                        ) : (
                          "NA"
                        )}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-500 p-2 font-semibold text-center">
                        <span
                          className={`px-2 py-1 rounded-md text-xs whitespace-nowrap ${project.pstatus === "In-Progress" ? "bg-yellow-200 text-yellow-800" :
                            project.pstatus === "Completed" ? "bg-green-200 text-green-800" :
                              "bg-gray-200 text-gray-800"
                            }`}
                        >
                          {project.pstatus || "NA"}
                        </span>
                      </td>
                      <td className="border border-gray-300 dark:border-gray-500 p-2">
                        <div className="flex items-center justify-center gap-2 h-full">
                          <button
                            className="text-blue-500 px-2"
                            onClick={() => handleEdit(project._id)}
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setProjectToDelete(project._id);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headers.length} className="text-center p-4">
                      No projects available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile-Friendly Card View */}
          <div className="md:hidden space-y-4">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div key={project._id} className="p-4 border rounded-lg shadow bg-white dark:bg-gray-800 dark:text-gray-100">
                  {/* Project Name with Edit/Delete Buttons */}
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">{project.pname}</p>
                    <div className="flex items-center gap-2">
                      <button className="text-blue-500" onClick={() => handleEdit(project._id)}>
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button
                        onClick={() => {
                          setProjectToDelete(project._id);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{project.pdescription}</p>
                  <div className="flex flex-wrap text-sm mt-2 space-y-1">
                    <div className="flex w-full flex-wrap">
                      <div className="w-1/2 max-[320px]:w-full"><strong>Start:</strong> {getFormattedDateforInputedVal(project.pstart?.slice(0, 10))}</div>
                      <div className="w-1/2 ml-auto max-[320px]:mt-1 max-[320px]:w-full"><strong>End:</strong> {getFormattedDateforInputedVal(project.pend?.slice(0, 10))}</div>
                    </div>
                    <div className="w-full"><strong>Team:</strong>
                      <span className="ml-1">
                        <NamePopUp
                          title="Team Members"
                          members={Object.keys(project.members || {})
                            .filter(memberId => project.members[memberId]?.position !== "Project Manager") // Exclude Manager
                            .map(memberId => users[memberId]?.name || "Unknown")}
                        />
                      </span>
                    </div>
                    <div className="w-full"><strong>Manager:</strong>
                      <NamePopUp
                        title="Project Manager"
                        members={getManagerName(project, users) ? [getManagerName(project, users)] : []}
                      />
                    </div>
                    <div className="w-full"><strong>Attachments: </strong>
                      {Array.isArray(project.pAttachments) && project.pAttachments.length > 0 ? (
                        <button
                          className="text-gray-500 hover:text-blue-500 dark:text-gray-200 cursor-pointer"
                          onClick={() => {
                            setSelectedAttachments(project.pAttachments);
                            setShowAttachmentsPopup(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faPaperclip} />
                        </button>
                      ) : (
                        <span className="text-gray-400">NA</span>
                      )}
                    </div>
                    <div className="w-full">
                      <strong>Status:</strong>
                      <span className={`ml-1 px-2 py-1 rounded-md text-xs ${project.pstatus === "In-Progress" ? "bg-yellow-200 text-yellow-800" :
                        project.pstatus === "Completed" ? "bg-green-200 text-green-800" :
                          "bg-gray-200 text-gray-800"
                        }`}>
                        {project.pstatus || "NA"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : <p className="text-center text-sm">No projects available</p>}
          </div>

          {/* DeleteProject and AttachmentPopUp Modals */}
          {showDeleteConfirm && (
            <DeleteProject
              projectName={projects.find((p) => p._id === projectToDelete)?.pname}
              onDelete={handleDelete}
              onCancel={() => setShowDeleteConfirm(false)}
            />
          )}
          {showAttachmentsPopup && (
            console.log(selectedAttachments),
            <AttachmentPopup
              attachments={selectedAttachments}
              close={() => setShowAttachmentsPopup(false)}
            />
          )}

          {/* AddProject, EditProject & Filter Modals */}
          {showAddProject &&
            <AddProject
              visiblity={showAddProject}
              close={() => setShowAddProject(false)}
              onProjectAdded={handleProjectAdded} //passing function to AddProject for handling auto-refresh on adding project
            />}
          {showEditProject && (
            <EditProject
              visibility={showEditProject}
              close={() => setShowEditProject(false)}
              projectId={editProjectId}
              refreshProjects={fetchUsersAndProjects} // Pass function to refresh project list
            />
          )}
          {showFilter && (
            <ProjectFilter
              visibility={showFilter}
              close={() => setShowFilter(false)}
              applyFilters={setFilteredProjects}
              clearAllFilters={() => setFilteredProjects(projects)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AdminProjManagement;