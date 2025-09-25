import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import React, { useState } from 'react'

const RangeSelector = ({ visibility, toggleRangeSelector, projectName }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [exportAll, setExportAll] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!exportAll && document.getElementById("start-date").value > document.getElementById("end-date").value) {
            document.getElementById("end-date").setCustomValidity("End date must be greater than or equal to start date.");
            document.getElementById("end-date").reportValidity(); 
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        try {
            const data = exportAll ? {} : {
                startDate: document.getElementById("start-date").value,
                endDate: document.getElementById("end-date").value
            };

            const response = await axios.post(
                `http://localhost:5000/api/generate-pdf/${projectName}`,
                data,
                { responseType: "blob" }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `ProjectReport_${projectName}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error("Error downloading PDF:", error);
        } finally {
            setIsLoading(false);
            toggleRangeSelector(false)
        }
    };

    return (
        <div className={`fixed inset-0 flex items-center justify-start p-4 bg-gray-900 bg-opacity-50 z-50 transition-opacity duration-300 ${visibility ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
            <form
                className={`relative bg-white dark:bg-gray-700 dark:text-gray-100 p-5 rounded-md shadow-md w-[90%] lg:w-[30%] md:w-[60%] transition-transform duration-500 mx-auto ${visibility ? "scale-100" : "scale-90"}`}
                onSubmit={handleSubmit}
            >
                <h2 className="text-xl font-semibold mb-8">Select Date Range</h2>

                <div className="mb-4 flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="export-all"
                        checked={exportAll}
                        onChange={() => setExportAll(!exportAll)}
                        className="accent-blue-600"
                    />
                    <label htmlFor="export-all" className="text-sm dark:text-gray-300">Export all tasks</label>
                </div>

                <div className='gap-2'>
                    <div className="relative mb-4">
                        <input
                            type="date"
                            id="start-date"
                            disabled={exportAll}
                            className="peer w-full border-b border-gray-300 px-3 pt-6 pb-2 text-gray-500 dark:text-gray-400 focus:outline-none focus:border-b-blue-500 dark:bg-gray-700 disabled:opacity-50"
                            required={!exportAll}
                        />
                        <label htmlFor="start-date" className="absolute left-3 top-1 text-gray-500 dark:text-gray-400 text-sm">Start Date</label>
                    </div>
                    <div className="relative mb-4">
                        <input
                            type="date"
                            id="end-date" 
                            onChange={(e) => e.target.setCustomValidity("")}
                            disabled={exportAll}
                            className="peer w-full border-b border-gray-300 px-3 pt-6 pb-2 text-gray-500 dark:text-gray-400 focus:outline-none focus:border-b-blue-500 dark:bg-gray-700 disabled:opacity-50"
                            required={!exportAll}
                        />
                        <label htmlFor="end-date" className="absolute left-3 top-1 text-gray-500 dark:text-gray-400 text-sm">End Date</label>
                    </div>
                </div>

                <div className='flex justify-end gap-3'>
                    <button
                        type="button"
                        className="mt-5 px-6 p-2 rounded-md border border-blue-500 text-blue-500 transform transition-transform duration-200 hover:scale-105"
                        onClick={() => toggleRangeSelector(false)}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="mt-5 px-6 p-2 w-36 rounded-md bg-gradient-to-r from-blue-400 to-blue-900 text-white transition-all duration-300 hover:from-blue-900 hover:to-blue-400"
                    >
                        {isLoading ? (
                            <FontAwesomeIcon icon={faSpinner} spin className="text-lg" />
                        ) : (
                            "Submit"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RangeSelector;
