import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TaskDistribution = ({ projectName }) => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/projectWorkLoad?pname=${projectName}`
        );
        const data = await res.json();

        if (data.members) {
          setMembers(data.members);
        } else {
          setMembers([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [projectName]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm rounded-lg p-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Task Distribution
      </h2>

      <div className="max-h-64 overflow-y-auto pr-2">
        {members.length > 0 ? (
          members.map((member) => (
            <div key={member.id} className="mb-3">
              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span className="truncate w-3/4">{member.name}</span>
                <span className="text-xs">{member.workloadPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-500 h-1.5 rounded-lg overflow-hidden">
                <motion.div
                  className={`h-full ${
                    member.workloadPercentage > 50
                      ? "bg-red-500"
                      : member.workloadPercentage > 25
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${member.workloadPercentage}%` }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-300 text-sm">
            No members found.
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskDistribution;
