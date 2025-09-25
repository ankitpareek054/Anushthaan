/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import {
  FaClipboardList,
  FaUserShield,
  FaProjectDiagram,
  FaUsers,
  FaCheck,
  FaTimes,
  FaSort,
  FaUserPlus,
} from "react-icons/fa";
import {
  faSpinner,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const AdminRequestManagement = () => {
  const [activeTab, setActiveTab] = useState("All Requests");
  const [showModal, setShowModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [requestHistory, setRequestHistory] = useState([]);
  const [sortOrder, setSortOrder] = useState(null);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode); // Get dark mode state
  const [isProcessing, setIsProcessing] = useState(false);

  // Apply dark mode to html tag
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const tabs = [
    { name: "All Requests", icon: <FaClipboardList /> },
    { name: "Admin Requests", icon: <FaUserShield /> },
    { name: "Project Requests", icon: <FaProjectDiagram /> },
    { name: "User Requests", icon: <FaUsers /> },
    { name: "Signup Requests", icon: <FaUserPlus /> },
  ];

  const fetchRequests = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/requests/get_all_requests"
      );
      console.log("hi in fetchreq", response.data);
      if (response.status === 200) {
        setRequests(response.data?.data || []); // Ensure the correct data format
      } else {
        setError("Error fetching requests.");
      }
    } catch (err) {
      setError("Error fetching requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(); // Fetch data on component mount
  }, []);

  const filteredRequests = requests
    .filter((request) => {
      if (activeTab === "Admin Requests")
        return request.reqType === "ADMIN_ACCESS";
      if (activeTab === "Project Requests")
        return request.reqType === "PROJECT_DELETION";
      if (activeTab === "User Requests")
        return (
          request.reqType === "USER_ADDITION" ||
          request.reqType === "USER_DELETION"
        );
      if (activeTab === "Signup Requests")
        return request.reqType === "SIGNUP_REQUEST";

      return true;
    })
    .filter((request) => {
      const projectName = request.projectName?.pname
        ? String(request.projectName.pname).toLowerCase()
        : "";
      const userName = request.userDetails?.name
        ? String(request.userDetails.name).toLowerCase()
        : "";
      const reason = request.reason ? String(request.reason).toLowerCase() : "";
      const reqType = request.reqType
        ? String(request.reqType).toLowerCase()
        : "";

      return (
        projectName.includes(searchTerm.toLowerCase()) ||
        userName.includes(searchTerm.toLowerCase()) ||
        reason.includes(searchTerm.toLowerCase()) ||
        reqType.includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

  const getAdminId = () => {
    try {
      const adminData = localStorage.getItem("user");
      if (!adminData) throw new Error("No user found in localStorage.");
      const parsedData = JSON.parse(adminData);
      return parsedData?._id || null;
    } catch (error) {
      console.error("Error parsing admin data:", error);
      return null;
    }
  };

  const handleOpenModal = (action, request) => {
    setSelectedRequest(request);
    setSelectedAction(action);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAction("");
    setSelectedRequest(null);
  };

  const handleConfirmAction = async () => {
    const adminId = getAdminId();

    if (!selectedRequest?._id || !adminId) {
      alert("Invalid request or missing admin ID.");
      return;
    }

    const decision = selectedAction === "APPROVED" ? "APPROVED" : "REJECTED";

    const requestData = {
      requestID: selectedRequest._id,
      decision,
      adminID: adminId,
    };

    try {
      // Determine the endpoint based on reqType
      let endpoint;

      switch (selectedRequest.reqType) {
        case "ADMIN_ACCESS":
          endpoint = "adminAccessRequestHandler";
          break;
        case "USER_DELETION":
          endpoint = "deleteUserRequestHandler";
          break;
        case "PROJECT_DELETION":
          endpoint = "deleteProjectRequestHandler";
          break;
        case "SIGNUP_REQUEST":
          endpoint = "signupRequestHandler";
          break;
        default:
          alert(`Unknown request type: ${selectedRequest.reqType}`);
          // handleCloseModal();
          return;
      }

      console.log("Sending request to:", endpoint);
      console.log("Request Data:", requestData);

      await axios.post(
        `http://localhost:5000/requests/${endpoint}`,
        requestData
      );

      // alert(`Request has been ${decision.toLowerCase()}.`);
      fetchRequests(); // Refresh the request list
      handleCloseModal();
    } catch (error) {
      console.error("Error processing request:", error);
      alert(
        `Error processing request: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  return (
    <>
      <div className="p-4 border-2 dark:border-gray-600 shadow rounded-lg dark:bg-gray-700 dark:text-gray-100">
        <div className="p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl font-semibold mb-4 dark:text-white">
            Request Management
          </h1>
          <div className="h-1 w-20 bg-black dark:bg-white rounded-full mt-2"></div>
        </div>

        <div className="flex items-center justify-between w-full space-x-3 relative">
          {/* Search Bar */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search requests..."
              className="w-full h-[42px] pl-10 pr-10 py-2 rounded-lg bg-gray-100 text-gray-700 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-600" />
          </div>

          {/* Sort By Button */}
          <div className="relative flex-shrink-0">
            <button
              className={`relative flex items-center space-x-2 h-[42px] px-3 text-gray-500 dark:text-gray-300 rounded-md border border-gray-300 hover:bg-blue-100 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 ${
                sortOrder ? "bg-blue-100 !text-blue-500 border-blue-400" : ""
              }`}
              onClick={() => {
                setShowSortOptions(!showSortOptions);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 6h18M3 12h12m-12 6h6"
                />
              </svg>
              <span className="hidden md:inline">Sort by</span>

              {/* Close Icon inside button */}
              {sortOrder && (
                <span
                  className="absolute -top-2 -right-2 bg-gray-400 text-white rounded-full p-1 shadow-sm hover:bg-gray-500 cursor-pointer z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSortOrder(null);
                    setShowSortOptions(false);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 11-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showSortOptions && (
              <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg w-72 z-50">
                <div className="flex flex-row justify-between p-2">
                  <h4 className="text-gray-400 dark:text-gray-300">Sort By</h4>
                  <span
                    onClick={() => setShowSortOptions(false)}
                    className="hover:text-blue-500 cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 11-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
                <div className="my-1 bg-gray-400 dark:bg-gray-700 h-[1px]"></div>
                <button
                  onClick={() => {
                    setSortOrder("latest");
                    setShowSortOptions(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-500"
                >
                  Sort by Latest Date
                </button>
                <button
                  onClick={() => {
                    setSortOrder("oldest");
                    setShowSortOptions(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-500"
                >
                  Sort by Oldest Date
                </button>
              </div>
            )}
          </div>
        </div>

    {/* Tabs */}
    <div className="left flex flex-wrap justify-start dark:bg-gray-700 bg-gray-100 mt-3 overflow-hidden w-full">
      <div className="flex border-b border-gray-300 dark:border-gray-600 w-full overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center px-4 py-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.name
                ? "bg-blue-100 dark:bg-gray-600 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <span className="mr-2">{tab.icon}</span> {tab.name}
          </button>
        ))}
      </div>
    </div>

    {/* Loader */}
    {loading ? (
      <div className="flex flex-col items-center justify-center h-60">
        <FontAwesomeIcon icon={faSpinner} spin className="text-gray-600 dark:text-gray-100 text-3xl" />
        <p className="mt-4 text-gray-600">Loading data...</p>
      </div>
    ) : (
      <>
        {/* Desktop Table */}
        <div className="overflow-x-auto mt-4 hidden sm:block max-h-[calc(100vh-4rem)] w-full">
          {/* Your existing table code remains unchanged here */}
          <div className="overflow-x-auto mt-4 flex-1 max-h-[calc(100vh-4rem)] w-full scrollable-table">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-60">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="text-gray-600 dark:text-gray-100 text-3xl"
              />
              <p className="mt-4 text-gray-600">Loading data...</p>
            </div>
          )  : activeTab === "Signup Requests" ? (
            // Signup Requests Table
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
              <thead className="top-0 bg-gray-200 dark:bg-gray-800 border-b text-gray-800 dark:text-gray-300 z-10">
                <tr>
                  <th className="py-3 px-4 border dark:border-gray-500 text-left">Date</th>
                  <th className="py-3 px-4 border dark:border-gray-500 text-left">User Name</th>
                  <th className="py-3 px-4 border dark:border-gray-500 text-left">Email</th>
                  <th className="py-3 px-4 border dark:border-gray-500 text-left">Joining Date</th>
                  <th className="py-3 px-4 border dark:border-gray-500 text-left">Request Type</th>
                  <th className="py-3 px-4 border dark:border-gray-500 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request, index) => (
                    <tr
                      key={index}
                      className="odd:bg-white even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-600 text-xs md:text-sm"
                    >
                      <td className="py-3 px-4 border dark:border-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      {activeTab === "Project Requests" && (
                        <td className="py-3 px-4 border dark:border-gray-500">
                          {request.projectName?.pname || "N/A"}
                        </td>
                      )}
                      <td className="py-3 px-4 border dark:border-gray-500">
  {request.reqType === "SIGNUP_REQUEST"
    ? request.pendingUserDetails?.name || "New Signup"
    : request.userDetails?.name || "N/A"}
</td>
<td className="py-3 px-4 border dark:border-gray-500">
  {request.reqType === "SIGNUP_REQUEST"
    ? request.pendingUserDetails?.email || "N/A"
    : request.userDetails?.email || "N/A"}
</td>
<td className="py-3 px-4 border dark:border-gray-500">
  {request.reqType === "SIGNUP_REQUEST"
    ? request.pendingUserDetails?.dateOfJoining
      ? new Date(request.pendingUserDetails.dateOfJoining).toLocaleDateString()
      : "N/A"
    : request.userDetails?.dateOfJoining
      ? new Date(request.userDetails.dateOfJoining).toLocaleDateString()
      : "N/A"}
</td>


                      <td className="py-3 px-4 border dark:border-gray-500">{request.reqType}</td>
                      <td className="py-3 px-4 border dark:border-gray-500 text-center flex justify-center items-center space-x-2 ">
                        <button
                          onClick={() => handleOpenModal("APPROVED", request)}
                          className="text-green-500 text-xl"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleOpenModal("REJECTED", request)}
                          className="text-red-500 text-xl"
                        >
                          <FaTimes />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            // Other Requests Table
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
              <thead className="top-0 bg-gray- dark:bg-gray-800 border-b text-gray-800 dark:text-gray-300 z-10">
                <tr>
                  <th className="py-3 px-4 border dark:border-gray-500 text-left">Date</th>
                  {activeTab === "Project Requests" && (
                    <th className="py-3 px-4 border dark:border-gray-500">Project Name</th>
                  )}
                  <th className="py-3 px-4 border dark:border-gray-500">Requested By</th>
                  <th className="py-3 px-4 border dark:border-gray-500 ">Reason</th>
                  {activeTab !== "All Requests" && (
                    <th className="py-3 px-4 border dark:border-gray-500 text-left">Role</th>
                  )}
                  <th className="py-3 px-4 border dark:border-gray-500 text-left">Request Type</th>
                  {activeTab === "User Requests" && (
                    <th className="py-3 px-4 border dark:border-gray-500 text-left">
                      Requested For
                    </th>
                  )}
                  <th className="py-3 px-4 border dark:border-gray-500 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request, index) => (
                    <tr
                      key={index}
                      className="odd:bg-white even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-600 text-xs md:text-sm"
                    >
                      <td className="py-3 px-4 border dark:border-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      {activeTab === "Project Requests" && (
                        <td className="py-3 px-4 border dark:border-gray-500">
                          {request.projectName?.pname || "N/A"}
                        </td>
                      )}
                     <td className="py-3 px-4 border dark:border-gray-500">
  {request.reqType === "SIGNUP_REQUEST"
    ? request.pendingUserDetails?.name || "N/A"
    : request.userDetails?.name || "N/A"}
</td>

                      <td className="py-3 px-4 border dark:border-gray-500">{request.reason}</td>
                      {activeTab !== "All Requests" && (
                        <td className="py-3 px-4 border dark:border-gray-500">
                          {request.userDetails?.role || "N/A"}
                        </td>
                      )}
                      <td className="py-3 px-4 border dark:border-gray-500">{request.reqType}</td>
                      {activeTab === "User Requests" && (
                        <td className="py-3 px-4 border dark:border-gray-500">
                          {request.targetUserID
                            ? request.targetUserID.name
                            : "N/A"}
                        </td>
                      )}
                      <td className="py-3 px-4 text-center flex justify-center items-center space-x-2 border dark:border-gray-500">
                        <button
                          onClick={() => handleOpenModal("APPROVED", request)}
                          className="text-green-500 text-xl"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleOpenModal("REJECTED", request)}
                          className="text-red-500 text-xl"
                        >
                          <FaTimes />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
          {/* ... */}
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden mt-4 space-y-4">
  {filteredRequests.length === 0 ? (
    <p className="text-center text-gray-500">No data available</p>
  ) : (
    filteredRequests.map((request, index) => (
      <div
        key={index}
        className="relative p-4 border rounded-lg shadow bg-white dark:bg-gray-800 dark:text-gray-100"
      >
        {/* Top-right Action Buttons */}
        <div className="absolute top-2 right-2 space-x-2">
          <button
            onClick={() => handleOpenModal("APPROVED", request)}
            className="text-green-500 hover:scale-110 transition-transform text-lg"
          >
            <FaCheck />
          </button>
          <button
            onClick={() => handleOpenModal("REJECTED", request)}
            className="text-red-500 hover:scale-110 transition-transform text-lg"
          >
            <FaTimes />
          </button>
        </div>

        {/* Request Info */}
        <p className="text-xs text-gray-400">
          {new Date(request.createdAt).toLocaleDateString()}
        </p>

        <p className="text-lg font-semibold mt-1">
          {activeTab === "Signup Requests"
            ? request.pendingUserDetails?.name || "N/A"
            : request.userDetails?.name || "N/A"}
        </p>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          {activeTab === "Signup Requests"
            ? request.pendingUserDetails?.email || "N/A"
            : request.reason}
        </p>

        <div className="flex flex-wrap text-sm mt-2">
          <div className="w-1/2">
            <strong>Type:</strong> {request.reqType}
          </div>
          {activeTab === "Signup Requests" && (
            <div className="w-1/2">
              <strong>Joining:</strong>{" "}
              {request.pendingUserDetails?.dateOfJoining
                ? new Date(request.pendingUserDetails.dateOfJoining).toLocaleDateString()
                : "N/A"}
            </div>
          )}
        </div>
      </div>
    ))
  )}
</div>

        {/* <div className="block sm:hidden mt-4 space-y-4">
          {filteredRequests.length === 0 ? (
            <p className="text-center text-gray-500">No data available</p>
          ) : (
            filteredRequests.map((request, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-300 dark:border-gray-600"
              >
                <p className="text-xs text-gray-400">{new Date(request.createdAt).toLocaleDateString()}</p>
                <p className="font-semibold text-gray-800 dark:text-gray-100 mt-1">
                  {activeTab === "Signup Requests"
                    ? request.pendingUserDetails?.name || "N/A"
                    : request.userDetails?.name || "N/A"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {activeTab === "Signup Requests"
                    ? request.pendingUserDetails?.email || "N/A"
                    : request.reason}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Type: <span className="font-medium">{request.reqType}</span>
                </p>
                {activeTab === "Signup Requests" && (
                  <p className="text-sm text-gray-500">
                    Joining:{" "}
                    {request.pendingUserDetails?.dateOfJoining
                      ? new Date(request.pendingUserDetails.dateOfJoining).toLocaleDateString()
                      : "N/A"}
                  </p>
                )}
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => handleOpenModal("APPROVED", request)}
                    className="text-green-500 text-xl"
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={() => handleOpenModal("REJECTED", request)}
                    className="text-red-500 text-xl"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ))
          )}
        </div> */}
      </>
    )}
  </div>

  {/* Modal remains the same */}
  {showModal && (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-[90%] max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Confirm Action</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Are you sure you want to{" "}
          <span className="font-bold">
            {selectedAction === "APPROVED" ? "approve" : "reject"}
          </span>{" "}
          this request?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              setIsProcessing(true);
              await handleConfirmAction();

              const statusText = selectedAction === "APPROVED" ? "Accepted" : "Rejected";
              const type =
                selectedRequest?.reqType
                  ?.replace(/_/g, " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (c) => c.toUpperCase()) || "Request";

              if (selectedAction === "APPROVED") {
                toast.success(`${type} ${statusText}`);
              } else {
                toast.error(`${type} ${statusText}`);
              }

              setIsProcessing(false);
            }}
            className={`px-4 py-2 rounded text-white flex items-center justify-center ${
              selectedAction === "APPROVED" ? "bg-green-600 hover:bg-green-800" : "bg-red-600 hover:bg-red-800"
            }`}
            disabled={isProcessing}
          >
            <div className="w-[80px] flex justify-center">
              {isProcessing ? (
                <FontAwesomeIcon icon={faSpinner} spin className="text-white text-base" />
              ) : (
                "Confirm"
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  )}
</>

    // <>
    //   {/* <div className="min-h-screen bg-customBg dark:bg-gray-900 text-black dark:text-white transition-colors duration-300 font-sans"> */}
    //   <div className="p-4 border-2 dark:border-gray-600 shadow rounded-lg dark:bg-gray-700 dark:text-gray-100">
    //     <div className="p-4 sm:p-6 lg:p-8">
    //       <h1 className="text-2xl font-semibold mb-4 dark:text-white">
    //         Request Management
    //       </h1>
    //       <div className="h-1 w-20 bg-black dark:bg-white rounded-full mt-2"></div>
    //     </div>

        // <div className="flex items-center justify-between w-full space-x-3 relative">
        //   {/* Search Bar */}
        //   <div className="relative flex-grow">
        //     <input
        //       type="text"
        //       placeholder="Search requests..."
        //       className="w-full h-[42px] pl-10 pr-10 py-2 rounded-lg bg-gray-100 text-gray-700 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
        //       value={searchTerm}
        //       onChange={(e) => setSearchTerm(e.target.value)}
        //     />
        //     <FaSearch className="absolute left-3 top-3 text-gray-600" />
        //   </div>

        //   {/* Sort By Button */}
        //   <div className="relative flex-shrink-0">
        //     <button
        //       className={`relative flex items-center space-x-2 h-[42px] px-3 text-gray-500 dark:text-gray-300 rounded-md border border-gray-300 hover:bg-blue-100 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 ${
        //         sortOrder ? "bg-blue-100 !text-blue-500 border-blue-400" : ""
        //       }`}
        //       onClick={() => {
        //         setShowSortOptions(!showSortOptions);
        //       }}
        //     >
        //       <svg
        //         xmlns="http://www.w3.org/2000/svg"
        //         className="h-5 w-5"
        //         fill="none"
        //         viewBox="0 0 24 24"
        //         stroke="currentColor"
        //       >
        //         <path
        //           strokeLinecap="round"
        //           strokeLinejoin="round"
        //           strokeWidth={2}
        //           d="M3 6h18M3 12h12m-12 6h6"
        //         />
        //       </svg>
        //       <span className="hidden md:inline">Sort by</span>

        //       {/* Close Icon inside button */}
        //       {sortOrder && (
        //         <span
        //           className="absolute -top-2 -right-2 bg-gray-400 text-white rounded-full p-1 shadow-sm hover:bg-gray-500 cursor-pointer z-10"
        //           onClick={(e) => {
        //             e.stopPropagation();
        //             setSortOrder(null);
        //             setShowSortOptions(false);
        //           }}
        //         >
        //           <svg
        //             xmlns="http://www.w3.org/2000/svg"
        //             className="h-3 w-3"
        //             viewBox="0 0 20 20"
        //             fill="currentColor"
        //           >
        //             <path
        //               fillRule="evenodd"
        //               d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 11-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
        //               clipRule="evenodd"
        //             />
        //           </svg>
        //         </span>
        //       )}
        //     </button>

        //     {/* Dropdown */}
        //     {showSortOptions && (
        //       <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg w-72 z-50">
        //         <div className="flex flex-row justify-between p-2">
        //           <h4 className="text-gray-400 dark:text-gray-300">Sort By</h4>
        //           <span
        //             onClick={() => setShowSortOptions(false)}
        //             className="hover:text-blue-500 cursor-pointer"
        //           >
        //             <svg
        //               xmlns="http://www.w3.org/2000/svg"
        //               className="h-4 w-4"
        //               viewBox="0 0 20 20"
        //               fill="currentColor"
        //             >
        //               <path
        //                 fillRule="evenodd"
        //                 d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 11-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
        //                 clipRule="evenodd"
        //               />
        //             </svg>
        //           </span>
        //         </div>
        //         <div className="my-1 bg-gray-400 dark:bg-gray-700 h-[1px]"></div>
        //         <button
        //           onClick={() => {
        //             setSortOrder("latest");
        //             setShowSortOptions(false);
        //           }}
        //           className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-500"
        //         >
        //           Sort by Latest Date
        //         </button>
        //         <button
        //           onClick={() => {
        //             setSortOrder("oldest");
        //             setShowSortOptions(false);
        //           }}
        //           className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-500"
        //         >
        //           Sort by Oldest Date
        //         </button>
        //       </div>
        //     )}
        //   </div>
        // </div>

    //     <div className="left flex flex-wrap justify-start dark:bg-gray-700 bg-gray-100 mt-3 overflow-hidden w-full sm:w-auto ml-0">
    //       <div className="flex border-b border-gray-300 dark:border-gray-600">
    //         {tabs.map((tab) => (
    //           <button
    //             key={tab.name}
    //             onClick={() => setActiveTab(tab.name)}
    //             className={`flex items-center px-4 py-2 text-sm font-semibold transition-all duration-200 ${
    //               activeTab === tab.name
    //                 ? "bg-blue-100 dark:bg-gray-600 text-blue-600 dark:text-blue-400"
    //                 : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    //             }`}
    //           >
    //             <span className="mr-2">{tab.icon}</span> {tab.name}
    //           </button>
    //         ))}
    //       </div>
    //     </div>

    //     <div className="overflow-x-auto mt-4 flex-1 max-h-[calc(100vh-4rem)] w-full scrollable-table">
    //       {loading ? (
    //         <div className="flex flex-col items-center justify-center h-60">
    //           <FontAwesomeIcon
    //             icon={faSpinner}
    //             spin
    //             className="text-gray-600 dark:text-gray-100 text-3xl"
    //           />
    //           <p className="mt-4 text-gray-600">Loading data...</p>
    //         </div>
    //       )  : activeTab === "Signup Requests" ? (
    //         // Signup Requests Table
    //         <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
    //           <thead className="top-0 bg-gray-200 dark:bg-gray-700 border-b text-gray-800 dark:text-gray-300 z-10">
    //             <tr>
    //               <th className="py-3 px-4 border text-left">Date</th>
    //               <th className="py-3 px-4 border text-left">User Name</th>
    //               <th className="py-3 px-4 border text-left">Email</th>
    //               <th className="py-3 px-4 border text-left">Joining Date</th>
    //               <th className="py-3 px-4 border text-left">Request Type</th>
    //               <th className="py-3 px-4 border text-center">Action</th>
    //             </tr>
    //           </thead>
    //           <tbody>
    //             {filteredRequests.length === 0 ? (
    //               <tr>
    //                 <td colSpan="6" className="text-center py-4 text-gray-500 border">
    //                   No data available
    //                 </td>
    //               </tr>
    //             ) : (
    //               filteredRequests.map((request, index) => (
    //                 <tr
    //                   key={index}
    //                   className="odd:bg-white even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-600 text-xs md:text-sm"
    //                 >
    //                   <td className="py-3 px-4 border">
    //                     {new Date(request.createdAt).toLocaleDateString()}
    //                   </td>
    //                   <td className="py-3 px-4 border">
    //                     {request.pendingUserDetails?.name || "N/A"}
    //                   </td>
    //                   <td className="py-3 px-4 border">
    //                     {request.pendingUserDetails?.email || "N/A"}
    //                   </td>
    //                   <td className="py-3 px-4 border">
    //                     {request.pendingUserDetails?.dateOfJoining
    //                       ? new Date(
    //                           request.pendingUserDetails.dateOfJoining
    //                         ).toLocaleDateString()
    //                       : "N/A"}
    //                   </td>

    //                   <td className="py-3 px-4 border">{request.reqType}</td>
    //                   <td className="py-3 px-4 text-center flex justify-center items-center space-x-2 border">
    //                     <button
    //                       onClick={() => handleOpenModal("APPROVED", request)}
    //                       className="text-green-500 text-xl"
    //                     >
    //                       <FaCheck />
    //                     </button>
    //                     <button
    //                       onClick={() => handleOpenModal("REJECTED", request)}
    //                       className="text-red-500 text-xl"
    //                     >
    //                       <FaTimes />
    //                     </button>
    //                   </td>
    //                 </tr>
    //               ))
    //             )}
    //           </tbody>
    //         </table>
    //       ) : (
    //         // Other Requests Table
    //         <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
    //           <thead className="top-0 bg-gray-200 dark:bg-gray-700 border-b text-gray-800 dark:text-gray-300 z-10">
    //             <tr>
    //               <th className="py-3 px-4 border text-left">Date</th>
    //               {activeTab === "Project Requests" && (
    //                 <th className="py-3 px-4 border text-left">Project Name</th>
    //               )}
    //               <th className="py-3 px-4 border text-left">Requested By</th>
    //               <th className="py-3 px-4 border text-left">Reason</th>
    //               {activeTab !== "All Requests" && (
    //                 <th className="py-3 px-4 border text-left">Role</th>
    //               )}
    //               <th className="py-3 px-4 border text-left">Request Type</th>
    //               {activeTab === "User Requests" && (
    //                 <th className="py-3 px-4 border text-left">
    //                   Requested For
    //                 </th>
    //               )}
    //               <th className="py-3 px-4 border text-center">Action</th>
    //             </tr>
    //           </thead>
    //           <tbody>
    //             {filteredRequests.length === 0 ? (
    //               <tr>
    //                 <td colSpan="6" className="text-center py-4 text-gray-500">
    //                   No data available
    //                 </td>
    //               </tr>
    //             ) : (
    //               filteredRequests.map((request, index) => (
    //                 <tr
    //                   key={index}
    //                   className="odd:bg-white even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-600 text-xs md:text-sm"
    //                 >
    //                   <td className="py-3 px-4 border">
    //                     {new Date(request.createdAt).toLocaleDateString()}
    //                   </td>
    //                   {activeTab === "Project Requests" && (
    //                     <td className="py-3 px-4 border">
    //                       {request.projectName?.pname || "N/A"}
    //                     </td>
    //                   )}
    //                   <td className="py-3 px-4 border">
    //                     {request.userDetails?.name}
    //                   </td>
    //                   <td className="py-3 px-4 border">{request.reason}</td>
    //                   {activeTab !== "All Requests" && (
    //                     <td className="py-3 px-4 border">
    //                       {request.userDetails?.role || "N/A"}
    //                     </td>
    //                   )}
    //                   <td className="py-3 px-4 border">{request.reqType}</td>
    //                   {activeTab === "User Requests" && (
    //                     <td className="py-3 px-4 border">
    //                       {request.targetUserID
    //                         ? request.targetUserID.name
    //                         : "N/A"}
    //                     </td>
    //                   )}
    //                   <td className="py-3 px-4 text-center flex justify-center items-center space-x-2 border">
    //                     <button
    //                       onClick={() => handleOpenModal("APPROVED", request)}
    //                       className="text-green-500 text-xl"
    //                     >
    //                       <FaCheck />
    //                     </button>
    //                     <button
    //                       onClick={() => handleOpenModal("REJECTED", request)}
    //                       className="text-red-500 text-xl"
    //                     >
    //                       <FaTimes />
    //                     </button>
    //                   </td>
    //                 </tr>
    //               ))
    //             )}
    //           </tbody>
    //         </table>
    //       )}
    //     </div>
    //   </div>

    //   {showModal && (
    //     <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
    //       <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-[90%] max-w-md">
    //         <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
    //           Confirm Action
    //         </h2>
    //         <p className="mb-4 text-gray-700 dark:text-gray-300">
    //           Are you sure you want to{" "}
    //           <span className="font-bold">
    //             {selectedAction === "APPROVED" ? "approve" : "reject"}
    //           </span>{" "}
    //           this request?
    //         </p>
    //         <div className="flex justify-end space-x-2">
    //           <button
    //             onClick={handleCloseModal}
    //             className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
    //           >
    //             Cancel
    //           </button>
    //           <button
    //             onClick={async () => {
    //               setIsProcessing(true);
    //               await handleConfirmAction();

    //               const statusText =
    //                 selectedAction === "APPROVED" ? "Accepted" : "Rejected";
    //               const type =
    //                 selectedRequest?.reqType
    //                   ?.replace(/_/g, " ")
    //                   .toLowerCase()
    //                   .replace(/\b\w/g, (c) => c.toUpperCase()) || "Request";

    //               // Use success toast for approved, error toast for rejected
    //               if (selectedAction === "APPROVED") {
    //                 toast.success(`${type} ${statusText}`);
    //               } else {
    //                 toast.error(`${type} ${statusText}`);
    //               }

    //               setIsProcessing(false);
    //             }}
    //             className={`px-4 py-2 rounded text-white flex items-center justify-center ${
    //               selectedAction === "APPROVED"
    //                 ? "bg-green-600 hover:bg-green-800"
    //                 : "bg-red-600 hover:bg-red-800"
    //             }`}
    //             disabled={isProcessing}
    //           >
    //             <div className="w-[80px] flex justify-center">
    //               {isProcessing ? (
    //                 <FontAwesomeIcon
    //                   icon={faSpinner}
    //                   spin
    //                   className="text-white text-base"
    //                 />
    //               ) : (
    //                 "Confirm"
    //               )}
    //             </div>
    //           </button>
    //         </div>
    //       </div>
    //     </div>
    //   )}
    // </>
    
  );
};
export default AdminRequestManagement;
