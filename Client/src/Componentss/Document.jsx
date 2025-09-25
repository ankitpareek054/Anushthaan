import React, { useState, useEffect } from "react";
import { FaFileAlt, FaDownload, FaTrash } from "react-icons/fa";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";

const Document = ({ title }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileUrls, setFileUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [fucntionCall, setFunctionCall] = useState(false);
  const [deletingFile, setDeletingFile] = useState(null);
  const [project, setProject] = useState({});
  const [projectId, setProjectId] = useState(project?._id);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProject();
  }, []);

  useEffect(() => {
    if (project?._id) {
      setProjectId(project._id);
    }
  }, [project]);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, fucntionCall]);

  const getProject = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/getProject/${title}`
      );
      setProject(res.data);
      setProjectId(res.data._id);
    } catch (error) {
      console.log("Error fetching project details:", error);
    }
  };

  const fetchProjectData = async () => {
    try {
      await getProject();
      setLoading(true);
      const response = await axios.post(
        `http://localhost:5000/api/fetchProjectData/${projectId}`
      );
      const fileNames = response.data.pAttachments; // Get file names
      if (!fileNames || fileNames.length === 0) {
        setFileUrls([]);
        return;
      }
      // Fetch pre-signed URLs for each file
      const fetchUrls = fileNames.map((fileName) =>
        axios
          .post(`http://localhost:5000/api/getPresignedUrls/${fileName}`)
          .then((res) => ({ url: res.data.presignedUrl, name: fileName }))
          .catch((err) => {
            console.error("Error fetching pre-signed URL:", err);
            return null;
          })
      );
      const urls = await Promise.all(fetchUrls);
      setFileUrls(urls.filter((item) => item !== null)); // Store only valid URLs
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllFiles = async () => {
    try {
      if (fileUrls.length === 0) {
        return;
      }
      // Set state to show that the deletion is in progress
      setIsDeletingAll(true);
      // Loop through each file URL and call the handleDeleteFile for each one
      for (const file of fileUrls) {
        await handleDeleteFile(file.name); // Pass the filename to handleDeleteFile
      }
    } catch (error) {
      console.error("Error deleting all files:", error);
    } finally {
      setIsDeletingAll(false);
      setFunctionCall((prevState) => !prevState); // Trigger re-fetching of files
      setFunctionCall((prevState) => !prevState);
    }
  };

  const handleDeleteFile = async (fileName) => {
    try {
      if (!fileName) return null; // Prevents undefined errors
      setIsDeleting(true);
      setDeletingFile(fileName); // Set the file being deleted
      const fileUrlsArray = Array.isArray(fileName) ? fileName : [fileName];

      await axios.delete("http://localhost:5000/api/deleteFilesS3", {
        data: { fileUrls: fileUrlsArray },
      });

      await axios.post(
        `http://localhost:5000/api/updateProjectDeletedFile/${projectId}`,
        {
          removeAttachment: fileName, // Tell backend to remove this filename
        }
      );
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      setFunctionCall((prevState) => !prevState);
      setIsDeleting(false);
      setDeletingFile(null); // Reset deleting state once operation is complete
    }
  };

  const handleUpload = async () => {
    setIsUploading(true); // Set the uploading state to true
    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        const newFileName = `${title}-${file.name}`;
        const newFile = new File([file], newFileName, { type: file.type });
        formData.append("file", newFile);

        const response = await axios.post(
          "http://localhost:5000/api/upload",
          formData
        );
        if (response.data.urls && response.data.urls.length > 0) {
          const uploadedFileName = response.data.urls[0].fileName; // Extract file name from response
          await axios.post(
            `http://localhost:5000/api/updateProject/${projectId}`,
            {
              newAttachment: [uploadedFileName], // Pass new filename to be stored in backend
            }
          );
        } else {
          throw new Error("File upload failed");
        }
      }
    } catch (error) {
      console.error("Error during file upload:", error);
    } finally {
      setIsUploading(false); // Reset uploading state after upload completes
      setFunctionCall((prevState) => !prevState);
      setSelectedFiles([]);
    }
  };

  const renderFilePreview = (fileUrl, fileName) => {
    if (!fileUrl || !fileName) return null; // Prevents undefined errors

    return (
      <div className="w-100 p-5 h-20 flex flex-col items-center justify-center text-gray-600 dark:text-gray-100 relative">
        {deletingFile === fileName && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80 text-white text-lg font-semibold z-10 rounded">
            Deleting...
          </div>
        )}
        <FaFileAlt size={30} className="cursor-pointer" />
        <span className="text-sm text-center truncate w-24">{fileName}</span>
      </div>
    );
  };

  const handleDownload = (fileUrl, fileName) => {
    if (!fileUrl || !fileName) return;

    const link = document.createElement("a");
    link.href = fileUrl; // Use the retrieved pre-signed URL
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-left space-x-4 p-4 flex-col">
      <div className="flex gap-3">
        {/* File Input with Plus Icon */}
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
          onClick={() => handleUpload()}
          className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-2 rounded-lg shadow-md transition ${
            selectedFiles.length === 0 && "opacity-50 cursor-not-allowed"
          }`}
          disabled={selectedFiles.length === 0 || isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>
      <div>
        {/* Display list of files uploaded */}
        <div className="mt-4">
          <h3 className="font-bold">
            {selectedFiles.length > 0 ? "Selected Files:" : ""}
          </h3>
          {selectedFiles.map((file, index) => (
            <div>
              <div key={index} className="mt-2">
                <span className="text-blue-600">{file.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Render uploaded file previews */}
        <div className="mt-6">
        {loading ? (
  <div className="flex justify-center items-center h-40">
        <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-4xl" />
  </div>
) : fileUrls.length > 0 ? (
  <div
    className="border dark:border-gray-500 rounded-lg p-6 max-w-[90vw] h-[53vh] overflow-auto shadow-lg bg-white dark:bg-gray-800"
    style={{ scrollbarWidth: "thin" }}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200">
        Uploaded Files
      </h3>
      <button
        onClick={handleDeleteAllFiles}
        className={`flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition ${
          fileUrls.length === 0 && "opacity-50 cursor-not-allowed"
        }`}
        disabled={fileUrls.length === 0 || isDeletingAll}
      >
        {isDeletingAll ? "Deleting All..." : "Delete All"}
      </button>
    </div>
    <div className="flex flex-col gap-4 h-[80%]">
      {isDeleting ? (
        <p className="text-gray-500 dark:text-gray-400">Deleting...</p>
      ) : (
        fileUrls.map((fileUrl, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-gray-400 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow gap-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
              {renderFilePreview(fileUrl.url, fileUrl.name)}
              <span className="text-sm text-gray-700 dark:text-gray-300 break-words max-w-full">
                {fileUrl.name.substring(fileUrl.name.indexOf("-") + 1)}
              </span>
            </div>
            <div className="flex gap-3 self-end sm:self-center">
              <button
                className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-500 transition-colors"
                onClick={() => handleDownload(fileUrl.url, fileUrl.name)}
              >
                <FaDownload size={20} />
              </button>
              <button
                className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-500 transition-colors"
                onClick={() => handleDeleteFile(fileUrl.name)}
              >
                <FaTrash size={20} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
) : (
  !isDeleting && (
    <p className="text-gray-500 dark:text-gray-400 text-center">
      No documents uploaded yet.
    </p>
  )
)}

        </div>
      </div>
    </div>
  );
};

export default Document;
