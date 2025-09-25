import React from "react";
import  { useEffect } from "react";


const DeleteUserModal = ({ userToDelete, userToDeleteName, confirmDelete, cancelDelete }) => {
  console.log("Props in DeleteUserModal:", userToDelete, userToDeleteName); // Debugging line
  return (

    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
  <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-[90%] max-w-md animate-fadeIn">
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
      Confirm Deletion
    </h2>
    <p className="mb-4 text-gray-700 dark:text-gray-300">
      Are you sure you want to delete <span className="font-bold">{userToDeleteName}</span>?
    </p>
    <div className="flex justify-end space-x-2">
      <button
        onClick={cancelDelete}
        className="px-7 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
      >
        No
      </button>
      <button
        onClick={confirmDelete}
        className="px-3 py-2 rounded text-white flex items-center justify-center bg-red-600 hover:bg-red-800"
      >
        <div className="w-[80px] flex justify-center">Yes</div>
      </button>
    </div>
  </div>
</div>
  );
};


export default DeleteUserModal;
