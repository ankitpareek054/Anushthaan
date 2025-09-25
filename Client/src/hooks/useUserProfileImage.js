import { useState, useEffect } from "react";
import axios from "axios";
import getProfileUrl from "../functions/getProfileUrl.js";
import { useNavigate } from "react-router-dom";

const useUserProfileImage = () => {
  const [imgUrl, setImgUrl] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    const fetchUserImage = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!storedUser || !token) {
          console.warn("Missing token or user, redirecting...");
          nav("/login");
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        const email = parsedUser.email;

        const res = await axios.post(
          `http://localhost:5000/api/getUser/${email}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const user = res.data?.user;
        if (user?.profilePicUrl) {
          const url = await getProfileUrl(user.profilePicUrl);
          if (!url) {
            console.error("Failed to get profile URL");
            return;
          }
          setImgUrl(url);
        } else {
          console.warn("No profilePicUrl found for this user.");
        }
      } catch (err) {
        console.error("Failed to fetch user image:", err);
      }
    };

    fetchUserImage();
  }, [nav]);

  return imgUrl;
};

export default useUserProfileImage;
