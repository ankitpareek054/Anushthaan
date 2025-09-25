import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const BudgetUsage = ({ projectName }) => {
  const [budgetData, setBudgetData] = useState({ budget: 0, usedBudget: 0 });

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/getProject/${projectName}`,
          {
            method: "POST",
          }
        );
        const data = await response.json();
        setBudgetData(data);
      } catch (error) {
        console.log("Error fetching budget data:", error);
      }
    };
    fetchBudgetData();
  }, [projectName]);

    const usagePercent = budgetData.budget? (budgetData.usedBudget / budgetData.budget) * 100: 0;
    const formattedUsagePercent = usagePercent % 1 === 0? usagePercent.toFixed(0) : usagePercent.toFixed(2); 


  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Budget Usage
      </h2>

      <div className="flex flex-col items-center">
        <div className="relative w-36 h-36">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 36 36"
        >
          <path
            className="text-gray-300 dark:text-gray-700"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
          />
          <motion.path
            className="text-blue-500"
            initial={{ strokeDasharray: "0, 100" }}
            animate={{
              strokeDasharray: `${Math.min(usagePercent, 100)}, 100`,
            }}
            transition={{ duration: 1 }}
            d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"  // solid color
            strokeWidth="4"
            strokeLinecap="round"
            transform="rotate(90 18 18)" 
          />
        </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={`text-3xl font-extrabold ${
                usagePercent > 100 ? "text-red-600" : "text-gray-800"
              } dark:text-white drop-shadow-md`}
              animate={usagePercent > 100 ? { scale: [1, 1.1, 1] } : {}}
              transition={
                usagePercent > 100 ? { duration: 0.8, repeat: Infinity } : {}
              }
            >
              {formattedUsagePercent}%
            </motion.span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {usagePercent > 100 ? "Over Budget" : "Used"}
            </span>
          </div>
        </div>

        <div className="mt-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <p>
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              Issued:
            </span>{" "}
            ₹{budgetData?.budget}
          </p>
          <p>
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              Used:
            </span>{" "}
            ₹{budgetData?.usedBudget}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetUsage;
