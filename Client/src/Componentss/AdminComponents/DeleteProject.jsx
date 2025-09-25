import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const DeleteProject = ({ projectName, onDelete, onCancel }) => {
  return (
    // <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
    //   <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800 dark:text-gray-100">
    //     <div className="flex justify-between items-center">
    //       <h3 className="text-lg font-semibold">Confirm Deletion</h3>
    //     </div>
    //     <p className="mt-4">Are you sure you want to delete the project <strong>{projectName}</strong>?</p>
    //     <div className="mt-4 flex justify-end space-x-3">
    //       <button
    //         onClick={onCancel}
    //         className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-sm dark:bg-gray-700 dark:hover:bg-gray-600"
    //       >
    //         Cancel
    //       </button>
    //       <button
    //         onClick={onDelete}
    //         className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm text-white"
    //       >
    //         Delete
    //       </button>
    //     </div>
    //   </div>
    // </div>
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-[90%] max-w-md animate-fadeIn">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Confirm Deletion
        </h3>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete the project <span className="font-bold">{projectName}</span>?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 rounded text-white flex items-center justify-center bg-red-600 hover:bg-red-800"
          >
            <div className="w-[80px] flex justify-center">Delete</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProject;
