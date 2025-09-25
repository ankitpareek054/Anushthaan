import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import PageHeader from "../Header/PageHeader.jsx";
import AddMember from "../Componentss/AddMember.jsx";
import Filter from "../Componentss/Filter.jsx";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GetProjectData } from "../functions/GetProjectData.jsx";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TeamManagement = () => {
  const nav = useNavigate();
  const [Team, setTeam] = useState([]);
  const [selectedMemberId, setselectedMemberId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedName, setSelectedName] = useState(null);
  const [isAddMemberVisible, setIsAddMemberVisible] = useState(false);
  const [isopenFilterVisible, setIsopenFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState([]); // Project-specific members
  const { title } = useParams();
  const [refresh, setrefresh] = useState(false);
  const [allMembers, setAllMembers] = useState([]);
  const [projectManagerId, setProjectManagerId] = useState();
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    names: [],
    positions: [],
    projects: [],
  });
  const currentUserId = JSON.parse(localStorage.getItem("user"))._id;
  const [deleteUserID, setDeleteUserID] = useState("");
  const [reason, setReason] = useState("");
  const [deleteUserPopUp, setDeleteUserPopUp] = useState(false);
  const currentUserName = JSON.parse(localStorage.getItem("user")).name;
  const [deleteUserName, setDeleteUserName] = useState(null);
 

  // for projects more than 5
  const [expandedMember, setExpandedMember] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      nav("/user-registration");
    }
    if (title) {
      axios
        .post(`http://localhost:5000/api/getMembers/${title}`)
        .then((res) => {
          setMembers(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching members", err);
          setLoading(false);
        });
    } else {
      axios
        .get("http://localhost:5000/api/getUsers")
        .then((res) => {
          setAllMembers(res.data.users);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching users", err);
          setLoading(false);
        });
    }
  }, [title, refresh]);

  useEffect(() => {
    if (title) {
      GetProjectData(title).then(setProjectManagerId);
    }
  }, [title]);

  const applyFilters = (selectedFilters) => {
    setFilters(selectedFilters);
  };

  const handleDelete = (memberId, memberName) => {
    setselectedMemberId(memberId);
    setSelectedName(memberName);
  };

  const handleDeleteUserRequest = () => {
    try {
      axios.post("http://localhost:5000/requests/create_user_deletion_request", {
        userID: currentUserId,
        targetUserID: deleteUserID,
        reason: reason,
      });
      toast.success("Request for user deletion sent to admin");
    } catch (err) {
      console.log("Error sending request", err);
      toast.warn("Request not sent");
    } finally {
      setDeleteUserID("");
      setReason("");
    }
  };

  const confirmDelete = () => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    if (title) {
      axios
        .delete(`http://localhost:5000/api/deleteMember/${selectedMemberId}`, {
          data: {
            projectName: title,
            removedBy: parsedUser.name,
          },
        })
        .then((res) => {
          if (res.status === 200) setselectedMemberId(null);
          setSelectedName(null);
          setrefresh(!refresh);
          toast.success("Deleted " + selectedName + " successfully");
        })
        .catch((err) => {
          console.log("Failed to delete", err);
          toast.error("Failed to delete " + selectedName);
        });
    } else {
      axios
        .delete(`http://localhost:5000/api/deleteUser/${selectedMemberId}`)
        .then((res) => {
          if (res.status === 200) setselectedMemberId(null);
          setSelectedName(null);
          setrefresh(!refresh);
          toast.success(`Deleted ${selectedName} successfully, { autoClose: 2000 }`);
        })
        .catch((err) => {
          console.log("Failed to delete", err);
        });
    }
  };

  const cancelDelete = () => {
    setselectedMemberId(null);
    setSelectedName(null);
  };

  const openAddMember = () => setIsAddMemberVisible(true);
  const closeAddMember = () => setIsAddMemberVisible(false);
  const openFilter = () => setIsopenFilterVisible(true);
  const closeFilter = () => setIsopenFilterVisible(false);

  const displayedTeam = title ? members : allMembers;

  const filteredTeam = displayedTeam.filter((member) =>
    (filters.names.length === 0 || filters.names.includes(member.name)) &&
    (filters.positions.length === 0 || filters.positions.includes(member.role)) &&
    (filters.projects.length === 0 || (member.projects && member.projects.some(proj => filters.projects.includes(proj))))
  ).filter((member) => member.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const priorityOrder = { "Head": 1, "Project Manager": 2, "Team Leader": 3, "Employee": 4 };
      return priorityOrder[a.role] - priorityOrder[b.role];
    });

  useEffect(() => {
    // Check if filters are applied (i.e., any filter array is non-empty)
    const filtersApplied =
      filters.names.length > 0 ||
      filters.positions.length > 0 ||
      filters.projects.length > 0;
    setIsFilterVisible(filtersApplied);
  }, [filters]);
  // Function to get initials from the name
  const getInitials = (name) => {
    if (!name) return "";
    const words = name.split(" ");
    return words.length > 1
      ? words[0][0].toUpperCase() + words[1][0].toUpperCase()
      : words[0][0].toUpperCase();
  };

  // Function to generate background colors based on the name
  const generateColor = (name) => {
    const colors = ["#4CAF50", "#FF9800", "#9C27B0", "#2196F3", "#795548", "#c92920"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };


  return (
    <>
      <PageHeader
        page="team_management"
        setSearchQuery={setSearchQuery}
        openAddMember={openAddMember}
        openFilter={openFilter}
        projectname={title}
        isFilterVisible={isFilterVisible}
        setIsFilterVisible={setIsFilterVisible}
      />

      <div
        className="w-full p-1 bg-white border-2 dark:border-gray-600 shadow rounded-lg mt-3 overflow-y-auto dark:bg-gray-800 max-h-[84vh]"
        style={{ scrollbarWidth: "none" }}
      >
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-gray-600 dark:text-gray-100 text-2xl"
            />
          </div>
        ) : displayedTeam.length === 0 ? (
          <p className="w-full p-8 text-gray-500 dark:text-gray-100 font-bold text-center text-lg">
            No team members found for this project.
          </p>
        ) : filteredTeam.length > 0 ? (
          filteredTeam.map((member, index) => {
            const firstFive = member.projects?.slice(0, 5) || [];
            const remaining = member.projects?.slice(5) || [];
            const isExpanded = expandedMember === member._id;

            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded shadow-lg m-1 flex flex-col gap-1 p-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                  <div
                className="w-6 h-6 p-4 flex shrink-0 items-center justify-center rounded-full text-white text-sm font-semibold"
                style={{ backgroundColor: generateColor(member.name) }}
              >
                {getInitials(member.name)}
              </div>
              <div>
                    <span className="text-lg font-semibold dark:text-gray-100">
                      {member.name}
                    </span>
                    <p className="text-gray-600 dark:text-gray-300">
                  Position: {member.role}
                </p>
                </div>
                    
                  </div>
                  <div className="justify-end ">
                      {!title && (<FaTrash
                        className="text-gray-500 dark:text-gray-300 cursor-pointer hover:text-red-500"
                        onClick={() => {
                          setDeleteUserPopUp(true);
                          setDeleteUserID(member._id);
                          setDeleteUserName(member.name);
                        }}
                      />)
                      }
                      
                    </div>
                  {currentUserId === projectManagerId &&
                    member._id !== projectManagerId && (
                      <FaTrash
                        className="text-gray-500 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-400 cursor-pointer"
                        onClick={() => handleDelete(member._id, member.name)}
                      />
                    )}
                </div>
                
                {/* FIX: display first 5 projects, then "+N more"/"Hide" */}
                {!title && (
                  <div className="flex flex-wrap gap-2 mt-2 text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Projects:</span>
                    {firstFive.length==0? <span
                        className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
                      >
                        None
                      </span>:""}
                    {firstFive.map((proj, i) => (
                      <span
                        key={i}
                        className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
                      >
                        {proj}
                      </span>
                    ))}
                    {remaining.length > 0 && (
                      <span
                        onClick={() =>
                          setExpandedMember(isExpanded ? null : member._id)
                        }
                        className="cursor-pointer bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-white px-3 py-1 rounded-full text-sm"
                      >
                        {isExpanded
                          ? "Hide"
                          : `+${remaining.length} more`}
                      </span>
                    )}
                  </div>
                )}

                {/* FIX: render the rest when expanded */}
                {isExpanded && remaining.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-4 text-gray-600 dark:text-gray-300">
                    {remaining.map((proj, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
                      >
                        {proj}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="w-full p-8 text-gray-500 dark:text-gray-100 font-bold text-center text-lg">
            No matching results found.
          </p>
        )}
      </div>

      {/* Add Member Modal */}
      {isAddMemberVisible && (
        <AddMember
          visibility={isAddMemberVisible}
          close={closeAddMember}
          projectName={title}
          members={members}
        />
      )}
      {isopenFilterVisible && (
        <Filter
          visibility={isopenFilterVisible}
          close={closeFilter}
          name="team_management"
          context="team_management"
          projectName={title}
          applyFilters={applyFilters}
        />
      )}

      {/* Confirmation Popup */}
      {selectedName && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center  justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-md shadow-lg text-center">
            <p className="text-xl mb-2 font-semibold text-gray-800 dark:text-gray-100 text-start">
              Are you sure?
            </p>
            <p className="mb-2 text-base text-gray-800 dark:text-gray-100">
              Are you sure you want to delete{" "}
              <strong>{selectedName}</strong>?
            </p>
            <div className="border-b mt-8"></div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                className="py-1 px-7 border-2 border-blue-400 text-blue-400 font-semibold rounded-lg"
                onClick={cancelDelete}
              >
                No
              </button>
              <button
                className="py-1 px-7 bg-red-500 font-semibold rounded-lg text-white hover:bg-red-400"
                onClick={confirmDelete}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
     {deleteUserPopUp && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white dark:bg-gray-800 m-2 p-6 rounded-lg shadow-lg w-96">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Deletion Request</h2>
        {/* <button
          className="text-gray-500 dark:text-gray-300"
          onClick={() => setDeleteUserPopUp(false)}
        >
          ✖
        </button> */}
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-gray-700 dark:text-gray-300 font-medium">Current User</label>
          <input
            type="text"
            value={currentUserName}
            disabled
            className="w-full p-2 mt-1 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="text-gray-700 dark:text-gray-300 font-medium">User to be Deleted</label>
          <input
            type="text"
            value={deleteUserName}
            disabled
            className="w-full p-2 mt-1 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="text-gray-700 dark:text-gray-300 font-medium">Reason for Deletion</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white"
            placeholder="Enter reason for deletion request"
          />
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            onClick={() => setDeleteUserPopUp(false)}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleDeleteUserRequest();
              setDeleteUserPopUp(false);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default TeamManagement;
