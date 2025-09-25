import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TbFoldersFilled } from "react-icons/tb";
import { FaFileCircleMinus, FaFileCircleCheck } from "react-icons/fa6";
import { HiUsers } from "react-icons/hi2";

const Dashboard = () => {


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
    <div className="flex flex-col space-y-5 mx-10">
      {/* Blue Background Section */}
      {/* <div className="bg-blue-400 w-full text-white text-3xl flex justify-center font-bold py-6 rounded-tr-2xl rounded-bl-2xl hover:rounded-tl-2xl hover:rounded-br-2xl hover:rounded-tr-none hover:rounded-bl-none hover:shadow-2xl">
        Hello Admin!!
      </div> */}


      {/* Project Overview Section */}
      <div className="flex flex-col mt-4">
        {/* <span className="text-xl font-semibold mb-3 bg-gray-200 text-center rounded-lg w-32 py-1">
          Dashboard
        </span> */}

        <div className="flex flex-wrap  justify-between">
          {[
            { title: "Total Projects", value: pdata.totalProjectsCount, icon: <TbFoldersFilled className="mx-auto my-auto mt-1 text-lg " />, color: "bg-blue-400/10 text-blue-500", bgcolor: "bg-blue-200/10" },
            { title: "Pending Projects", value: pdata.ongoingProjectsCount, icon: <FaFileCircleMinus className="mx-auto my-auto mt-1 text-lg " />, color: "bg-purple-400/10 text-purple-600", bgcolor: "bg-purple-200/10" },
            { title: "Completed Projects", value: pdata.completedProjectsCount, icon: <FaFileCircleCheck className="mx-auto my-auto mt-1 text-lg " />, color: "bg-green-400/10 text-green-700", bgcolor: "bg-green-200/10" },
            { title: "Total Users", value: pdata.totalUsersCount, icon: <HiUsers className="mx-auto my-auto mt-1 text-lg " />, color: "bg-blue-400/10 text-blue-500", bgcolor: "bg-blue-200/10" },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`flex w-full sm:w-[90%] md:w-[45%] lg:w-[25%] dark:border-gray-500 dark:text-gray-400 border gap-2 rounded-lg p-2.5 my-auto ${item.bgcolor} transition-transform transform hover:scale-95 scale-95 `}
            >
              <div className={`p-2 rounded-full  items-center ${item.color} w-10 h-10`}>
                {item.icon}
              </div>
              <div>
              <p className="text-xl font-semibold">{item.value}</p>
                <h3 className="text-md font-semibold mb-4">{item.title}</h3>
                
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
// import React from "react";

// const Dashboard = () => {
//   return (
//     <div className="flex flex-col space-y-6 px-6 py-8 bg-gray-50">
//       {/* Welcome Banner */}
//       <div className="bg-gradient-to-r from-blue-400 to-indigo-500 w-full text-white text-3xl flex justify-center items-center font-semibold py-8 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl">
//         Hello Admin!
//       </div>

//       {/* Project Overview */}
//       <div className="mt-6">
//         <h2 className="text-2xl font-semibold mb-6 text-gray-800">Project Overview</h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {/* Card */}
//           <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg hover:scale-[1.03] transition-transform duration-300">
//             <h3 className="text-lg font-semibold text-gray-700 mb-3">Total Projects</h3>
//             <p className="text-2xl font-bold text-blue-600">854</p>
//           </div>

//           <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg hover:scale-[1.03] transition-transform duration-300">
//             <h3 className="text-lg font-semibold text-gray-700 mb-3">Projects In-Progress</h3>
//             <p className="text-2xl font-bold text-yellow-500">421</p>
//           </div>

//           <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg hover:scale-[1.03] transition-transform duration-300">
//             <h3 className="text-lg font-semibold text-gray-700 mb-3">Completed Projects</h3>
//             <p className="text-2xl font-bold text-green-500">302</p>
//           </div>

//           <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg hover:scale-[1.03] transition-transform duration-300">
//             <h3 className="text-lg font-semibold text-gray-700 mb-3">Total Users</h3>
//             <p className="text-2xl font-bold text-purple-600">302</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
