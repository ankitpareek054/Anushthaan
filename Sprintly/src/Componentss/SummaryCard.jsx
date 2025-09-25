// src/components/SummaryCard.jsx
import React from 'react';

const SummaryCard = ({ icon, label, value }) => {
    return (
      <div className="flex flex-col items-center bg-white dark:bg-gray-800  border border-gray-200  dark:border-gray-600 shadow-sm rounded-lg p-4 w-70">
        <div className="text-2xl">{icon}</div>
        <div className="text-xl font-semibold mt-2">{value}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</div>
      </div>
    );
  };
  

export default SummaryCard;