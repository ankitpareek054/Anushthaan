import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const EffortDistribution = ({ projectName }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEffortData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/effort-distribution/${projectName}`
        );
        const effortData = response.data.effortDistribution || [];

        setData(effortData.length > 0 ? effortData : []);
      } catch (error) {
        console.error("Error fetching effort data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEffortData();
  }, [projectName]);

  // Project Effort Distribution
  return (
    <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
      <h2 className="text-xl font-semibold mb-4">Time Allocation Overview</h2>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-center text-gray-500">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis
              dataKey="member"
              stroke="currentColor"
              tick={{ fill: "currentColor" }}
              tickLine={{ stroke: "currentColor" }}
              className="dark:text-white"
            />
            <YAxis
              stroke="currentColor"
              tick={{ fill: "currentColor" }}
              tickLine={{ stroke: "currentColor" }}
              className="dark:text-white"
            />

            <Tooltip
              formatter={(value, name) =>
                name === "effortPercentage"
                  ? [`${value}%`, "Effort %"]
                  : [`${value} hrs`, "Hours"]
              }
            />
            <Bar dataKey="effortPercentage" fill="#4A90E2" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default EffortDistribution;
