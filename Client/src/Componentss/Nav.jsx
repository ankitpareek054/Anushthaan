import {
  faAdd,
  faArrowRightFromBracket,
  faBars,
  faCalendar,
  faCaretDown,
  faCircleHalfStroke,
  faEnvelope,
  faGear,
  faHome,
  faList,
  faPeopleRoof,
  faSearch,
  faTimes,
  faUserFriends,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import DarkModeToggle from "react-dark-mode-toggle";
import { BsFillGridFill } from "react-icons/bs";

import { useDispatch, useSelector } from "react-redux";
import { Link, Link as RouteLink, useNavigate } from "react-router-dom";
import { toggleTheme } from "../Redux/themeSlice.jsx";
import AddProject from "./AddProject.jsx";
import NotificationBell from "./NotificationBell.jsx";
import TimeTracker from "./TimeTracker.jsx";
import useUserProfileImage from "../hooks/useUserProfileImage.js";


const NavBar = () => {
  // Local state variables
  const [isOpen, setIsOpen] = useState(false);
  const [isProjectMenu, setIsProjectMenu] = useState(true);
  //const [isConvoMenu, setIsConvoMenu] = useState(true);
  const [showAddProject, setShowAddProject] = useState(false);
  const [activeButton, setActiveButton] = useState("Home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [managerProjects, setManagerProjects] = useState(null);
  const [refreshProjects, setRefreshProjects] = useState(false);

  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;
  const adminAccess = JSON.parse(localStorage.getItem("user"))?.adminAccess;

  //profile image
  const imgUrl = useUserProfileImage();

  // Redux and navigation
  const nav = useNavigate();
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  // References for popup menu
  const menuRef = useRef(null);
  const settingsRef = useRef(null);

  // Toggle functions
  const user = localStorage.getItem("user");
  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleSubmenu = () => setIsProjectMenu(!isProjectMenu);
  //const toggleTimerMenu = () => setIsConvoMenu(!isConvoMenu);
  const toggleMenu = (event) => {
    event.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  const openAddProject = () => setShowAddProject(true);
  const closeAddProject = () => setShowAddProject(false);

  // Handle search input to filter projects
  const handleSearch = (e) => {
    setFilteredProjects(
      projects.filter((project) =>
        project.pname.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };



  //const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/getProjectByCreator/${currentUserId}`)
      .then((res) => {
        setManagerProjects(res.data);
      })
      .catch((err) => console.log("error fetching project manager", err));
  }, [currentUserId]);
  // Fetch projects on component mount
  useEffect(() => {
    axios
  .post("http://localhost:5000/api/fetchProjects")
  .then((res) => {
    // Custom sort: "In-Progress" → red (others) → "Completed"
    const sortedProjects = res.data.sort((a, b) => {
      const getPriority = (status) => {
        if (status === "In-Progress") return 0;
        if (status === "Completed") return 2;
        return 1; // red status - neither In-Progress nor Completed
      };
      return getPriority(a.pstatus) - getPriority(b.pstatus);
    });

    setProjects(sortedProjects);
    setFilteredProjects(sortedProjects);
  })
  .catch((err) => console.log("error fetching projects", err));

  }, [refreshProjects]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    nav("/user-registration");
  };

  // Close popup menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        settingsRef.current &&
        !settingsRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white text-white dark:bg-gray-800 dark:text-white transition-transform duration-300  shadow-[4px_0_10px_rgba(0,0,0,0.1)] ${isOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:w-80 w-80 md:w-[50%] z-50 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 lg:hidden">
          <h1 className="text-xl font-bold">Menu</h1>
          <button onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faTimes} className="text-xl text-black" />
          </button>
        </div>

        <div className="flex-1">
          {/* Logo & Title */}
          <div className="p-2.5 mt-1 flex items-center justify-center">
            {/* Logo now spans the full available width, removing the heading */}
            <img
              src={isDarkMode ? "/SprintlyyLogo_3.png" : "/SprintlyyLogo_2.png"}
              alt="Anushtaan Logo"
              className="w-full max-w-[180px] object-contain"
            />
          </div>

          {/* Icons Section */}
          <div className="p-2.5 flex flex-row items-center justify-between rounded-md px-4 duration-300 cursor-pointer text-gray-800 dark:text-white gap-1">
            <RouteLink to="/home">
              <button
                className={`p-3 rounded-lg hover:bg-neutral-300  dark:bg-gray-600 w-16 ${activeButton === "Home" ? "bg-neutral-300 dark:bg-gray-500" : "bg-neutral-200 dark:bg-gray-700"
                  }`}
                onClick={() => setActiveButton("Home")}
                title="Home"
              >
                <FontAwesomeIcon icon={faHome} />
              </button>
            </RouteLink>
            <RouteLink to="/dashboard">
              <button
                className={`p-3 rounded-lg hover:bg-neutral-300 w-16 ${activeButton === "Chart" ? "bg-neutral-300 dark:bg-gray-500" : "bg-neutral-200 dark:bg-gray-700"
                  }`}
                onClick={() => setActiveButton("Chart")}
                title="Projects"
              >
                <BsFillGridFill className="mx-auto m-1" />
              </button>
            </RouteLink>
            <RouteLink to="/my-tasks">
              <button
                className={`p-3 rounded-lg hover:bg-neutral-300  w-16 ${activeButton === "List" ? "bg-neutral-300 dark:bg-gray-500" : "bg-neutral-200 dark:bg-gray-700"
                  }`}
                onClick={() => setActiveButton("List")}
                title="My Tasks"
              >
                <FontAwesomeIcon icon={faList} />
              </button>
            </RouteLink>
            <RouteLink to="/agenda">
              <button
                className={`p-3 rounded-lg hover:bg-neutral-300  w-16 ${activeButton === "Agenda"
                  ? "bg-neutral-300 dark:bg-gray-500" : "bg-neutral-200 dark:bg-gray-700"
                  }`}
                onClick={() => setActiveButton("Agenda")}
                title="Agenda"
              >
                <FontAwesomeIcon icon={faCalendar} />
              </button>
            </RouteLink>
          </div>

          {/* Search Section */}
          <div className="p-2.5 flex items-center ml-4 m-2 rounded-md px-4 duration-300 cursor-pointer bg-neutral-200 text-stone-700 dark:bg-gray-700 dark:text-white">
            <FontAwesomeIcon icon={faSearch} className="text-sm" />
            <input
              type="text"
              placeholder="Search projects"
              className="text-[15px] ml-4 w-full bg-transparent focus:outline-none"
              onChange={handleSearch}
            />
          </div>

          {/* Projects Menu */}

          <div
            className="p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-neutral-200 text-stone-700 dark:hover:bg-gray-600 dark:text-white"
            onClick={toggleSubmenu}
          >
            <FontAwesomeIcon
              icon={faCaretDown}
              className={`text-sm transition-transform duration-75 ${isProjectMenu ? "rotate-180" : ""
                }`}
            />
            <span className="text-[15px] ml-4 text-gray-800 font-bold dark:text-gray-200">
              Projects
            </span>
            <button
              className="ml-auto hover:bg-neutral-300 dark:hover:bg-gray-400 p-1 rounded-md"
              onClick={(e) => {
                e.stopPropagation();
                openAddProject();
              }}
            >
              <FontAwesomeIcon icon={faAdd} />
            </button>
          </div>
          {isProjectMenu && (
            <div className="projects-scrollbar  scrollbar-thumb-neutral-400 scrollbar-track-neutral-200 text-left max-h-[30vh] md:max-h-[40vh] text-sm mx-auto text-stone-700 dark:text-gray-200 font-medium overflow-y-auto  flex flex-col">
              {filteredProjects.map((proj, index) => (
                <RouteLink to={`/project-page/${proj.pname}`} key={index}>
                  <div className="flex items-center text-left text-sm w-4/5 mx-auto pl-1 hover:bg-neutral-300 dark:hover:bg-gray-600 rounded-md">
                    <div
                      className={`h-2 w-2 rounded-full mt-1 ${proj.pstatus === "Completed"
                        ? "bg-green-500"
                        : proj.pstatus === "In-Progress"
                          ? "bg-yellow-400"
                          : "bg-red-700"
                        }`}
                    ></div>
                    <h1 className="cursor-pointer p-2 rounded-md mt-1">
                      {proj.pname}
                    </h1>
                  </div>
                </RouteLink>
              ))}
            </div>
          )}
        </div>

        <div className="text-left text-sm  overflow-y-auto max-h-30 dark:text-gray-200 text-gray-800  font-bold">
          <TimeTracker />
        </div>

        {/* Profile Section */}
        <div className="flex justify-between items-center  rounded-md duration-300 cursor-pointer text-gray-800 dark:text-white mr-2">
          <Link to="/profile">
            <p className="rounded-md w-48 cursor-pointer hover:bg-neutral-300 dark:hover:bg-gray-600 py-2 px-4 flex items-center space-x-3">
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt="Profile"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-400 rounded-full flex items-center justify-center text-sm md:text-lg font-bold text-white">
                  {user && JSON.parse(user).name
                    ? JSON.parse(user).name.charAt(0).toUpperCase()
                    : "U"}
                </div>
              )}
              <span className="text-[15px] text-stone-700 dark:text-gray-200 font-medium">
                {JSON.parse(user)?.name ? JSON.parse(user).name : "Profile"}
              </span>
            </p>
          </Link>

          <p>
            <div className="flex items-center gap-1">
              <NotificationBell />

              <span
                className="w-12 h-12 flex items-center justify-center rounded-md cursor-pointer  hover:bg-neutral-300 dark:hover:bg-gray-600"
                onClick={toggleMenu}
                ref={settingsRef}
              >
                <FontAwesomeIcon
                  icon={faGear}
                  className="text-xl text-gray-800 dark:text-white"
                />
              </span>
            </div>
            {/* Popup Menu */}
            {isMenuOpen && (
              <div
                className="absolute bg-white text-black dark:text-white w-52 py-2 rounded-md shadow-lg -mt-80 mr-2 right-0 z-10 dark:bg-gray-700 border border-gray-300 dark:border-gray-700"
                ref={menuRef}
              >
                <div
                  className="cursor-pointer dark:hover:bg-gray-600 hover:bg-neutral-300 p-2"
                  onClick={() => nav("/notification-settings")}
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span>Notification Settings</span>
                  </div>
                </div>
                <div
                  className="cursor-pointer dark:hover:bg-gray-600 hover:bg-neutral-300 p-2 "
                  onClick={() => nav("/timeSheet")}
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faCalendar} />
                    <span>Time Sheet</span>
                  </div>
                </div>

                <div
                  className="cursor-pointer dark:hover:bg-gray-600 hover:bg-neutral-300 p-2"
                  onClick={() => nav("/team-management")}
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faPeopleRoof} />
                    <span>Team</span>
                  </div>
                </div>
                {/* New Menu Item for Team Sheet Review Panel */}
                {managerProjects.length !== 0 && (
                  <div
                    className="cursor-pointer dark:hover:bg-gray-600 hover:bg-gray-300 p-2"
                    onClick={() => nav("/teamSheetView")}
                  >
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faUserFriends} />
                      <span>Team Sheet</span>
                    </div>
                  </div>

                )}

                {/* Admin Portal */}

                {adminAccess &&
                  <div
                    className="cursor-pointer dark:hover:bg-gray-600 hover:bg-gray-300 p-2"
                    onClick={() => nav("/admin-portal")}   // change the navigation direction accordingly 
                  >
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faUserShield} />
                      <span>Admin Portal</span>
                    </div>
                  </div>

                }
                <div
                  className="cursor-pointer dark:hover:bg-gray-600 hover:bg-gray-300  p-2">
                  <div className="flex items-center justify-between gap-3">
                    <p>
                      <FontAwesomeIcon
                        icon={faCircleHalfStroke}
                        className="mr-3"
                      />
                      <span>{isDarkMode ? "Dark" : "Light"}</span>
                    </p>
                    <DarkModeToggle
                      onChange={() => dispatch(toggleTheme())}
                      checked={isDarkMode}
                      size={40}
                    />
                  </div>
                </div>
                <div
                  className="cursor-pointer dark:hover:bg-gray-600 hover:bg-neutral-300 p-2"
                  onClick={() => handleLogout()}
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faArrowRightFromBracket} />
                    <span>Logout</span>
                  </div>
                </div>
              </div>
            )}
          </p>
        </div>
      </div>

      {/* Add Project Popup */}
      {showAddProject && (
        <AddProject visiblity={showAddProject} close={closeAddProject} triggerRefresh={() => setRefreshProjects(prev => !prev)} />
      )}

      {/* Main Content Header for Mobile */}
      <div className="flex-1 lg:ml-80">  {/*ml same as width of sidebar*/}
        <header className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4 shadow lg:hidden w-full">
          <button onClick={toggleSidebar}>
            <FontAwesomeIcon
              icon={faBars}
              className="text-2xl text-gray-800 dark:text-gray-100"
            />
          </button>
          
        </header>
      </div>
    </div>
  );
};

export default NavBar;