import React from "react";

const tasks = [
  { id: 1, name: "Task 1 - Research and Documentation", start: "2025-01-01", duration: 2, progress: 50, priority: "high", assignedTo: "John Doe" },
  { id: 2, name: "Task 2 - Initial UI Design Phase", start: "2025-03-01", duration: 1, progress: 30, priority: "medium", assignedTo: "Jane Smith" },
  { id: 3, name: "Task 3 - Backend Development", start: "2025-05-01", duration: 3, progress: 70, priority: "low", assignedTo: "Bob Johnson" },
  { id: 4, name: "Task 4 - Testing and QA", start: "2025-07-01", duration: 2, progress: 40, priority: "high", assignedTo: "Alice Brown" },
  { id: 5, name: "Task 5 - Deployment and Review", start: "2025-09-01", duration: 1, progress: 60, priority: "medium", assignedTo: "Charlie Davis" },
];

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const getMonthOffset = (startDate) => {
  return new Date(startDate).getMonth(); // Get month index (0-11)
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "high":
      
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

const GanttChart = () => {
  return (
    <div className="flex flex-col h-full w-full border-2 shadow rounded-lg p-4">
      <div className="grid gap-4 h-full overflow-hidden">
        
        {/* Progress Bar Section */}
        <div className="overflow-auto h-full">
          
          {/* Month Headers */}
          <div className="flex sticky top-0 bg-white z-10 border-b">
            <div className="flex-none w-[180px] border-r text-center font-medium text-gray-500">Tasks</div>
            {months.map((month, index) => (
              <div
                key={index}
                className="flex-none w-24 border-r text-center text-xs text-gray-500"
              >
                {month}
              </div>
            ))}
          </div>

          {/* Task Rows */}
          <div className="relative">
            {tasks.map((task) => {
              const offset = getMonthOffset(task.start) * 96; // Each month = 96px
              return (
                <div key={task.id} className="flex items-center border-b py-3">
                  
                  {/* Task Name & Assigned To Section */}
                  <div className="flex-none w-[180px] p-2 border-r">
                    <div className="text-sm font-medium text-gray-900 break-words">{task.name}</div>
                    <div className="text-xs text-gray-600">Assigned to: {task.assignedTo}</div>
                  </div>

                  {/* Progress Bar Section */}
                  <div className="relative flex-grow">
                    <div
                      className="relative h-8 flex items-center"
                      style={{
                        marginLeft: `${offset}px`,
                        width: `${task.duration * 96}px`, // Adjusted scaling
                      }}
                    >
                      <div
                        className={`h-6 rounded-lg ${getPriorityColor(task.priority)} relative`}
                        style={{ width: "100%" }}
                      >
                        <div
                          className="absolute top-0 left-0 h-full bg-opacity-50 rounded-lg"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default GanttChart;
