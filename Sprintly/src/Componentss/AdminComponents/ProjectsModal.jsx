import React from "react";

const ProjectsModal = ({ projects, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">All Projects</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-1">
            {projects.map((project, index) => (
              <span key={index} className="inline-block py-1 px-2 rounded-md bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs">
                {project}
              </span>
            ))}
          </div>
          <div className="flex justify-end mt-8">
            <button
              onClick={onClose}
              className="text-gray-800 bg-gray-200 px-4 py-2 dark:bg-gray-500 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsModal;
