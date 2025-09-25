import React from "react";
import profileImage from "./boyai.jpeg"; // Adjust the path if needed

const ProfileCard = () => {
  const name = "Goutham Srinivas";
  const role = "MERN Stack Developer";
  const linkedinUrl = "#";
  const githubUrl = "#";
  const emailUrl = "#";

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 ">
      <div className="flex justify-center items-center flex-grow py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md h-auto relative">
          <div className="bg-blue-500 h-28"></div>
          <img
            src={profileImage} // Use the imported image
            alt="Profile"
            className="w-24 h-24 absolute top-16 left-1/2 transform -translate-x-1/2 rounded-full border-4 border-white shadow-md"
          />
          <div className="flex flex-col items-center mt-20">
            <h2 className="text-xl font-semibold mt-2">{name}</h2>
            <p className="text-gray-500 text-sm">{role}</p>
            <div className="flex justify-center space-x-6 mt-4">
              <a href={linkedinUrl} className="text-blue-600 hover:text-blue-800">
                <i className="fab fa-linkedin fa-lg"></i>
              </a>
              <a href={githubUrl} className="text-gray-800 hover:text-gray-600">
                <i className="fab fa-github fa-lg"></i>
              </a>
              <a href={emailUrl} className="text-red-600 hover:text-red-800">
                <i className="fas fa-envelope fa-lg"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
