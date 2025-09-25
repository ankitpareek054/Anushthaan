import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../Header/PageHeader.jsx";
import NotificationItem from "../Componentss/NotificationItem.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";


const API_URL = "http://localhost:5000/api";
const POLLING_INTERVAL = 5000; // Poll every 5 seconds

function Notifications() {
  const nav = useNavigate();
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    const user = localStorage.getItem("user");
    const parsedUser = user ? JSON.parse(user) : null;
    const userId = parsedUser?._id;

    if (!userId) {
      console.warn("User ID is missing!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/getNotifications/${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      console.log("Notifications Fetched:", data);

      //  Update state only if new notifications are received
      setNotifications((prev) => {
        const prevIds = new Set(prev.map((n) => n._id));
        const newNotifications = data.filter((n) => !prevIds.has(n._id));
        return [...newNotifications, ...prev]; // Append new ones
      });
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Clear notifications function
  const clearNotifications = async () => {
    try {
      const user = localStorage.getItem("user");
    const parsedUser = user ? JSON.parse(user) : null;
    const userId = parsedUser?._id;
      const response = await fetch(`http://localhost:5000/api/clear/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear notifications");
      }

      console.log("Notifications cleared successfully");
      setNotifications([]); // Clear UI
    } catch (error) {
      console.error("Error clearing notifications:", error.message);
    }
  };

  useEffect(() => {
    fetchNotifications(); // Initial fetch

    // ✅ Poll every 5 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const markAsRead = async (id) => {
    try {
      console.log(`Marking notification ${id} as read...`);

      const response = await fetch(`${API_URL}/mark-as-read/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification ${id} as read`);
      }

      console.log(`Notification ${id} marked as read`);

      
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === id ? { ...notif, is_read: true } : notif))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    const user = localStorage.getItem("user");
    const parsedUser = user ? JSON.parse(user) : null;
    const userId = parsedUser?._id;

    if (!userId) {
      console.warn("User ID is missing!");
      return;
    }

    try {
      console.log("Marking all notifications as read...");

      const response = await fetch(`${API_URL}/mark-all-as-read/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      console.log("All notifications marked as read");

      // ✅ Update UI optimistically
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  return (
    <>
      <PageHeader page="notifications" markAllAsRead={markAllAsRead} clearNotifications={clearNotifications} />

      <div className=" p-4 rounded-lg shadow-md dark:shadow-none border border-gray-300 
        dark:bg-gray-800 dark:border-gray-600 w-full max-w-full mx-auto h-[84vh] flex flex-col">
        <h3 className="text-lg font-semibold dark:text-gray-200">Items Assigned to you</h3>

        {loading ? (
           <div className="flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      spin
                      className="text-gray-600 dark:text-gray-100 text-2xl"
                    />
                  </div>
        ) : error ? (
          <p className="text-center text-red-500">Error: {error}</p>
        ) : (
          <div className="overflow-y-auto flex-grow mt-3 min-h-[300px] max-h-full 
          [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden">
            {notifications.map((item) => (
              <NotificationItem
                key={item._id}
                type={item.type}
                message={item.message}
                metadata={item.metadata || {}}
                isRead={item.is_read}
                onMarkAsRead={() => markAsRead(item._id)}
              />
            ))}
          </div>
        )}
      </div>

      {isFilterOpen && (
        <Filter
          visibility={isFilterOpen}
          close={() => setFilterOpen(false)}
          context="task_list"
          name="task_list"
        />
      )}
    </>
  );
}

export default Notifications;
