import { faCircleUser } from "@fortawesome/free-regular-svg-icons";
import {faChartSimple,faCircleInfo,faDownload,faFileLines,faFilePdf,} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import Summary from "../pages/Summary.jsx";
import Document from "./Document.jsx";
import AddProject from "./AddProject.jsx";
import PageHeader from "../Header/PageHeader.jsx";
import axios from "axios";
import RangeSelector from "./RangeSelection.jsx";
const ProjectOverview = (props) => {
  const location = useLocation();
  const page = location.state?.page;
  const isFilePassed=location.state?.isFilesPassed;
  const currentUserId=JSON.parse(localStorage.getItem("user"))?._id;
  const [isDetails, setIsDetails] = useState(false);
  const [isTeamMembers, setIsTeamMembers] = useState(false);
  const [isSummary, setSummaryVisible] = useState(!isFilePassed && true);
  const [isFile, setIsFile] = useState( isFilePassed || false);
  const [project, setProject] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);
  const { title } = useParams();
  const [isAddProjectVisible, setAddProjectVisible] = useState(false);
  const [isTeamLoading, setIsTeamLoading] = useState(false); // for adding loader for the team tab

  const openAddProject = () => setAddProjectVisible(true);
  const closeAddProject = () => setAddProjectVisible(false);
  const [context, setContext] = useState(props.page);
  const [projectManager, setProjectManager] = useState({});

  const [linksVisible, setLinksVisible] = useState(false);
  const [addLinkVisible, setAddLinkVisible] = useState(false);
  const [newLink, setNewLink] = useState("");
  const [newLinkDescription, setNewLinkDescription] = useState("");
  const [lName, setLName] = useState("");
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editedBudget, setEditedBudget] = useState(project.usedBudget);
  const [rangeSelector, toggleRangeSelector] = useState(false);

  const fetchTeamMembers = async () => {
  if (!project?.members || project.members.length === 0) return;
  try {
    setIsTeamLoading(true);
    const res = await axios.post(`http://localhost:5000/api/getMembers/${title}`);
    setTeamMembers(res.data);
  } catch (error) {
    console.log("Error fetching team members:", error);
  } finally {
    setIsTeamLoading(false);
  }
};


  const getProject = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/getProject/${title}`
      );
      setProject(res.data);
      getProjectManager(res.data.projectCreatedBy); 
    } catch (error) {
      console.log("Error fetching project details:", error);
    }
  };
  
  const getProjectManager = async (id) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/members`, {
        memberIds: [id],
      });
      console.log("proj",res.data[0])
      setProjectManager(res.data[0]);
    } catch (error) {
      console.log("Error fetching project manager:", error);
    }
  };

  const handleUpdateBudget = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/updateUsedBudget/${project._id}`, {
        usedBudget: editedBudget,
      });
        setIsEditingBudget(false);
        getProject(); 
    } catch (err) {
      console.log(err);
    }
  };
  

  useEffect(() => {
    getProject();
  }, []);

  useEffect(() => {
    if (isTeamMembers) {
      fetchTeamMembers();
      getProject();
    }
  }, [isTeamMembers, isDetails]);

  useEffect(() => {
    if (!isDetails) {
      setIsEditingBudget(false);
    }
  }, [isDetails]);
  

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
    const colors = [
      "#4CAF50",
      "#FF9800",
      "#9C27B0",
      "#2196F3",
      "#795548",
      "#c92920",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleAddLink = async () => {
    if (
      newLink.trim() === "" ||
      newLinkDescription.trim() === "" ||
      lName.trim() === ""
    ) {
      alert("Please provide a valid URL and description");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/updateProjectLink/${project._id}`,
        {
          link: newLink,
          description: newLinkDescription,
          lName: lName,
          updateData: "Add",
        }
      );

      if (res.status === 200) {
        alert("Link added successfully.");
        setNewLink("");
        setNewLinkDescription("");
        setLName("");
        getProject(); // Refresh project details after adding the link
      }
    } catch (error) {
      console.error("Error adding link:", error);
      alert("Failed to add link.");
    }
  };

  const handleDeleteLink = async (linkToDelete) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/updateProjectLink/${project._id}`,
        {
          link: linkToDelete,
          updateData: "Delete",
        }
      );

      if (res.status === 200) {
        alert("Link deleted successfully.");
        getProject(); // Refresh project details after deleting the link
      }
    } catch (error) {
      console.error("Error deleting link:", error);
      alert("Failed to delete link.");
    }
  };

  return (
    <div>
      {page === "project-dashboard" && (
        <PageHeader page="home" openAddProject={openAddProject} />
      )}
      <div className="border-2 dark:border-gray-600 rounded-md mt-2 p-2">
        <div className="flex justify-between p-2">
        <h2 className="text-2xl font-bold dark:text-white">{title}</h2>
        <button className=" p-2 rounded-md  dark:bg-gray-700 dark:dark:text-gray-300 bg-blue-100 mb-2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
        onClick={()=>toggleRangeSelector(true)}>
                    <span className="p-1">
                      <FontAwesomeIcon icon={faDownload} />
                    </span>
                    <span className="hidden md:inline lg:inline">Project Report</span>
                  </button>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap justify-start dark:bg-gray-800 bg-gray-100 mt-3 overflow-hidden w-full sm:w-auto mx-auto">
          <button
            className={`p-1 sm:p-2 sm:px-4 font-semibold w-full sm:w-[140px] text-center border-black border-r text-gray-500
              ${
                isSummary
                  ? "bg-blue-100 text-blue-500 dark:text-blue-500 dark:bg-blue-100"
                  : "hover:bg-blue-100 hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-500 dark:hover:bg-blue-100"
              }`}
            onClick={() => {
              setIsDetails(false);
              setIsTeamMembers(false);
              setSummaryVisible(true);
              setIsFile(false);
            }}
          >
            <FontAwesomeIcon
              icon={faChartSimple}
              className="mr-1 sm:mr-2 hidden sm:inline"
            />
            <span>Summary</span>
          </button>
          <button
            className={`p-1 sm:p-2 sm:px-4 font-semibold w-full sm:w-[140px] text-center border-black border-r text-gray-500 ${
              isTeamMembers
                ? "bg-blue-100 text-blue-500 dark:text-blue-500 dark:bg-blue-100"
                : "hover:bg-blue-100 hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-500 dark:hover:bg-blue-100"
            }`}
            onClick={() => {
              setIsDetails(false);
              setIsTeamMembers(true);
              setSummaryVisible(false);
              setIsFile(false);
            }}
          >
            <FontAwesomeIcon
              icon={faCircleUser}
              className="mr-1 sm:mr-2 hidden sm:inline"
            />
            <span>Team</span>
          </button>
          <button
            className={`p-1 sm:p-2 sm:px-4 font-semibold w-full sm:w-[140px] text-center border-black border-r text-gray-500 hover:text-blue-400 hover:bg-blue-100 ${
              isDetails
                ? "bg-blue-100 text-blue-500 dark:text-blue-500 dark:bg-blue-100"
                : "hover:bg-blue-100 hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-500 dark:hover:bg-blue-100"
            }`}
            onClick={() => {
              setIsDetails(true);
              setIsTeamMembers(false);
              setSummaryVisible(false);
              setIsFile(false);
            }}
          >
            <FontAwesomeIcon
              icon={faCircleInfo}
              className="mr-1 sm:mr-2 hidden sm:inline"
            />
            <span>Details</span>
          </button>
          <button
            className={`p-1 sm:p-2 sm:px-4 font-semibold w-full sm:w-[140px] text-center text-gray-500 hover:text-blue-400 hover:bg-blue-100 ${
              isFile
                ? "bg-blue-100 text-blue-500 dark:text-blue-500 dark:bg-blue-100"
                : "hover:bg-blue-100 hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-500 dark:hover:bg-blue-100"
            }`}
            onClick={() => {
              setIsDetails(false);
              setIsTeamMembers(false);
              setSummaryVisible(false);
              setIsFile(true);
            }}
          >
            <FontAwesomeIcon
              icon={faFileLines}
              className="mr-1 sm:mr-2 hidden sm:inline"
            />
            <span>Docs</span>
          </button>
        </div>
        <div className="border-2 dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-500 rounded p-4">
          
        {isDetails && (
            <div className="space-y-4 max-w-4xl">
              {/* Description */}
              <div>
                <span className="text-lg font-semibold">Description:</span>
                <p className="ml-2 mt-1 p-2">{project?.pdescription}</p>
              </div>

              {/* Info Rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p>
                  <span className="text-lg font-semibold">Project Manager:</span> {projectManager.name}
                </p>
                <p>
                  <span className="text-lg font-semibold">Start date:</span> {new Date(project?.pstart).toLocaleDateString()}
                </p>
                
                <p>
                  <span className="text-lg font-semibold">Allotted Budget:</span> {project.budget}
                </p>
                <p>
                  <span className="text-lg font-semibold">End date:</span> {new Date(project?.pend).toLocaleDateString()}
                </p>
              </div>

              {/* Used Budget */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-lg font-semibold">Used Budget:</span>
                {isEditingBudget ? (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      value={editedBudget}
                      onChange={(e) => setEditedBudget(e.target.value)}
                      className="border px-3 py-1 rounded w-full sm:w-auto"
                    />
                    <button
                      onClick={handleUpdateBudget}
                      className="bg-green-500 text-white px-4 py-1 rounded"
                    >
                      Update
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <span>{project.usedBudget}</span>
                    {projectManager._id===currentUserId && (

                    
                    <button
                      onClick={() => {
                        setIsEditingBudget(true);
                        setEditedBudget(project.usedBudget);
                      }}
                      className="bg-blue-500 text-white px-4 py-1 rounded"
                    >
                      Edit
                    </button>
                    )} 
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 text-lg">
                <span className="font-semibold">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full font-semibold text-sm ${
                    project.pstatus === "In-Progress"
                      ? "bg-yellow-100 text-yellow-500"
                      : project.pstatus === "Completed"
                      ? "bg-green-100 text-green-500"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {project.pstatus}
                </span>
              </div>

              {/* Links Section */}
              <div className="mt-6">
                <span className="text-lg font-semibold mb-2 block">Links:</span>
                <div className="flex gap-4 flex-wrap">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    onClick={() => setLinksVisible(true)}
                  >
                    Show Links
                  </button>
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded-lg"
                    onClick={() => setAddLinkVisible(true)}
                  >
                    Add New Link
                  </button>
                </div>

                {/* Show Links Modal */}
                {linksVisible && (

                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
  <div className="bg-white dark:bg-gray-800 m-2 p-6 rounded-lg shadow-lg w-96">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Project Links</h2>
      <button
        className="text-gray-500 dark:text-gray-300"
        onClick={() => setLinksVisible(false)}
      >
        ✖
      </button>
    </div>

    <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
      {project.pLinks?.map((linkObj, index) => (
        <div key={index} className="border-b border-gray-300 dark:border-gray-600 pb-2">
          <p className="text-gray-900 dark:text-white font-medium">{linkObj.lName}</p>
          <a
            href={linkObj.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 break-all"
          >
            {linkObj.link}
          </a>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{linkObj.description}</p>
          <button
            onClick={() => handleDeleteLink(linkObj.link)}
            className="text-red-500 hover:text-red-700 text-sm mt-1"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  </div>
</div>

                  // <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  //   <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg">
                  //     <div className="flex justify-between items-center mb-4">
                  //       <h2 className="text-lg font-semibold">Project Links</h2>
                  //       <button
                  //         className="text-gray-500"
                  //         onClick={() => setLinksVisible(false)}
                  //       >
                  //         ✖
                  //       </button>
                  //     </div>
                  //     <div className="space-y-4 max-h-60 overflow-y-auto">
                  //       {project.pLinks?.map((linkObj, index) => (
                  //         <div
                  //           key={index}
                  //           className="border-b pb-2"
                  //         >
                  //           <p className="text-gray-900 font-medium">{linkObj.lName}</p>
                  //           <a
                  //             href={linkObj.link}
                  //             target="_blank"
                  //             rel="noopener noreferrer"
                  //             className="text-blue-500 break-all"
                  //           >
                  //             {linkObj.link}
                  //           </a>
                  //           <p className="text-gray-600 text-sm">{linkObj.description}</p>
                  //           <button
                  //             onClick={() => handleDeleteLink(linkObj.link)}
                  //             className="text-red-500 hover:text-red-700 text-sm mt-1"
                  //           >
                  //             Delete
                  //           </button>
                  //         </div>
                  //       ))}
                  //     </div>
                  //   </div>
                  // </div>
                )}

                {/* Add Link Modal */}
                {addLinkVisible && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
  <div className="bg-white dark:bg-gray-800 m-2 p-6 rounded-lg shadow-lg w-96">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Link</h2>
    </div>

    {/* Link Name */}
    <div className="mt-3">
      <label className="text-gray-700 dark:text-gray-300 font-medium">Link Name:</label>
      <input
        type="text"
        value={lName}
        onChange={(e) => setLName(e.target.value)}
        className="w-full p-2 mt-1 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white"
        placeholder="Enter link name"
      />
    </div>

    {/* Link URL */}
    <div className="mt-3">
      <label className="text-gray-700 dark:text-gray-300 font-medium">Link URL:</label>
      <input
        type="text"
        value={newLink}
        onChange={(e) => setNewLink(e.target.value)}
        className="w-full p-2 mt-1 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white"
        placeholder="Enter new link"
      />
    </div>

    {/* Description */}
    <div className="mt-3">
      <label className="text-gray-700 dark:text-gray-300 font-medium">Description:</label>
      <input
        type="text"
        value={newLinkDescription}
        onChange={(e) => setNewLinkDescription(e.target.value)}
        className="w-full p-2 mt-1 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white"
        placeholder="Enter description"
      />
    </div>

    {/* Buttons */}
    <div className="mt-4 flex justify-end space-x-2">
      <button
        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
        onClick={() => setAddLinkVisible(false)}
      >
        Cancel
      </button>
      <button
        onClick={() => {
          handleAddLink(newLink, newLinkDescription);
          setAddLinkVisible(false);
          setNewLink("");
          setNewLinkDescription("");
          setLName("");
        }}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
      >
        Add Link
      </button>
    </div>
  </div>
</div>

                  // <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  //   <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg">
                  //     <div className="flex justify-between items-center mb-4">
                  //       <h2 className="text-lg font-semibold">Add New Link</h2>
                  //       <button
                  //         className="text-gray-500"
                  //         onClick={() => setAddLinkVisible(false)}
                  //       >
                  //         ✖
                  //       </button>
                  //     </div>
                  //     <div className="space-y-3">
                  //       <input
                  //         type="text"
                  //         value={lName}
                  //         onChange={(e) => setLName(e.target.value)}
                  //         className="border px-4 py-2 rounded-md w-full"
                  //         placeholder="Enter link name"
                  //       />
                  //       <input
                  //         type="text"
                  //         value={newLink}
                  //         onChange={(e) => setNewLink(e.target.value)}
                  //         className="border px-4 py-2 rounded-md w-full"
                  //         placeholder="Enter new link"
                  //       />
                  //       <input
                  //         type="text"
                  //         value={newLinkDescription}
                  //         onChange={(e) => setNewLinkDescription(e.target.value)}
                  //         className="border px-4 py-2 rounded-md w-full"
                  //         placeholder="Enter description"
                  //       />
                  //       <button
                  //         onClick={() => {
                  //           handleAddLink(newLink, newLinkDescription);
                  //           setAddLinkVisible(false);
                  //           setNewLink("");
                  //           setNewLinkDescription("");
                  //           setLName("");
                  //         }}
                  //         className="bg-green-500 text-white px-4 py-2 rounded-md w-full"
                  //       >
                  //         Add Link
                  //       </button>
                  //     </div>
                  //   </div>
                  // </div>
                )}
              </div>
            </div>
          )}


{isTeamMembers && (
  <div className="team-members">
    {isTeamLoading ? (
      <div className="flex justify-center items-center w-full h-full">
        <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-4xl" />
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 w-full relative max-h-[65vh] overflow-auto">
        {teamMembers.length > 0 ? (
          teamMembers.map((member, index) => (
            <div
              key={index}
              className="border border-gray-300 dark:border-gray-500 rounded-md p-2 m-2"
            >
              <div className="relative flex items-center gap-4">
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-full text-lg text-white font-semibold"
                  style={{ backgroundColor: generateColor(member.name) }}
                >
                  {getInitials(member.name)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-semibold dark:text-white">
                    {member.name}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-white">
                    {member.email}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No team members found.</p>
        )}
      </div>
    )}
  </div>
)}



          {isFile && <Document title={title} />}

          {isSummary && (
            <Summary
              visibility={isSummary}
              close={() => setSummaryVisible(false)}
              context="dashboard"
              projectName={title}
            />
          )}
        </div>

        {isAddProjectVisible && (
          <div className="fixed inset-0 z-50">
            <AddProject
              visiblity={isAddProjectVisible}
              close={closeAddProject}
            />
          </div>
        )}

      {rangeSelector && (
        <RangeSelector toggleRangeSelector={toggleRangeSelector} visibility={true} projectName={title}/>
      )}
      </div>
    </div>
  );
};

export default ProjectOverview;
