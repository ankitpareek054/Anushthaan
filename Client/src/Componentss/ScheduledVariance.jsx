import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const ScheduledVariance = ({ projectName }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchSV = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/schedule-variance/${projectName}`
        );
        setData([
          {
            name: "Planned Completion %",
            value: response.data.plannedCompletion,
          },
          {
            name: "Actual Completion %",
            value: response.data.actualCompletion,
          },
          { name: "Schedule Variance", value: response.data.scheduleVariance },
        ]);
      } catch (error) {
        console.error("Error fetching Schedule Variance:", error);
      }
    };

    fetchSV();
  }, [projectName]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm rounded-lg p-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Scheduled Variance
      </h2>
      {data.every((item) => item.value === 0) ? (
        <p className="text-gray-500 dark:text-gray-300 text-sm text-center">
          No variance data available.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
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

            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ScheduledVariance;
