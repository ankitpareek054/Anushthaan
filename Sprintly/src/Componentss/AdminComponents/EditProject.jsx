import { faXmark, faTrash, faPaperclip, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteAttachment from "./DeleteAttachment.jsx";
import { NumberPicker } from "react-widgets/cjs";

const EditProject = ({ visibility, close, projectId, refreshProjects }) => {
  const [projectData, setProjectData] = useState({
    pname: "",
    pdescription: "",
    pstart: "",
    pend: "",
    members: [],
    projectManager: null,
    attachments: [],
    pstatus: "",
  });

  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state for Update button
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [deleteAttachmentVisible, setDeleteAttachmentVisible] = useState(false);
  const [isPrefillLoading, setIsPrefillLoading] = useState(true);
  const [deleteFile, setDeleteFile] = useState(null);
  const [addedFile, setAddedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [budget, setBudget] = useState(0);


  const userObject = localStorage.getItem("user");
  const parsedUser = JSON.parse(userObject);
  const currentUserId = parsedUser._id;
  const currentUserName = parsedUser.name;

  useEffect(() => {
    console.log("Prefill Loading:", isPrefillLoading);
  }, [isPrefillLoading]);


  // Fetch project details for editing
  useEffect(() => {
    if (projectId) {
      setIsPrefillLoading(true); // Start loading when fetching starts
      axios.get("http://localhost:5000/api/getUsers").then((userRes) => {
        const usersList = userRes.data.users.reduce((acc, user) => {
          acc[user._id] = { value: user._id, label: user.name }; // Storing members similar to that done in AdminProjManagement i.e as { id: { value, label } }
          return acc;
        }, {});

        setMembers(Object.values(usersList)); // Convert to array for react-select

        axios.post(`http://localhost:5000/api/fetchProjectData/${projectId}`)
          .then((res) => {
            const project = res.data;

            // Ensure the project manager is not added as a member unless explicitly assigned
            const projectManager = usersList[project.projectCreatedBy] || null;

            // Mapping members using stored user list
            const mappedMembers = project.members
              ? Object.keys(project.members)
                .filter(memberId => usersList[memberId]) // Remove if user doesn't exist
                .map(memberId => usersList[memberId])
              : [];

            // Add manager to members list explicitly if not in members in database and created by = manager
            if (projectManager && !mappedMembers.some(member => member.value === projectManager.value)) {
              mappedMembers.push(projectManager);
            }

            setProjectData({
              pname: project.pname,
              pdescription: project.pdescription,
              pstart: project.pstart?.slice(0, 10) || "",
              pend: project.pend?.slice(0, 10) || "",
              members: mappedMembers,
              projectManager: projectManager,
              attachments: project.pAttachments || [],
              pstatus: project.pstatus || "",
            });

            setBudget(project.budget || 0); // Set the budget from the project data

            setTimeout(() => setIsPrefillLoading(false), 300); // Small delay to ensure re-render
          })
          .catch((err) => {
            console.error("Error fetching project:", err);
            setIsPrefillLoading(false); // Stop loading even if error occurs
          });

      }).catch((err) => {
        console.error("Error fetching users:", err);
        setIsPrefillLoading(false);
      });
    }
  }, [projectId]);


  // form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true); // *Start loading before API call*

    const updatedProjects = {
      projectId,
      pname: projectData.pname,
      pdescription: projectData.pdescription,
      pstart: projectData.pstart,
      pend: projectData.pend,
      projectCreatedBy: projectData.projectManager?.value,
      members: projectData.members.map((m) => m.value),
      attachments: projectData.attachments,
      pstatus: projectData.pstatus,
      budget: budget, // Include the budget in the updated project data
    };

    try {
      await axios.put(`http://localhost:5000/api/updateProjects/${projectId}`, updatedProjects);
      toast.success("Project updated successfully");

      if (refreshProjects) { // ensure function exists before calling
        refreshProjects(); // Refresh project list
      } else {
        console.error("refreshProjects is not defined");
      }

      close(); // Close edit modal
    } catch (err) {
      // Check if the error response contains a message from the server
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message); // Display the actual error message
      } else {
        toast.error("Error updating project"); // Fallback error message
      }
      console.error("Error updating project:", err);
    }
    setIsLoading(false); // *Stop loading after API response*
  };


  // Function to handle attachment deletion
  const handleDeleteAttachment = (file) => {
    setDeleteAttachmentVisible(true);
    console.log(file);
    setDeleteFile(file);
    console.log(deleteFile);
  };

  const handleUpload = async () => {

    setIsUploading(true); // Set the uploading state to true

    try {
      const title = projectData.pname;
      for (const file of selectedFiles) {
        const formData = new FormData();
        const newFileName = `${title}-${file.name}`;
        const newFile = new File([file], newFileName, { type: file.type });
        formData.append("file", newFile);
        console.log(newFile);
        const response = await axios.post(
          "http://localhost:5000/api/upload",
          formData
        );
        console.log(response);
        if (response.data.urls && response.data.urls.length > 0) {
          const uploadedFileName = response.data.urls[0].fileName; // Extract file name from response   
          await axios.post(
            `http://localhost:5000/api/updateProject/${projectId}`,
            {
              newAttachment: [uploadedFileName], // Pass new filename to be stored in backend
            }
          );
          setProjectData((prevData) => ({
            ...prevData,
            attachments: [...prevData.attachments, uploadedFileName],
          }));
        } else {
          throw new Error("File upload failed");
        }
      }
    } catch (error) {
      console.error("Error during file upload:", error);
    } finally {
      setIsUploading(false); // Reset uploading state after upload completes
      setSelectedFiles([]);
    }
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? "#374151" : "white",  // Set background based on dark mode
      borderColor: "#d1d5db",
      color: isDarkMode ? "#f3f4f6" : "black",  // Set text color based on dark mode
      '&:hover': {
        borderColor: isDarkMode ? "#4b5563" : "#3b82f6", // Hover border color based on dark mode
      },
    }),
    menu: (base) => ({
      ...base, backgroundColor: isDarkMode ? "#374151" : "white", zIndex: 10, maxHeight: "150px",
      overflowY: "auto",
    }),
    menuList: (base) => ({ ...base, maxHeight: "150px", overflowY: "auto" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? (isDarkMode ? "#4b5563" : "#3b82f6")  // Dark mode selected background
        : state.isFocused
          ? (isDarkMode ? "#4b5563" : "#bfdbfe")  // Focused option background
          : "transparent",
      color: state.isSelected
        ? "white"  // White text when selected
        : (isDarkMode ? "#f3f4f6" : "black"),  // Text color based on dark mode
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? "#4b5563" : "#d1d6dc",  // Dark mode selected background
      color: "white",  // Text color for selected value
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDarkMode ? "white" : "black",  // Ensure text inside selected options is white
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDarkMode ? "white" : "black",  // White color for the "X" (clear) button 
    }),
    singleValue: (base) => ({
      ...base,
      color: isDarkMode ? "#f3f4f6" : "black",  // Text color based on dark mode
    }),
    input: (base) => ({
      ...base,
      color: isDarkMode ? "#f3f4f6" : "black",  // Input text color based on dark mode
    }),
    placeholder: (base) => ({
      ...base,
      color: isDarkMode ? "#d1d5db" : "#6b7280",  // Placeholder text color
    }),
  }

  return (
    // <div
    //   className={`fixed inset-0 flex items-center justify-center px-4 py-2 bg-gray-900 bg-opacity-50 z-50 transition-opacity duration-300 ${visibility ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    //     }`}
    // >
    //   <div>
    //   <div className="flex justify-between items-center">
    //       <h2 className="text-xl font-semibold">Edit Project</h2>
    //       <button
    //         type="button"
    //         className="text-gray-800 bg-gray-200 px-4 py-2 dark:bg-gray-500 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-400 mb-2"
    //         onClick={close}
    //       >
    //         <FontAwesomeIcon icon={faXmark} />
    //       </button>
    //     </div>
    //   <form
    //     className="relative bg-white dark:bg-gray-700 dark:text-gray-100 px-6 py-4 rounded-lg shadow-lg w-full max-w-[600px] max-h-[85vh] overflow-y-auto transition-transform duration-500"
    //     onSubmit={handleSubmit}
    //   >
    //     {/* Loading Overlay */}
    //     {isPrefillLoading && (
    //       <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-700 bg-opacity-70 dark:bg-opacity-70 z-10 rounded-lg">
    //         <FontAwesomeIcon icon={faSpinner} spin className="text-blue-600 text-4xl" />
    //       </div>
    //     )}


    <div
  className={`fixed inset-0 flex items-center justify-center px-4 py-2 bg-gray-900 bg-opacity-50 z-50 transition-opacity duration-300 ${
    visibility ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
  }`}
>
  <div className="bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg shadow-lg w-full max-w-[600px] max-h-[85vh] flex flex-col overflow-hidden transition-transform duration-500">
    
    {/* Header */}
    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Project</h2>
      {/* <button
        type="button"
        className="text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
        onClick={close}
      >
        <FontAwesomeIcon icon={faXmark} className="h-6 w-6" />
      </button> */}

      <button
  type="button"
  className="text-gray-800 bg-gray-200 px-3 py-2 dark:bg-gray-500 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-400"
  onClick={close}
>
  <FontAwesomeIcon icon={faXmark} className=" w-6" />
</button>

    </div>

    {/* Form */}
    <form
      className="relative px-6 py-4 overflow-y-auto"
      onSubmit={handleSubmit}
    >
      {/* Loading Overlay */}
      {isPrefillLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-700 bg-opacity-70 dark:bg-opacity-70 z-10 rounded-lg">
          <FontAwesomeIcon icon={faSpinner} spin className="text-blue-600 text-4xl" />
        </div>
      )}

     


        {/* <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Edit Project</h2>
          <button
            type="button"
            className="text-gray-800 bg-gray-200 px-4 py-2 dark:bg-gray-500 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-400 mb-2"
            onClick={close}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div> */}

        {/* Project Name */}
        <div className="relative">
          <input
            type="text"
            value={projectData.pname}
            onChange={(e) => setProjectData({ ...projectData, pname: e.target.value })}
            className="w-full border-b border-gray-300 px-3 pt-2 pb-2 focus:outline-none focus:border-b-blue-500 dark:bg-gray-700"
            required
            disabled={isPrefillLoading} // Disable while loading
          />
          {isPrefillLoading && (
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 text-lg"
            />
          )}
        </div>

        {/* Project Description */}
        <div className="relative mb-4">
          <label className="text-gray-500 text-sm">Project Description</label>
          <input
            type="text"
            value={projectData.pdescription}
            onChange={(e) => setProjectData({ ...projectData, pdescription: e.target.value })}
            className="w-full border-b border-gray-300 px-3 pt-2 pb-2 focus:outline-none focus:border-b-blue-500 dark:bg-gray-700"
            required
          />
        </div>

        {/* Start Date */}
        <div className="relative mb-4">
          <label className="text-gray-500">Start Date</label>
          <input
            type="date"
            value={projectData.pstart}
            onChange={(e) => setProjectData({ ...projectData, pstart: e.target.value })}
            className="w-full border rounded-md p-2 dark:bg-gray-800 dark:text-gray-200"
            disabled
          />
        </div>

        {/* End Date */}
        <div className="relative mb-4">
          <label className="text-gray-500">End Date</label>
          <input
            type="date"
            value={projectData.pend}
            onChange={(e) => setProjectData({ ...projectData, pend: e.target.value })}
            className="w-full border rounded-md p-2 dark:bg-gray-800 dark:text-gray-200"
          />
        </div>

        {/* Budget */}
        <div className="relative mb-4">
          <label className="block text-gray-500 text-sm mb-1 dark:text-gray-400">Budget</label>
          <NumberPicker
            className="dark:bg-gray-700 dark:text-gray-100"
            id="budget"
            value={budget}
            onChange={setBudget}
            format={value =>
              new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR'
              }).format(value)
            }
          />
        </div>


        {/* Team Members */}
        <div className="relative mb-4">
          <label className="text-gray-500">Team Members</label>
          <Select
            isMulti
            options={members}
            value={projectData.members} // passing selected members
            getOptionLabel={(e) => e.label} // only name shown
            onChange={(selected) => setProjectData({ ...projectData, members: selected })} className="basic-multi-select" classNamePrefix="select" styles={customStyles}
          />
        </div>

        {/* Project Manager */}
        <div className="relative mb-4">
          <label className="text-gray-500">Project Manager</label>
          <Select // Only allow members selected in "Add Members" field and createdBy
            options={[
              { label: `${currentUserName} (Me)`, value: currentUserId },
              ...projectData.members.filter(member => member.value !== currentUserId) // Remove duplicate entry
            ]}
            value={projectData.projectManager}
            onChange={(selected) => setProjectData({ ...projectData, projectManager: selected })} className="basic-multi-select" classNamePrefix="select" styles={customStyles}
          />
        </div>

        {/* Display Attachments */}
        <div className="relative mb-4">
          <label className="text-gray-500">Attachments</label>
          <div className="max-h-36 overflow-y-auto">
            {projectData.attachments && projectData.attachments.length > 0
              ? projectData.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{file}</span>
                  <button
                    type="button"
                    className="text-red-500 px-2"
                    onClick={() => handleDeleteAttachment(file)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))
              : "No Attachments"}
          </div>
        </div>

        {/* Add Attachment Button */}
        <div className="relative mb-4 flex justify-start">

          <label className="flex flex-col items-center justify-center w-10 h-10 border-dashed border-gray-400 rounded-full cursor-pointer bg-gray-100 hover:border-blue-500 transition">
            <FontAwesomeIcon
              icon={faUpload}
              className="w-4 h-4 text-gray-500 hover:text-blue-500 transition"
            />
            <input
              type="file"
              className="hidden"
              multiple
              onChange={(e) => setSelectedFiles(Array.from(e.target.files))} // Capture all selected files
            />
          </label>

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => handleUpload()}
            disabled={selectedFiles.length === 0 || isUploading}
            className={`text-white bg-gradient-to-r from-blue-400 to-blue-900 px-3 py-2 rounded-md shadow-md hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-800 flex items-center ${selectedFiles.length === 0 && "opacity-50 cursor-not-allowed"} ${isUploading === true && "opacity-50 cursor-not-allowed"}`}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* Status */}
        <div className="relative mb-4">
          <label className="text-gray-500">Status</label>
          <input
            type="text"
            value={projectData.pstatus}
            readOnly
            disabled
            className="w-full border rounded-md p-2 dark:bg-gray-800 dark:text-gray-200"
          />
        </div>

        <button
          type="submit"
          className="mt-5 w-40 text-white p-2 rounded-md bg-gradient-to-r from-blue-400 to-blue-900 transition-colors duration-200"
          disabled={isPrefillLoading || isLoading} // Disable while preloading or updating
        >
          {isPrefillLoading ? (
            <FontAwesomeIcon icon={faSpinner} spin className="text-lg" />
          ) : isLoading ? (
            <FontAwesomeIcon icon={faSpinner} spin className="text-lg" />
          ) : (
            "Update Project"
          )}
        </button>
      </form>
      </div>

      {/* Delete Attachment Modal */}
      {deleteAttachmentVisible && (
        <DeleteAttachment
          onDelete={() => {
            setDeleteAttachmentVisible(false);

            // Remove the deleted file from projectData.attachments
            setProjectData((prevData) => ({
              ...prevData,
              attachments: prevData.attachments.filter(
                (attachment) =>
                  attachment !== deleteFile && attachment !== deleteFile
              ),
            }));
          }}

          delFile={deleteFile}
          projId={projectId}
          onCancel={() => setDeleteAttachmentVisible(false)}
          fileName={deleteFile}
        />
      )}
    </div>
  );
};

export default EditProject;