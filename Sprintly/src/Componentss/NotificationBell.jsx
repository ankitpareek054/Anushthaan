import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

const API_URL = "http://localhost:5000/api";
const POLLING_INTERVAL = 5000; // Poll every 5 seconds

const NotificationBell = () => {
  const nav = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    const user = localStorage.getItem("user");
    const parsedUser = user ? JSON.parse(user) : null;
    const userId = parsedUser?._id;

    if (!userId) return;

    try {
      const response = await fetch(`${API_URL}/unread-count/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch unread count");

      const data = await response.json();
      setUnreadCount(data.count); // Ensure it matches the API response
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount(); // Initial fetch

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="relative">
      <span
        className="w-12 h-12 flex items-center justify-center rounded-md cursor-pointer dark:hover:bg-gray-600 hover:bg-neutral-300"
        onClick={() => nav("/notification")}
      >
        <FontAwesomeIcon icon={faBell} className="text-xl dark:text-white text-gray-800" />

        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </span>
    </div>
  );
};

export default NotificationBell;
