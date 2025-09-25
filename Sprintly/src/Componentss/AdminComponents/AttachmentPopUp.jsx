import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const AttachmentPopup = ({ attachments, close }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800 dark:text-gray-100 w-[90%] md:w-[50%] max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-wrap">Project Attachments</h3>
          <button
            type="button"
            className="text-gray-800 bg-gray-200 px-2 py-1 dark:bg-gray-500 dark:text-gray-100 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-400"
            onClick={close}
          >
            <FontAwesomeIcon icon={faXmark} className="text-base"/>
          </button>
        </div>

        {attachments.length > 0 ? (
          <ul className="space-y-2">
            {attachments.map((attachment, index) => (
              <li key={index}>
                <a
                  href="#" // Blank link for now, will be replaced with presigned URL when integrated
                  className="text-blue-500 hover:text-blue-700 underline cursor-pointer break-words block"
                >
                  {attachment} {/* Display File Name */}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No Attachments Available</p>
        )}
      </div>
    </div>
  );
};

export default AttachmentPopup;
