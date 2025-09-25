import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPen, faTrash, faSearch } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import EditUserModal from "./EditUserModal.jsx";
import DeleteUserModal from "./DeleteUserModal.jsx";
import ProjectsModal from "./ProjectsModal.jsx";
import { toast } from "react-toastify";

const UserTable = ({ users, setUsers }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    role: "",
    experience: "",
    reportTo: "",
    projects: [],
  });
  const [userToDelete, setUserToDelete] = useState(null);
  const [showAllProjects, setShowAllProjects] = useState(null);

  const headers = [
    "Name",
    "Email",
    "Role",
    "Experience",
    "Report To",
    "Projects",
    "Actions",
  ];

  const handleEdit = (user) => {
    setEditData({ ...user });
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/api/updateUser`, editData);
      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user._id === editData._id ? response.data.user : user))
        );
        setIsEditModalOpen(false);
        toast.success("User updated successfully!");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.warn("Failed to update user. Please try again.");
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/admin/deleteUser/${userToDelete}`);
      if (response.status === 200) {
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userToDelete));
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        toast.success("User deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.warn("Failed to delete user. Please try again.");
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  return (
    <div className="overflow-x-auto">
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
          {users.length > 0 ? (
            users.map((user, userIndex) => (
              <tr
                key={user._id}
                className={`odd:bg-white even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-600 text-xs md:text-sm ${userIndex === users.length - 1 ? '' : 'border-b border-gray-300 dark:border-gray-600'
                  }`}
              >
                <td className="border border-gray-300 dark:border-gray-500 p-2">{user.name}</td>
                <td className="border border-gray-300 dark:border-gray-500 p-2">{user.email}</td>
                <td className="border border-gray-300 dark:border-gray-500 p-2">{user.role}</td>
                <td className="border border-gray-300 dark:border-gray-500 p-2">{user.experience}</td>
                <td className="border border-gray-300 dark:border-gray-500 p-2">{user.reportTo}</td>
                <td className="border border-gray-300 dark:border-gray-500 p-2">
                  <div className="flex flex-wrap gap-1">
                    {user.projects.slice(0, 2).map((project, index) => (
                      <span key={index} className="inline-block py-1 px-2 rounded-md text-gray-700 dark:text-gray-300 text-xs">
                        {project}
                      </span>
                    ))}
                    {user.projects.length > 2 && (
                      <button
                        onClick={() => setShowAllProjects(user.projects)}
                        className="inline-block py-1 px-2 rounded-md bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        +{user.projects.length - 2} more
                      </button>
                    )}
                  </div>
                </td>
                <td className="border border-gray-300 dark:border-gray-500 p-2">
                  <div className="flex items-center justify-center gap-2 h-full">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-500 hover:text-blue-600 px-2"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="text-center p-4 text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-300 dark:text-gray-600 h-12 w-12 mb-4" />
                  <p className="text-lg">No users found</p>
                  <p className="text-sm mt-1">Try adjusting your search query</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {isDeleteModalOpen && userToDelete !== null && (
        <DeleteUserModal userToDelete={userToDelete} confirmDelete={confirmDelete} cancelDelete={cancelDelete} />
      )}

      {showAllProjects !== null && (
        <ProjectsModal projects={showAllProjects} onClose={() => setShowAllProjects(null)} />
      )}

      {isEditModalOpen && (
        <EditUserModal
          editData={editData}
          setEditData={setEditData}
          handleSaveEdit={handleSaveEdit}
          handleClose={() => setIsEditModalOpen(false)}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default UserTable;