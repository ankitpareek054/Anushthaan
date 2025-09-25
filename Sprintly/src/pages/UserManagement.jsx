import React, { useState, useEffect } from "react";
import AddUser from "../Componentss/AdminComponents/AddUser.jsx";
import Filter from "../Componentss/AdminComponents/Filter.jsx";
import Search from "../Componentss/AdminComponents/Search.jsx";
import UserTable from "../Componentss/AdminComponents/UserTable.jsx";
import ProjectsModal from "../Componentss/AdminComponents/ProjectsModal.jsx";
import DeleteUserModal from "../Componentss/AdminComponents/DeleteUserModal.jsx";
import EditUserModal from "../Componentss/AdminComponents/EditUserModal.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faFilter,
  faSpinner,
  faPen,
  faTrash,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from "react-toastify";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterExperience, setFilterExperience] = useState("");
  const [filterReportTo, setFilterReportTo] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedUserProjects, setSelectedUserProjects] = useState([]);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null); // Store user ID to delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    experience: "",
    reportTo: "",
    projects: [],
  });
  const [hasFiltersApplied, setHasFiltersApplied] = useState(false);
  const [loading, setLoading] = useState(true); // Loader state

  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("approved"); // or "pending"


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/getUsers"
      );
      setUsers(response.data.users);
      setLoading(false); // Set loader to false once data is fetched
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false); // Ensure the loader is stopped even if the fetch fails
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilter = (role, experience, reportTo, project) => {
    setFilterRole(role);
    setFilterExperience(experience);
    setFilterReportTo(reportTo);
    setFilterProject(project);
    setHasFiltersApplied(
      role !== "" || experience !== "" || reportTo !== "" || project !== ""
    );
  };

  const handleAddUser = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  const handleViewProjects = (projects) => {
    setSelectedUserProjects(projects);
    setIsProjectsModalOpen(true);
  };

  const handleEdit = (user) => {
    setUserToEdit(user);
    setEditData(user);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.post(`http://localhost:5000/api/updateUser`, editData);
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === editData._id ? editData : user))
      );
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const responseDeletion = await axios.delete(`http://localhost:5000/admin/deleteUser/${id}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
      setShowDeleteConfirm(false); // Close modal after deletion
      setUserToDelete(null); // Clear the user ID
      console.log(responseDeletion);
      if (responseDeletion.data.success) {
        toast.success("User Deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const confirmDelete = () => {
    if (userToDelete) {
      handleDelete(userToDelete);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false); // Close the modal without deleting
    setUserToDelete(null); // Clear the user ID
  };

  const confirmDeleteHandler = (userId) => {
    setUserToDelete(userId);
    setShowDeleteConfirm(true); // Show the delete confirmation modal
  };

  const clearAllFilters = () => {
    setFilterRole("");
    setFilterExperience("");
    setFilterReportTo("");
    setFilterProject("");
    setHasFiltersApplied(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterRole === "" || user.role === filterRole) &&
      (filterExperience === "" || user.experience === filterExperience) &&
      (filterReportTo === "" || user.reportTo === filterReportTo) &&
      (filterProject === "" ||
        user.projects.some(
          (project) => project.toLowerCase() === filterProject.toLowerCase()
        ))
  );

  return (
    <div className="p-4 sm:p-6 border border-gray-300 dark:border-gray-600 shadow-xl rounded-xl dark:bg-gray-700 dark:text-gray-100 relative">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
          User Management
        </h1>
        <div className="h-1 w-20 bg-black dark:bg-white rounded-full mt-2"></div>
      </div>

      {/* Loader while data is fetching */}
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-opacity-50 bg-gray-200 dark:bg-gray-800">
          <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-gray-500 dark:text-gray-300" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="w-full sm:flex-1">
          <Search onSearch={handleSearch} />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative inline-block">
            <button
              className={`relative text-gray-500 dark:text-gray-300 p-2 rounded-md
                  hover:bg-blue-100 hover:text-blue-500 dark:hover:text-blue-400
                  ${hasFiltersApplied ? "bg-blue-100 !text-blue-500" : "bg-transparent"}
                `}
              onClick={() => !hasFiltersApplied && setIsFilterModalOpen(true)}
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
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-white px-4 py-2 rounded-md bg-gradient-to-r from-blue-400 to-blue-900 transition-colors duration-200 shadow-md hover:from-blue-500 hover:to-blue-800 flex items-center justify-center w-fit min-w-[160px] max-w-[200px]"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            <span className="font-medium">Add User</span>
          </button>
        </div>
      </div>

      {isFilterModalOpen && (
        <Filter
          onFilter={handleFilter}
          onClose={() => setIsFilterModalOpen(false)}
          onClear={clearAllFilters}
          visibility={isFilterModalOpen}
        />
      )}
      {isAddModalOpen && (
        <AddUser
          onAddUser={handleAddUser}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
      {isProjectsModalOpen && (
        <ProjectsModal
          projects={selectedUserProjects}
          onClose={() => setIsProjectsModalOpen(false)}
        />
      )}
      {isEditModalOpen && (
        <EditUserModal
          editData={editData}
          setEditData={setEditData}
          handleSaveEdit={handleSaveEdit}
          handleClose={() => setIsEditModalOpen(false)}
        />
      )}

      {showDeleteConfirm && (
        <DeleteUserModal
          userToDelete={userToDelete}
          confirmDelete={confirmDelete}
          cancelDelete={cancelDelete}
        />
      )}

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="relative p-4 border rounded-lg shadow bg-white dark:bg-gray-800 dark:text-gray-100"
            >
              <div className="absolute top-2 right-2 space-x-2">
                <button
                  className="text-blue-500 hover:scale-110 transition-transform"
                  onClick={() => handleEdit(user)}
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button
                  onClick={() => confirmDeleteHandler(user._id)} // Pass user._id here
                  className="text-red-600 hover:text-red-700 hover:scale-110 transition-transform"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {user.email}
              </p>
              <div className="flex flex-wrap text-sm mt-2">
                <div className="w-1/2">
                  <strong>Role:</strong> {user.role}
                </div>
                <div className="w-1/2">
                  <strong>Experience:</strong> {user.experience}
                </div>
                <div className="w-full mt-1">
                  <strong>Report To:</strong> {user.reportTo}
                </div>
                <div className="w-full mt-1">
                  <strong>Projects:</strong>
                  {user.projects && user.projects.length > 0 ? (
                    <button
                      onClick={() => handleViewProjects(user.projects)}
                      className="text-blue-500 hover:text-blue-700 ml-1"
                    >
                      View Projects ({user.projects.length})
                    </button>
                  ) : (
                    "NA"
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-sm">No users available</p>
        )}
      </div>

      {/* Window Layout */}
      <div className="hidden md:block">
        <UserTable users={filteredUsers} setUsers={setUsers} />
      </div>
    </div>
  );
};

export default UserManagement;
