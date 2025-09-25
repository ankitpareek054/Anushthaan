import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import TimeSheetFilter from "./AdminComponents/TimeSheetFilter.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function TimeSheet() {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filteredTimeEntries, setFilteredTimeEntries] = useState([]); // Stores filtered data
  const [isFilterVisible, setIsFilterVisible] = useState(false); // Controls filter modal visibility
  const [hasFiltersApplied, setHasFiltersApplied] = useState(false); // Tracks applied filters

  // Retrieve logged-in user’s data from localStorage
  const storedUser = localStorage.getItem("user");
  const parsedUser = JSON.parse(storedUser);
  const userId = parsedUser?._id;

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0") ;
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const fetchTimeEntries = async () => {
      try {
        if (!userId) {
          setError("User not logged in.");
          return;
        }
        const response = await axios.get(`http://localhost:5000/api/fetchTime/${userId}`);
        console.log("hello :  ",response);
        setTimeEntries(response.data);
        setFilteredTimeEntries(response.data); // Initially, show all entries
      } catch (err) {
        setError("Error fetching time entries");
      } finally {
        setLoading(false);
      }
    };

    fetchTimeEntries();
  }, [userId]);

  const applyFilters = (filters) => {
    let filtered = [...timeEntries];

    if (filters.date) {
      // Convert "YYYY-MM-DD" to "DD/MM/YYYY" for comparison
      const [year, month, day] = filters.date.split("-");
      const filterDate = `${day}/${month}/${year}`; // Match API date format
  
      filtered = filtered.filter((entry) => entry.date === filterDate);
    }

    if (filters.project) {
      filtered = filtered.filter((entry) =>
        entry.projectName.toLowerCase().includes(filters.project.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter((entry) => entry.status === filters.status);
    }

    setFilteredTimeEntries(filtered);
    setHasFiltersApplied(true); // Mark filters as applied
    setIsFilterVisible(false); // Close filter modal
  };

  // Reset Filters
  const clearAllFilters = () => {
    setFilteredTimeEntries(timeEntries);
    setHasFiltersApplied(false); // Remove filter tracking
  };


  return (
    <div className="p-4 overflow-x-auto max-h-[80vh] border-2 dark:border-gray-600 shadow-lg rounded-lg dark:bg-gray-800 dark:text-gray-100">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Time Sheet</h2>
      
      {/* Filter Button with Toggle and Clear (X) Button */}
      <div className="relative inline-block mb-4">
        <button
          className={`relative text-gray-500 dark:text-gray-300 p-2 rounded-md
            hover:bg-blue-100 hover:text-blue-500 dark:hover:text-blue-400
            ${hasFiltersApplied ? "bg-blue-100 !text-blue-500" : "bg-transparent"}
          `}
          onClick={() => !hasFiltersApplied && setIsFilterVisible(true)}>
          <span className="p-1">
            <FontAwesomeIcon icon={faFilter} />
          </span>
          <span className="hidden md:inline lg:inline">Filter</span>

          {/* X Icon Inside Button */}
          {hasFiltersApplied && (
            <button
              className="absolute -top-1 -right-2 bg-gray-400 text-white p-0.5 rounded-3xl text-xs
                hover:bg-gray-500 h-5 w-5 flex items-center justify-center z-10"
              onClick={(e) => {
                e.stopPropagation(); // Prevent reopening filter modal
                clearAllFilters(); // Clears filter
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </button>
      </div>

      {/* Show Filter Component */}
      {isFilterVisible && (
        <TimeSheetFilter
          visibility={isFilterVisible}
          close={() => setIsFilterVisible(false)}
          applyFilters={applyFilters}
          clearAllFilters={clearAllFilters}
        />
      )}

      {loading ?(
                      <div className="flex items-center justify-center">
                                <FontAwesomeIcon
                                  icon={faSpinner}
                                  spin
                                  className="text-gray-600 dark:text-gray-100 text-2xl"
                                />
                              </div>
                    ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="w-full min-w-[600px] border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-800 text-xs md:text-sm font-semibold">
              <th className="border border-gray-300 dark:border-gray-500 p-2">Serial No</th>
              <th className="border border-gray-300 dark:border-gray-500 p-2">Project</th>
              <th className="border border-gray-300 dark:border-gray-500 p-2">Date</th>
              <th className="border border-gray-300 dark:border-gray-500 p-2">Time (minutes)</th>
              <th className="border border-gray-300 dark:border-gray-500 p-2">Comments</th>
              <th className="border border-gray-300 dark:border-gray-500 p-2">Status</th>
            </tr>
          </thead>
          <tbody>
          {filteredTimeEntries.length > 0 ? (
              filteredTimeEntries.map((entry, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-800 text-xs md:text-sm"
                >
                  <td className="border border-gray-300 dark:border-gray-500 p-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 dark:border-gray-500 p-2 text-center">{entry.projectName}</td>
                  <td className="border border-gray-300 dark:border-gray-500 p-2 text-center">{entry.date}</td>
                  <td className="border border-gray-300 dark:border-gray-500 p-2 text-center">
                    {formatTime(entry.time)}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-500 p-2 text-center">
                    {entry.comment && entry.comment.length > 0 ? entry.comment : "No Comments"}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-500 p-2 text-center font-medium">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        entry.status === "Approved"
                          ? "bg-green-100 text-green-600"
                          : entry.status === "Pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border px-4 py-2 text-center dark:text-white dark:border-gray-500" colSpan="6">
                  No time entries available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
