import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#4A90E2", "#D1D5DB"]; // Engaged → Blue, Not Engaged → Light Gray

const EngagementPieChart = ({ projectName }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [data, setData] = useState([
    { name: "Engaged", value: 0 },
    { name: "Not Engaged", value: 100 },
  ]);
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/engagementrate/${projectName}`)
      .then((res) => {
        const finalValue = parseFloat(res.data.engagementRate);
        setActiveUsers(res.data.activeUserNames || []);

        let start = 0;
        const duration = 3000; // Animation duration (ms)
        const startTime = performance.now();

        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          start = Math.round(progress * finalValue);

          setAnimatedValue(start);
          setData([
            { name: "Engaged", value: start },
            { name: "Not Engaged", value: 100 - start },
          ]);

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [projectName]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Engagement Rate
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="58%"
            outerRadius="80%"
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom Legend */}
      <div className="flex justify-center gap-4 mt-2">
        <div className="flex items-center">
          <span className="w-4 h-4 bg-blue-500 rounded-full inline-block"></span>
          <span className="ml-2 text-gray-700 dark:text-gray-300 text-sm">
            Engaged ({Math.round(animatedValue)}%)
          </span>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 bg-gray-400 rounded-full inline-block"></span>
          <span className="ml-2 text-gray-700 dark:text-gray-300 text-sm">
            Not Engaged ({Math.round(100 - animatedValue)}%)
          </span>
        </div>
      </div>

      {/* Active Users List */}
      <div className="mt-4">
        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
          Active Members:
        </h3>
        {activeUsers.length > 0 ? (
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
            {activeUsers.map((user, index) => (
              <li key={index}>{user}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No active members.</p>
        )}
      </div>
    </div>
  );
};

export default EngagementPieChart;
