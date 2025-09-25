import { faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { TbRuler2 } from "react-icons/tb";
import Select from "react-select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NumberPicker } from "react-widgets/cjs"; 
import RestrictedDateInput from "./RestrictedDateInput.jsx";


// import { Formdate } from '../functions/Formdate.jsx';

const AddProject = ({ visiblity, close, onProjectAdded, triggerRefresh }) => { //onProjectAdded added for AdminProjManagemenet(parent) autorefresh list on adding project
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [projectManager, setProjectManager] = useState();
  const [budget, setBudget] = useState(2000);



  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");




  const [isLoading, setIsLoading] = useState(false);
  const userObject = localStorage.getItem("user")
  const parsedUser = JSON.parse(userObject)
  const currentUserId = parsedUser?._id;
  const currentUserName = parsedUser?.name;


  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/getUsers")
      .then((res) => {
        const users = res.data.users;
        setMembers(users.map(user => ({
          value: user._id,
          label: user.name,
          email: user.email,
        })));
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, []);





  const handleSubmit = async (event) => {
    setIsLoading(true);
    setIsLoading(true);
    event.preventDefault();
    const pname = document.getElementById("project-name").value;
    const pdescription = document.getElementById("project-description").value;
    const pstart = document.getElementById("start-date").value;
    const pend = document.getElementById("end-date").value;
    if (!selectedMembers || selectedMembers.length === 0) {
      toast.error("Please select members.");
      return;
    }

    if (document.getElementById("start-date").value > document.getElementById("end-date").value) {
      document.getElementById("end-date").setCustomValidity("End date must be greater than or equal to start date.");
      document.getElementById("end-date").reportValidity(); // Show error immediately
      setIsLoading(false);
      return;
    }

    const updatedMembers = [...selectedMembers];
    if (!selectedMembers.some(member => member.value === projectManager.value)) {
      updatedMembers.push(projectManager);
    }

    try {
      console.log("projectManager", projectManager);
      console.log("updatedMembers", projectManager.value);
      await axios.post("http://localhost:5000/api/createProject", {
        pname,
        pdescription,
        pstart,
        projectCreatedBy: projectManager.value,
        pend,
        budget,
        members: updatedMembers.map(m => m.value)
      })
      close();
      setIsLoading(false);
      setIsLoading(false);
      toast.success("Project added successfully");
      onProjectAdded(); //call to onProjectAdded function received from parent and notify parent to refresh projects
      triggerRefresh();

    } catch (err) {

      if (err.response.status === 400) {
        toast.error(err.response.data.message, { autoClose: 2000 });

      }
      else {
        toast.error("Error adding Project");
        console.error("Error adding project", err)
      }
      setIsLoading(false);
      setIsLoading(false);
    }


  };
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center px-4 py-2 bg-gray-900 bg-opacity-50 z-50 transition-opacity duration-300 ${visiblity ? "opacity-100 bg-gray-950 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
    >
      <form
        className="relative bg-white dark:bg-gray-700 dark:text-gray-100 px-5 py-3 rounded-md shadow-md w-full max-w-lg transition-transform duration-500"
        onSubmit={handleSubmit}


      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add Project</h2>
          <button
            className="text-gray-800 bg-gray-200 px-4 py-2 dark:bg-gray-500 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-400 mb-2"
            onClick={close}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="relative mb-4">
          <input type="text" id="project-name" className="peer w-full border-b border-gray-300 px-3 pt-6 pb-2 focus:outline-none focus:border-b-blue-500 dark:bg-gray-700" placeholder=" " required />
          <label htmlFor="project-name" className="absolute left-3 top-1 text-gray-500 text-sm transition-all duration-200 transform peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500" >Project Name</label>
        </div>

        <div className="relative mb-4">
          <input type="text" id="project-description" className="peer w-full border-b border-gray-300 px-3 pt-6 pb-2 focus:outline-none focus:border-b-blue-500 dark:bg-gray-700" placeholder=" " required />
          <label htmlFor="project-description" className="absolute left-3 top-1 text-gray-500  text-sm transition-all duration-200 transform peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500">Project Description</label>
        </div>
        


        
                <div className="flex flex-row justify-between">
  <div className="relative mb-4">
    <RestrictedDateInput
      id="start-date"
      className="peer w-full border-b border-gray-300 px-3 pt-6 pb-2 text-gray-500 dark:text-gray-400 focus:outline-none focus:border-b-blue-500 dark:bg-gray-700"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      required
    />
    <label htmlFor="start-date" className="absolute left-3 top-1 text-gray-500  dark:text-gray-400 text-sm">
      Start Date
    </label>
  </div>
  <div className="relative mb-4">
    <RestrictedDateInput
      id="end-date"
      className="peer w-full border-b border-gray-300 px-3 pt-6 pb-2 text-gray-500 dark:text-gray-400 focus:outline-none focus:border-b-blue-500 dark:bg-gray-700"
      value={endDate}
      onChange={(e) => {
        e.target.setCustomValidity("");
        setEndDate(e.target.value);
      }}
      required
    />
    <label htmlFor="end-date" className="absolute left-3 top-1 text-gray-500 dark:text-gray-400 text-sm">
      End Date
    </label>
  </div>
</div>



{/* <div className="flex flex-row justify-between">
          <div className="relative mb-4">
            <input type="date" id="start-date"   max="31-12-9999" className="peer w-full border-b border-gray-300 px-3 pt-6 pb-2 text-gray-500 dark:text-gray-400 focus:outline-none focus:border-b-blue-500 dark:bg-gray-700" required />
            <label htmlFor="start-date" className="absolute left-3 top-1 text-gray-500  dark:text-gray-400 text-sm">Start Date</label>
          </div>
          <div className="relative mb-4">
            <input type="date" id="end-date" onChange={(e) => e.target.setCustomValidity("")} className="peer w-full border-b border-gray-300 px-3 pt-6 pb-2 text-gray-500 dark:text-gray-400 focus:outline-none focus:border-b-blue-500 dark:bg-gray-700" required />
            <label htmlFor="end-date" className="absolute left-3 top-1 text-gray-500 dark:text-gray-400 text-sm">End Date</label>
          </div>
        </div> */}




{/* <div className="flex flex-row justify-between">
          <div className="relative mb-4">
            <input type="date" id="start-date"  min="2001-01-01" max="2040-12-12" className="peer w-full border-b border-gray-300 px-3 pt-6 pb-2 text-gray-500 dark:text-gray-400 focus:outline-none focus:border-b-blue-500 dark:bg-gray-700" required />
            <label htmlFor="start-date" className="absolute left-3 top-1 text-gray-500  dark:text-gray-400 text-sm">Start Date</label>
          </div>
          <div className="relative mb-4">
            <input type="date" id="end-date" onChange={(e) => e.target.setCustomValidity("")} className="peer w-full border-b border-gray-300 px-3 pt-6 pb-2 text-gray-500 dark:text-gray-400 focus:outline-none focus:border-b-blue-500 dark:bg-gray-700" required />
            <label htmlFor="end-date" className="absolute left-3 top-1 text-gray-500 dark:text-gray-400 text-sm">End Date</label>
          </div>
        </div> */}


        <div className="relative mb-4">
          <label className="block text-gray-500 text-sm mb-1  dark:text-gray-400">Budget</label>
          <NumberPicker
          className="dark:bg-gray-700 dark:text-gray-100"
            id="budget"
            value={budget}
            onChange={setBudget}
            format={value =>
              new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR'
              }).format(value)
            }
          />
        </div>
        <div className="relative mb-4">
          <label className="block text-gray-500 text-sm mb-1  dark:text-gray-400">Add Members</label>
          <Select isMulti 
          options={members} value={selectedMembers} onChange={setSelectedMembers} className="basic-multi-select" classNamePrefix="select"
            // styles={customStyles}
          />
        </div>
        <div className="relative mb-4">
          <label className="block text-gray-500 text-sm mb-1  dark:text-gray-400">Project Manager</label>
          <Select  options={[{ label: currentUserName + " (Me)", value: currentUserId }, ...selectedMembers.filter(member => member.value !== currentUserId)
          ]} classNamePrefix="select" value={projectManager} onChange={setProjectManager}

            // styles={customStyles}
            className="custom-select pmselector"
          />
        </div>
        <button type="submit" disabled={isLoading} className="mt-5 w-32 text-white p-2 rounded-md bg-gradient-to-r from-blue-400 to-blue-900 transition-colors duration-200">
          {isLoading ? (<FontAwesomeIcon
            icon={faSpinner}
            spin
            className=" text-lg"
          />) : "Add Project"
          }
        </button>
      </form>
    </div>
  );
};

export default AddProject;