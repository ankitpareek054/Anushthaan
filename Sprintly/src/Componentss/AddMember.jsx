import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from "react-toastify";

const AddMember = ({ visibility, close, projectName, members }) => {
  const [selectedName, setSelectedName] = useState(null);
  const [isLoading,setIsLoading]=useState(false);
  const [positionSelected, setPositionSelected] = useState("Unassigned");
  const projectTitle = projectName;
  const [names, setNames] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

   const creator = localStorage.getItem("user");
   const parsedUser = JSON.parse(creator);

  
    useEffect(() => {
    axios.get("http://localhost:5000/api/getUsers")
      .then((res) => {
        setNames(res.data.users); 
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, []);
  

  // Filter names that are NOT in the members list
  const availableNames = names
    .filter((user) => !members.some((member) => member._id === user._id))
    .map((user) => ({
      value: user._id,
      label: user.name,
    }));

  const handleSubmit = (e) => {
    setIsLoading(true)
    e.preventDefault();
    if (!selectedName || positionSelected === "Unassigned") {
      alert("Please select both a name and a position.");
      return;
    }

    axios
      .post("http://localhost:5000/api/addMember", {
        _id: selectedName.value,
        projectName: projectTitle,
        name: selectedName.label,
        position: positionSelected,
       // createdBy:creator.name,
      })
      .then(() => {
        setIsLoading(false);
        setTimeout(() => {
          window.location.reload();
        }, 3000); // Waits 2 seconds before reloading
        toast.success("Added member successfully", { autoClose: 2000 });
        setSelectedName(null);
        setPositionSelected("Unassigned");
        close();
      })
      .catch(() => {
        setIsLoading(false);
        toast.error("Error adding member");
      });
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 z-50 transition-opacity duration-300 ${
        visibility ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className={`relative bg-white dark:bg-gray-700 dark:text-gray-100 p-5 rounded-md shadow-md w-[80%] lg:w-[50%] md:w-[50%] transition-transform duration-500 ${
          visibility ? "scale-100" : "scale-90"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Member</h2>
          <button
            type="button"
            className="text-gray-800 bg-gray-200 px-4 py-2 dark:bg-gray-500 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-400 mb-2"
            onClick={close}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Name Dropdown using react-select */}
        <div className="relative mb-4">
          <label className="text-gray-500 text-sm block mb-2 dark:text-gray-300">Name</label>
          <Select
            value={selectedName}
            onChange={setSelectedName}
            options={availableNames}
            placeholder="Select Name"
            isSearchable
            className="w-full"
          
          />
        </div>

        {/* Position Dropdown */}
        <div className="relative mb-4">
          <label htmlFor="position" className="text-gray-500 dark:text-gray-300 text-sm block mb-2">
            Position
          </label>
          <select
            id="position"
            value={positionSelected}
            onChange={(e) => setPositionSelected(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Unassigned" disabled>
              Select Position
            </option>
            {["Head", "Team Leader", "Employee"].map((position, index) => (
              <option key={index} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit" disabled={isLoading}
          className="mt-5 w-36 px-6 p-2 rounded-md bg-gradient-to-r from-blue-400 to-blue-900 text-white transition-colors duration-200"
        >
         {isLoading? ( <FontAwesomeIcon icon={faSpinner} spin className=" text-lg" />):"Add member"
                             }
        </button>
      </form>
    </div>
  );
};

export default AddMember;
