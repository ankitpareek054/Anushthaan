import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';


const EditUserModal = ({ editData, setEditData, handleSaveEdit, handleClose }) => {
  const roles = ["Software Developer Intern", "Team Leader", "Employee", "SDE Intern", "Project Manager", "Frontend Developer", "Manager"];
  const roleOptions = roles.map(role => ({ value: role, label: role }));
  const [projectOptions, setProjectOptions] = useState([]);
  const [reportToOptions, setReportToOptions] = useState([]); // State to store fetched user emails
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    // Fetching projects
    axios
      .post("http://localhost:5000/api/fetchProjects")
      .then((res) => {
        setProjectOptions(res.data.map((project) => ({ value: project.pname, label: project.pname })));
      })
      .catch((err) => console.error("Error fetching projects", err));

    // Fetching users to extract emails for "Report To" dropdown
    axios
      .get("http://localhost:5000/api/getUsers")
      .then((res) => {
        const users = res.data.users || [];
        const emails = users.map((user) => user.email).filter(Boolean);
        setReportToOptions(emails);
        //prefill reportTo if exists
        if (userToEdit?.reportTo) {
          setSelectedReportTo(userToEdit.reportTo);
        }
      })
      .catch((err) => console.error("Error fetching users for reportTo", err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? "#374151" : "white",  // Set background based on dark mode
      borderColor: "#d1d5db",
      color: isDarkMode ? "#f3f4f6" : "black",  // Set text color based on dark mode
      '&:hover': {
        borderColor: isDarkMode ? "#4b5563" : "#3b82f6", // Hover border color based on dark mode
      },
    }),
    menu: (base) => ({
      ...base, backgroundColor: isDarkMode ? "#374151" : "white", zIndex: 10, maxHeight: "150px",
      overflowY: "auto",
    }),
    menuList: (base) => ({ ...base, maxHeight: "150px", overflowY: "auto" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? (isDarkMode ? "#4b5563" : "#3b82f6")  // Dark mode selected background
        : state.isFocused
          ? (isDarkMode ? "#4b5563" : "#bfdbfe")  // Focused option background
          : "transparent",
      color: state.isSelected
        ? "white"  // White text when selected
        : (isDarkMode ? "#f3f4f6" : "black"),  // Text color based on dark mode
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? "#4b5563" : "#d1d6dc",  // Dark mode selected background
      color: "white",  // Text color for selected value
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDarkMode ? "white" : "black",  // Ensure text inside selected options is white
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDarkMode ? "white" : "black",  // White color for the "X" (clear) button 
    }),
    singleValue: (base) => ({
      ...base,
      color: isDarkMode ? "#f3f4f6" : "black",  // Text color based on dark mode
    }),
    input: (base) => ({
      ...base,
      color: isDarkMode ? "#f3f4f6" : "black",  // Input text color based on dark mode
    }),
    placeholder: (base) => ({
      ...base,
      color: isDarkMode ? "#d1d5db" : "#6b7280",  // Placeholder text color
    }),
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md md:max-w-lg max-h-[90vh] flex flex-col">

        
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit User</h2>
  <button
    type="button"
    onClick={handleClose}
    className="text-gray-800 bg-gray-200 px-4 py-2 dark:bg-gray-500 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-400 mb-2"
  >
    <FontAwesomeIcon icon={faXmark} />
  </button>
</div>


        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="text-gray-500 text-sm">Name</label>
            <input
              type="text"
              name="name"
              value={editData.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="text-gray-500 text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={editData.email}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="text-gray-500 text-sm">Phone</label>
            <input
              type="text"
              name="phone"
              value={editData.phone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter phone number"
            />
          </div>
          <div className="relative mb-4">
            <label className="text-gray-500">Role</label>
            <Select
              options={roleOptions}
              value={roleOptions.find(option => option.value === editData.role)}
              onChange={(selected) => handleInputChange({ target: { name: 'role', value: selected.value } })}
              styles={customStyles}
              classNamePrefix="select"
              placeholder="Select Role"
            />
          </div>
          <div>
            <label className="text-gray-500 text-sm">Experience</label>
            <input
              type="text"
              name="experience"
              value={editData.experience}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g. Junior, Senior, Intern"
            />
          </div>

          <div>
            <label className="text-gray-500">Report To</label>
            <Select
              options={reportToOptions.map(email => ({ value: email, label: email }))}
              value={editData.reportTo ? { value: editData.reportTo, label: editData.reportTo } : null}
              onChange={(selectedOption) =>
                setEditData((prev) => ({
                  ...prev,
                  reportTo: selectedOption?.value || "",
                }))
              }
              className="w-full"
              styles={customStyles}
              isClearable
            />
          </div>

          <div>
            <label className="text-gray-500">Projects</label>
            <Select
              options={projectOptions}
              value={editData.projects?.map((project) => ({ value: project, label: project })) || []}
              onChange={(selectedOptions) =>
                setEditData((prev) => ({
                  ...prev,
                  projects: selectedOptions.map((option) => option.value),
                }))
              }
              isMulti
              className="w-full"
              styles={customStyles}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-800 bg-gray-200 px-4 py-2 dark:bg-gray-500 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveEdit}
            className="bg-gradient-to-r from-blue-400 to-blue-800 text-white p-2 rounded-md"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
