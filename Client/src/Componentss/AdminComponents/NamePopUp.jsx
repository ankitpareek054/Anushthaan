import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
//display count default set to 2
/**
 * NamePopUp Component
 * @param {Array} members - List of members
 * @param {String} manager - Optional manager name
 * @param {String} title - Title for popup
 * @param {Number} displayCount - Number of names to show before "+ more" (default: 2)
 */
const NamePopUp = ({ members = [], manager = "", title = "", displayCount = 2 }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!members.length && !manager) return "NA";
  const allNames = manager ? [manager, ...members] : members;
  // Display first `displayCount` members
  const displayedMembers = allNames.slice(0, displayCount);
  const remainingCount = allNames.length - displayedMembers.length;

  return (
    <>
      {/* Inline display of members */}
      <span>
        {displayedMembers.map((name, index) => (
          <span key={index}>
            {name}
            {index < displayedMembers.length - 1 ? ", " : ""}
          </span>
        ))}
        {/* "+ more" button if members exceed displayCount */}
        {remainingCount > 0 && (
          <button
            onClick={() => setIsOpen(true)}
            className="text-blue-500 ml-1 cursor-pointer"
          >
            + {remainingCount} more
          </button>
        )}
      </span>

      {/* Popup */}
      {isOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800 dark:text-gray-100 w-80 max-h-[80vh]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
              <ul className="mt-2 space-y-2">
                {allNames.map((name, index) => (
                  <li key={index} className="border-b py-1">{name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NamePopUp;
