import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faArrowDown,
  faBell,
  faTasks,
  faProjectDiagram,
  faUserCheck,
  faCommentDots,
  faTrash,
  faEdit,
  faCalendarAlt,
  faUser,
  faEllipsisH,
  faUserShield,
  faClock
} from "@fortawesome/free-solid-svg-icons";

const NotificationItem = ({ type, message, metadata = {}, isRead, onMarkAsRead }) => {
  const assignedBy = metadata?.assignedBy || "N/A";
  const status = metadata?.status || "Unknown";
  const priority = metadata?.priority || "Low";

  const createdBy = metadata?.createdBy || "Unknown";
  const startDate = metadata?.startDate || "N/A";
  const endDate = metadata?.endDate || "N/A";

  const commentedBy = metadata?.commentedBy || "Unknown";
  const taskName = metadata?.taskName || "Unknown Task";

  const previousTitle = metadata?.previousTitle || null;
  const previousStatus = metadata?.previousStatus || null;
  const previousPriority = metadata?.previousPriority || null;
  const previousDueDate = metadata?.previousDueDate || null;

  const projectName = metadata?.projectName || "Unknown Project";
  const removedBy = metadata?.removedBy || "Unknown";

  const date = metadata?.date || "N/A";
  const comments=metadata?.comments || "N/A";

  const deletedBy = metadata?.deletedBy || "Unknown";
  

  // Colored icon map
  const getIconData = () => {
    switch (type) {
      case "Task":
        return { icon: faTasks, color: "text-blue-500" };
      case "TaskUpdate":
        return { icon: faEdit, color: "text-yellow-500" };
      case "TaskDue":
        return { icon: faClock, color: "text-red-500" };
      case "Project":
        return { icon: faProjectDiagram, color: "text-purple-500" };
      case "ProjectDue":
        return { icon: faClock, color: "text-pink-500" };
      case "ProjectRemoval":
        return { icon: faTrash, color: "text-red-600" };
      case "Request":
        return { icon: faUserCheck, color: "text-green-600" };
      case "CommentMention":
        return { icon: faCommentDots, color: "text-indigo-500" };
      case "Timesheet":
        return { icon: faClock, color: "text-blue-500" };
      case "AdminAccess":
        return { icon: faUserShield, color: "text-orange-500" };
      case "ProjectDeletion":
        return { icon: faTrash, color: "text-red-600" };
      default:
        return { icon: faBell, color: "text-gray-500" };
    }
  };

  const { icon, color } = getIconData();

  const getTitle = () => {
    switch (type) {
      case "Task": return "New Task Assigned";
      case "TaskUpdate": return "Task Updated";
      case "TaskDue": return "Task Due Tomorrow";
      case "Project": return "New Project Assigned";
      case "ProjectRemoval": return "Removed from Project";
      case "ProjectDue": return "Project Due Tomorrow";
      case "Request": return "Request Update";
      case "CommentMention": return "Mentioned in a Comment";
      case "Timesheet": return "Timesheet Update";
      case "AdminAccess":
        if (status === "APPROVED") return "Admin Access Approved";
        if (status === "REJECTED") return "Admin Access Rejected";
        return "Admin Access";
      case "ProjectDeletion":
        if (status === "APPROVED") return "Project Deletion Approved";
        if (status === "REJECTED") return "Project Deletion Rejected";
      return "Project Deleted";
      default: return "Notification";
    }
  };

  const getMessage = () => {
    switch (type) {
      case "Task":
        return <>You have been assigned a new task: <strong>{taskName}</strong></>;
      case "Project":
        return <>You have been added to the project: <strong>{projectName}</strong></>;

      case "ProjectRemoval":
        return <>You have been removed from the project <strong>{projectName}</strong> by <strong>{removedBy}</strong>.</>;

      case "CommentMention":
        return (
          <>
            <strong>{commentedBy}</strong> mentioned you in a comment on task
            <strong className="text-gray-900 dark:text-gray-100"> "{taskName}"</strong>.
          </>
        );

      case "TaskDue":
        return (
          <>
            Reminder: Task <strong className="text-gray-900 dark:text-gray-100">"{taskName}"</strong> is due <strong>tomorrow</strong>.
          </>
        );

      case "ProjectDue":
        return (
          <>
            Reminder: Project <strong className="text-gray-900 dark:text-gray-100">"{projectName}"</strong> is due <strong>tomorrow</strong>.
          </>
        );

      case "TaskUpdate":
        return <>{message}</>;

      case "Timesheet":
        return <>
          Your TimeSheet entry for <strong>{projectName}</strong> on <strong>{date}</strong> has been {metadata?.status}.<br></br>
          Remarks: <strong>{comments}</strong>
        </>;

      
      default:
        return message;
    }
  };

  return (
    <div className={`border-b rounded-md p-4 mb-2 shadow-sm 
      ${isRead ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'} dark:border-gray-500`}>

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={icon} className={`${color} text-lg`} />
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              {getTitle()}
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {getMessage()}
          </p>

          {["Task", "TaskUpdate"].includes(type) && (
            <div className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center flex-wrap gap-4">
                <div className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faUser} className="text-gray-600 dark:text-gray-400 mr-1" />
                  <span>Assigned by:</span>
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{assignedBy}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <span>Status:</span>
                  <span className={`font-medium ${status === 'Completed' ? 'text-green-600' : 'text-yellow-500'}`}>
                    {status}
                  </span>
                </div>

                <span className={`px-3 py-1 text-sm font-medium rounded-full inline-flex items-center space-x-2 ${priority === "High"
                    ? "bg-red-100 text-red-600 dark:bg-red-200 dark:text-red-500"
                    : priority === "Medium"
                      ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-100 dark:text-yellow-500"
                      : "bg-green-100 text-green-600 dark:bg-green-100 dark:text-green-500"
                  }`}>
                  {priority === "High" && <FontAwesomeIcon icon={faArrowUp} />}
                  {priority === "Medium" && <FontAwesomeIcon icon={faEllipsisH} />}
                  {priority === "Low" && <FontAwesomeIcon icon={faArrowDown} />}
                  <span>{priority}</span>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-600 dark:text-gray-400" />
                <span>Start Date:</span>
                <span className="text-gray-700 dark:text-gray-200 font-medium">{startDate}</span>
                <span>|</span>
                <span>End Date:</span>
                <span className="text-gray-700 dark:text-gray-200 font-medium">{endDate}</span>
              </div>
            </div>
          )}

          {type === "Project" && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faUser} className="text-gray-600 dark:text-gray-400" />
                <span>Created by:</span>
                <span className="text-gray-700 dark:text-gray-200 font-medium">{createdBy}</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-600 dark:text-gray-400" />
                <span>Start Date:</span>
                <span className="text-gray-700 dark:text-gray-200 font-medium">{startDate}</span>
                <span>|</span>
                <span>End Date:</span>
                <span className="text-gray-700 dark:text-gray-200 font-medium">{endDate}</span>
              </div>
            </div>
          )}

          {["TaskDue", "ProjectDue"].includes(type) && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-600 dark:text-gray-400" />
              <span>Due Date:</span>
              <span className="text-gray-700 dark:text-gray-200 font-medium">
                {metadata?.dueDate || "N/A"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faBell} className={`text-gray-600 dark:text-gray-400 ${isRead ? 'opacity-50' : ''}`} />
          {!isRead && (
            <button
              className="text-gray-600 hover:text-gray-500 text-sm dark:text-gray-400 dark:hover:text-gray-300"
              onClick={onMarkAsRead}
            >
              Mark as Read
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
