import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { enUS } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const KPISection = ({ setLoading }) => {
  const [kpiData, setKpiData] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const getDurationInWeeks = (startDateStr, endDateStr) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const diffInMs = endDate - startDate;
    const diffInWeeks = diffInMs / (1000 * 60 * 60 * 24 * 7);
    return Math.ceil(diffInWeeks);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
  
        const response = await fetch("http://localhost:5000/admin/getadminProjectDetails");
        const projects = await response.json();
  
        const updatedProjects = await Promise.all(
          projects.map(async (project) => {
            try {
              const svRes = await axios.get(`http://localhost:5000/api/schedule-variance/${project.projectName}`);
              const scheduleVariance = svRes.data.scheduleVariance?.toFixed(2);
              return { ...project, sv: scheduleVariance };
            } catch {
              return { ...project, sv: "No tasks assigned yet" };
            }
          })
        );
  
        setKpiData(updatedProjects);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);
  

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  const handleProjectClick = (item) => {
    navigate(`/overview/${item.projectName}`);
  };

  const CircularProgressBar = ({ progress }) => {
    const radius = 45;
    const stroke = 6;
    const circumference = 2 * Math.PI * radius;

    const motionProgress = useMotionValue(0);
    const strokeDashoffset = useTransform(
      motionProgress,
      (value) => circumference - (value / 100) * circumference
    );

    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      const controls = animate(motionProgress, progress, {
        duration: 3,
        ease: "easeInOut",
        onUpdate: (latest) => {
          setDisplayValue(Math.round(latest));
        },
      });
      return () => controls.stop();
    }, [progress]);




    return (
      <svg
        className="w-40 h-40"
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#e0e0e0"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#60A5FA"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          transform="rotate(-90 60 60)"
        />
        <text
          x="60"
          y="60"
          textAnchor="middle"
          dy=".3em"
          fontSize="1.2em"
          fontWeight="bold"
          className="fill-[#333] dark:fill-gray-400"

        >
          {displayValue}%
        </text>
      </svg>
    );
  };

  return (
    <div className="relative p-4 sm:max-w-[1100px] h-full overflow-hidden shadow-sm border dark:border-gray-600 ml-12 mt-1 rounded-md">
      {isLoading ? (
        <div className="flex items-center justify-center my-auto h-full">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-gray-600 dark:text-gray-100 text-3xl"
          />
        </div>
      ) :
        (
          <>
           

            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-4 no-scrollbar px-4 sm:px-8 h-full"
              style={{ scrollBehavior: "smooth" }}
            >
              {kpiData.map((item, idx) => (
                <div
                  key={idx}
                  className="min-w-full sm:min-w-[350px] dark:bg-gray-700 shadow-lg rounded-lg p-4 shrink-0 transition-transform transform hover:scale-100 scale-95 flex flex-col sm:flex-row justify-between items-start relative"
                >



                  <div className="flex flex-col space-y-2 w-full ">
                    <div className="flex justify-between mb-3">
                      <h3 className="text-xl font-semibold dark:text-gray-300">{item.projectName}</h3>
                      <button
                        onClick={() => handleProjectClick(item)}
                        className=" text-blue-600 text-sm underline"
                      >
                        View Details
                      </button>
                    </div>



                    <div className="flex justify-between text-gray-500 dark:text-gray-300 gap-2">

                      <div className=" justify-between items-center">
                        <p className="text-sm ">Start Date</p>
                        <p className="text-lg font-semibold">{new Date(item.startDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric"
                        })}</p>
                      </div>

                      <div >
                        <p className="text-sm ">Due Date</p>
                        <p className="text-lg font-semibold">{new Date(item.endDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric"
                        })}</p>
                      </div>
                    </div>
                    <div className="flex justify-between pt-2">
                      <p className="text-gray-500 ">Status:</p>
                      <p className={`text-sm font-semibold p-2 rounded-md ${item.pstatus === "In-Progress" ? "!text-yellow-500 bg-yellow-400/10" : item.pstatus === "Completed" ? "text-green-500 bg-green-300/10" : "text-red-500 bg-red-300/10"}`}>
                      {item.pstatus}</p>
                     
                    </div>
                    <div className="flex justify-between pt-3 text-gray-500 dark:text-gray-300">
                      <div className="space-y-3">
                        <div >
                          <span className="text-sm ">Project Manager</span>
                          <p className="text-lg font-semibold text-gray-700 truncate ">
                            {item.projectManager}
                          </p>
                        </div>
                        <div >
                          <p className="text-sm ">Duration</p>
                          <span className="text-lg font-semibold">
                            {getDurationInWeeks(item.startDate, item.endDate)} weeks
                          </span>
                        </div>
                        <div >
                          <p className="text-sm ">Team Members</p>
                          <span className="text-lg font-semibold">
                            {item.totalTeamMembers}
                          </span>
                        </div>
                        <div >
                          <p className="text-sm ">Total Tasks</p>
                          <p className="text-lg font-semibold">{item.totalTasks}</p>
                        </div>
                        <div >
                          <p className="text-sm ">Scheduled Varience</p>
                          <p className="text-lg font-semibold">{item.sv}</p>
                        </div>
                      </div>



                      <CircularProgressBar progress={item.completionPercentage} />

                    </div>
                  </div>
                </div>
              ))}
            </div>

           
          </>
        )}
         <button
              onClick={() => scroll("left")}
              className="hidden sm:flex absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-300 shadow-md p-3 rounded-full"
            >
              <FaChevronLeft size={18} />
            </button>
 <button
              onClick={() => scroll("right")}
              className="hidden sm:flex absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-300 shadow-md p-3 rounded-full"
            >
              <FaChevronRight size={18} />
            </button>
    </div>
  );
};

export default KPISection;


// import React from "react";

// const KPISection = () => {
//   return (
//     <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg hover:scale-[1.03] transition-transform duration-300">
//       <h3 className="text-xl font-semibold mb-4 text-gray-700">KPI Section</h3>
//       <div className="space-y-4">
//         <div className="flex justify-between">
//           <span className="text-sm text-gray-500">Total Users</span>
//           <span className="text-lg font-semibold text-blue-600">34</span>
//         </div>
//         <div className="flex justify-between">
//           <span className="text-sm text-gray-500">Total Revenue</span>
//           <span className="text-lg font-semibold text-green-500">$8,000</span>
//         </div>
//         <div className="flex justify-between">
//           <span className="text-sm text-gray-500">Total Orders</span>
//           <span className="text-lg font-semibold text-yellow-500">18</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default KPISection;
