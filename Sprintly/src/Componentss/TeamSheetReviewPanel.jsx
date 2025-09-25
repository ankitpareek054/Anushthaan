import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { time } from "framer-motion";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const TeamSheetReviewPanel = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState(null)
  const [refresh, setRefresh] = useState(false)
  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;
  const [isRejectLoading, setIsRejectLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState({});


  // Modal state
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [comment, setComment] = useState("");

  // useEffect(() => {
  //   const fetchEntries = async () => {
  //     try {
  //       const response = await axios.get("http://localhost:5000/api/getAllTempTimeSheet");
  //       setTimeEntries(response.data.filter(entry => entry.status === "Pending"));
  //       console.log("dfg",response.data)
  //     } catch (err) {
  //       setError("Error fetching timesheet entries");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchEntries();
  //   fetchProjectName();
  // }, []);

  // const fetchProjectName = async () => {
  //   try {
  //     await axios.get(`http://localhost:5000/api/getProjectByCreator/${currentUserId}`)
  //    .then((res) => {
  //     setProjects(res.data);
  //     console.log("projects",res.data)
  //    }) 

  //   } catch (err) {
  //     console.log("Error fetching projects",err);

  //   }
  // };
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/getAllTempTimeSheet");
        const projectResponse = await axios.get(`http://localhost:5000/api/getProjectByCreator/${currentUserId}`);
        const userProjects = projectResponse.data.map(project => {
          if (!project || !project.pname) {
            console.warn("Project with missing name detected:", project);
            return null; // Handle missing name cases
          }
          return project.pname;
        }).filter(Boolean); // Remove null/undefined values
        const filteredEntries = response.data.filter(entry =>
          entry.status === "Pending" && userProjects.includes(entry.projectName)
        );
        setTimeEntries(filteredEntries);
        console.log("Filtered Timesheet Entries:", filteredEntries);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [refresh]);



  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const getFormattedComment = (comment) => {
    return comment && comment.trim() !== "" ? comment : "N/A";
  };

  const handleApprove = async (entry) => {
    const id = entry.projectHoursId;
    setLoadingMap(prev => ({ ...prev, [id]: true }));

    try {
      await axios.put("http://localhost:5000/api/updateTimeSheetStatus", {
        userId: entry.userId,
        date: entry.date,
        projectName: entry.projectName,
        projectHoursId: id,
        status: "Approved",
        comments: entry.comment,
      });

      setRefresh(!refresh);
      toast.success(`Approved entry on ${entry.date}`);
    } catch (err) {
      alert("Error approving the entry");
    } finally {
      setLoadingMap(prev => ({ ...prev, [id]: false }));
    }
  };


  const handleNotApprove = (entry) => {
    setSelectedEntry(entry);
    setShowCommentModal(true);
  };

  const submitComment = async () => {

    try {
      setIsRejectLoading(true);
      await axios.put("http://localhost:5000/api/updateTimeSheetStatus", {
        userId: selectedEntry.userId,
        date: selectedEntry.date,
        projectName: selectedEntry.projectName,
        projectHoursId: selectedEntry.projectHoursId,

        status: "Rejected",
        comments: comment,
      });
      setRefresh(!refresh)

      toast.success(`Rejected entry on ${selectedEntry.date} .`);
      window.location.reload();
    } catch (err) {
      alert("Error updating entry status");
      console.log("Error rejecting", err)
    } finally {
      setShowCommentModal(false);
      setIsRejectLoading(false);
      setComment("");
      setSelectedEntry(null);
    }
  };

  return (
    <div className="p-4 overflow-x-auto max-h-[80vh] border-2 dark:border-gray-600 shadow-lg rounded-lg dark:bg-gray-800 dark:text-gray-100">
      <h2 className="text-2xl font-bold mb-4">Team Sheet Review Panel</h2>
      {loading ? (
        <div className="flex items-center justify-center">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-gray-600 dark:text-gray-100 text-2xl"
          />
        </div>
      ) : (
        <table className="w-full min-w-[600px] border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-800 text-xs md:text-sm font-semibold">
              <th className="border border-gray-300 dark:border-gray-600 p-2">Serial No</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2">Employee Name</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2">Date</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2">Project</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2">Time (minutes)</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2">Status</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2">Actions</th>
              {/* <th className="border border-gray-300 dark:border-gray-600 p-2">Comments</th> */}
            </tr>
          </thead>
          <tbody>
            {timeEntries.length === 0 && <tr><td colSpan="8" className="text-center text-gray-600">No pending entries found</td></tr>}
            {timeEntries.map((entry, index) => (
              <tr
                key={index}
                className="odd:bg-white even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-800 text-xs md:text-sm"
              >
                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{index + 1}</td>
                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{entry.userName}</td>
                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{entry.date}</td>
                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{entry.projectName}</td>
                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                  {formatTime(entry.time)}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center font-medium">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${entry.status === "Approved"
                        ? "bg-green-100 text-green-600"
                        : entry.status === "Pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                      }`}
                  >
                    {entry.status}
                  </span>
                </td>
                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                  <button
                    disabled={loadingMap[entry.projectHoursId]}
                    className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600 transition"
                    onClick={() => handleApprove(entry)}
                  >
                    {loadingMap[entry.projectHoursId] ? (
                      <FontAwesomeIcon icon={faSpinner} spin className="text-lg" />
                    ) : (
                      "Approve"
                    )}
                  </button>

                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    onClick={() => handleNotApprove(entry)}
                  >
                    Reject
                  </button>
                </td>
                {/* <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                  {getFormattedComment(entry.comment)}
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for adding comment on rejection */}
      {showCommentModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-96">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Add Comment for Rejection</h3>
            <textarea
              className="w-full border p-2 rounded mb-4 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your comment..."
              value={comment}
              required
              onChange={(e) => setComment(e.target.value)}
              rows="4"
            />
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-2 rounded"
                onClick={() => setShowCommentModal(false)}
              >
                Cancel
              </button>
              <button
                disabled={isRejectLoading}
                className="bg-gradient-to-r from-blue-400 to-blue-900 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                onClick={submitComment}
              >
                {isRejectLoading ? (<FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  className=" text-lg"
                />) : "Submit"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamSheetReviewPanel;