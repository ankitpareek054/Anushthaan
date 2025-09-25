import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";


const DeleteAttachment = ({ onDelete, onCancel, delFile, projId }) => {

  const deleteFileS3 = async () => {
    console.log("ye file ka naam h ",delFile);
    const fileNamesArray = Array.isArray(delFile) ? delFile : [delFile];

    try {
      const deleteResponse = await axios.delete("http://localhost:5000/api/deleteFilesS3", {
        data: { fileUrls: fileNamesArray },
      });
      console.log("this is the response after delete: ",deleteResponse);
    } catch (error) {
      console.error("Error deleting files:", error);
    }
    

    await axios.post(
      `http://localhost:5000/api/updateProjectDeletedFile/${projId}`,
      {
        removeAttachment: delFile, // Tell backend to remove this filename
      }
    );


  } 

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800 dark:text-gray-100">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Confirm Deletion</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <p className="mt-4">Are you sure you want to delete this attachment?</p>
        {/* <p className="mt-4">Are you sure you want to delete the attachment <strong>{attachmentName}</strong>?</p> */}
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-sm dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              deleteFileS3();
              console.log("Delete successful");
              onDelete();
              
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAttachment;
