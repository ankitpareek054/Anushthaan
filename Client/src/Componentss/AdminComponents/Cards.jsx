import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight ,FaUser} from "react-icons/fa";
import { PiTreeViewFill } from "react-icons/pi";
import { IoIosChatboxes } from "react-icons/io";
const Cards = () => {
  const navigate = useNavigate();

  const [pdata, setPdata] = useState([]);
    
      useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetch(
              "http://localhost:5000/admin/getProjectCounts"
            );
            const data = await response.json();
            setPdata(data);
            console.log(pdata);
          } catch (error) {
            console.error("Error fetching KPI data:", error);
          }
        };
        fetchData();
      }, []);




  return (
    <div className="flex flex-col lg:flex-col flex-wrap gap-2 justify-between items-stretch mx-9">
      <div
        className="w-full  dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 border hover:scale-100 scale-95 rounded-lg p-3 group cursor-pointer"
        onClick={() => navigate("/admin-project-management")}
      >
        
        <div className="text-xl flex font-semibold items-center mb-4 group-hover:text-blue-700">
        <div className="w-10 h-10 bg-blue-400/10 text-blue-600 items-center rounded-full mr-2"><PiTreeViewFill className=" mx-auto my-auto mt-2"/></div>
          Project Management
          <FaArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="space-y-0.5 dark:text-gray-300 text-gray-500">
          <div className="flex justify-between">
            <span className="text-sm ">Total Projects</span>
            <span className="text-lg font-semibold">{pdata.totalProjectsCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm ">Total completed Projects</span>
            <span className="text-lg font-semibold">{pdata.completedProjectsCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm ">Total in-Progress</span>
            <span className="text-lg font-semibold">{pdata.ongoingProjectsCount}</span>
          </div>
        </div>
      </div>

      <div
        className="w-full  dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300  border hover:scale-100 scale-95 rounded-lg p-3 group cursor-pointer"
        onClick={() => navigate("/user-management")}
      >
        <div className="text-xl flex font-semibold items-center mb-4 group-hover:text-blue-700">
        <div className="w-10 h-10 bg-green-400/10 text-green-600 items-center rounded-full mr-2"><FaUser className=" mx-auto my-auto text-lg mt-2"/></div>
          User Management
          <FaArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="space-y-0.5 dark:text-gray-300 text-gray-500">
          <div className="flex justify-between">
            <span className="text-sm ">Total Users</span>
            <span className="text-lg font-semibold">{pdata.totalUsersCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm ">Managers</span>
            <span className="text-lg font-semibold">{pdata.uniqueManagerCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm ">Admins</span>
            <span className="text-lg font-semibold">{pdata.admins}</span>
          </div>
        </div>
      </div>

      <div
        className="w-full  dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 border hover:scale-100 scale-95 rounded-lg p-3 group cursor-pointer"
        onClick={() => navigate("/admin-request-management")}
      >
        <div className="text-xl flex font-semibold items-center mb-4 group-hover:text-blue-700">
        <div className="w-10 h-10 bg-purple-400/10 text-purple-600 items-center rounded-full mr-2"><IoIosChatboxes className=" mx-auto my-auto mt-3"/></div>
          Request Management
          <FaArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="space-y-0.5 dark:text-gray-300 text-gray-500">
          <div className="flex justify-between">
            <span className="text-sm ">Total Requests</span>
            <span className="text-lg font-semibold">{pdata.totalReqCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm ">Admin Access</span>
            <span className="text-lg font-semibold">{pdata.adReqCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm ">Project Deletion</span>
            <span className="text-lg font-semibold">{pdata.projDelReqCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cards;
