import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { faXmark } from '@fortawesome/free-solid-svg-icons';



const AddUser = ({ onAddUser, onClose }) => {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    experience: "",
    reportTo: "",
    projects: [],
    password: "",
    dateOfJoining: "",
  });

  const [emailError, setEmailError] = useState(false); // email validation added for bug fix
  const [phoneError, setPhoneError] = useState(false); // phone no validation added for bug fix
  const [experienceError, setExperienceError] = useState(false); // non negative for exprience added for bug fix


  const [projectOptions, setProjectOptions] = useState([]);
  const [reportToOptions, setReportToOptions] = useState([]); // State to store fetched user emails
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const roles = ["Software Developer Intern", "Team Leader", "Project Manager", "Frontend Developer", "Manager"];
  const roleOptions = roles.map(role => ({ value: role, label: role }));

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
      })
      .catch((err) => console.error("Error fetching users for reportTo", err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const today = new Date().toISOString().split("T")[0];

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate email if the field being updated is 'email'
    if (name === "email") {
      const isValidEmail = emailRegex.test(value);
      setEmailError(!isValidEmail); // Set an error flag for UI
    }


    // Phone validation
    if (name === "phone") {
      const phoneRegex = /^[6-9]\d{9}$/;
      const isValidPhone = phoneRegex.test(value);
      setPhoneError(!isValidPhone);
    }

    if (name === "experience") {
      const isValidExperience = /^\d+$/.test(value); // Only digits, no negative numbers or letters
      setExperienceError(!isValidExperience);
    }


    setNewUser((prevData) => ({
      ...prevData,
      [name]: value,
      ...(name === "email" ? { password: value } : {}), // auto generating password same as email
      dateOfJoining: today,
    }));
  };


  const handleSaveNewUser = async () => {
    try {
      console.log("Data being sent to server:", newUser);
      const response = await axios.post("http://localhost:5000/admin/addUser", newUser);
      if (response.status === 200) {
        console.log(response);
        onAddUser(response.data.user);
        onClose();
        toast.success("User Added Succesfully")
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast.warn("Failed to add user. Please check all fields and try again.");
    }
  };

  const handleClearForm = () => {
    setNewUser({
      name: "",
      email: "",
      phone: "",
      role: "",
      experience: "",
      reportTo: "",
      projects: [],
    });
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md md:max-w-lg max-h-[90vh] flex flex-col">


        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New User</h2>
          <button
            type="button"
            onClick={onClose}
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
              value={newUser.name}
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
              value={newUser.email}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="email@example.com"
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">Please enter a valid email address.</p>
            )}
          </div>
          <div>
            <label className="text-gray-500 text-sm">Phone</label>
            <input
              type="text"
              name="phone"
              value={newUser.phone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter phone number"
            />
            {phoneError && (
              <p className="text-red-500 text-xs mt-1">Enter a valid 10-digit Indian phone number.</p>
            )}
          </div>

          <div className="relative mb-4">
            <label className="text-gray-500">Role</label>
            <Select
              options={roleOptions}
              value={roleOptions.find(option => option.value === newUser.role)}
              onChange={(selected) => handleInputChange({ target: { name: 'role', value: selected.value } })}

              classNamePrefix="select"
              placeholder="Select Role"
            />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select
              name="role"
              
              value={newUser.role}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Select Role</option>
              {roles.map((role, index) => (
                <option key={index} value={role}>{role}</option>
              ))}
            </select>
          </div> */}
          <div className="relative mb-4">
            <label className="text-gray-500">Experience (in years)</label>
            <input
              type="text"
              name="experience"
              value={newUser.experience}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter years of experience"
            />
            {experienceError && (
              <p className="text-red-500 text-xs mt-1">Experience must be a non-negative number.</p>
            )}
          </div>
          <div>
            <label className="text-gray-500">Report To</label>
            <Select
              options={reportToOptions.map(email => ({ value: email, label: email }))}
              value={newUser.reportTo ? { value: newUser.reportTo, label: newUser.reportTo } : null}
              onChange={(selectedOption) =>
                setNewUser((prev) => ({
                  ...prev,
                  reportTo: selectedOption?.value || "",
                }))
              }
              className="w-full"

              isClearable
            />
          </div>

          <div>
            <label className="text-gray-500">Projects</label>
            <Select
              options={projectOptions}
              value={newUser.projects?.map((project) => ({ value: project, label: project })) || []}
              onChange={(selectedOptions) =>
                setNewUser((prev) => ({
                  ...prev,
                  projects: selectedOptions.map((option) => option.value),
                }))
              }
              isMulti
              className="w-full"

            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClearForm}
            className="text-gray-800 bg-gray-200 px-4 py-2 dark:bg-gray-500 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-400"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleSaveNewUser}
            className="text-white px-4 py-2 rounded-md bg-gradient-to-r from-blue-400 to-blue-900 transition-colors duration-200 shadow-md hover:from-blue-500 hover:to-blue-800 flex items-center justify-center w-fit min-w-[160px] max-w-[200px]"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add User
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUser;