import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faAdd, faFilter, faClone, faUsers, faUserPlus, faChartBar, faXmark, faSearch, faEllipsisVertical, faFileImport, faTrash, faFileExport, faFilePdf, faFileExcel, faFileArrowDown } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import DarkModeToggle from "react-dark-mode-toggle";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../Redux/themeSlice.jsx";
import { setGroupBy } from "../Redux/groupBy.jsx";
import { setQuery } from "../Redux/searchSlice.jsx";
import { handleImport, handleExportExcel, handleExportPDF } from "../functions/ImportExportTasks.jsx";
import { setFilters, clearFilter } from "../Redux/filterslice.jsx"; // Import your filter clearing action
import { GetProjectData } from "../functions/GetProjectData.jsx";
import RangeSelector from "../Componentss/RangeSelection.jsx";

const PageHeader = (props) => {
  // const [IsDark, setIsDark] = useState(localStorage.getItem("theme") === "dark");
  const [isGroupBy, setIsGroupBy] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExportSubmenuOpen, setIsExportSubmenuOpen] = useState(false);
  const [importTasks, setImportTasks] = useState([]);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isSummaryOpen, setSummaryOpen] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [projectManagerId, setProjectManagerId] = useState();
  const currentUserId = JSON.parse(localStorage.getItem("user"))._id;
  const [isManager, setIsManager] = useState(projectManagerId === currentUserId)
  const [rangeSelector, toggleRangeSelector] = useState(false);

  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const groupBy = useSelector((state) => state.groupBy.groupByField);
  const dispatch = useDispatch();

  const handleCloseFilter = () => {
    if (props.setIsFilterVisible) {
      props.setIsFilterVisible(false);
      window.location.reload(); // Refresh the page
    } else {
      console.error("setIsFilterVisible is not provided as a prop");
    }
  };


  const activeFilters = useSelector((state) => state.filters.filters); // Get active filters from Redux
  const hasActiveFilters = Object.keys(activeFilters).length > 0; // Check if filters exist

  const handleClearFilters = (e) => {
    e.stopPropagation(); // Prevents opening the filter modal when clicking "X"
    dispatch(clearFilter()); // Clear filters in Redux
  };


  useEffect(() => {
    console.log("project name", props.projectname)
    GetProjectData(props.projectname).then(setProjectManagerId);
  }, [props.projectname]);


  useEffect(() => {
    dispatch(setQuery(""))
    dispatch(setGroupBy(null))
    dispatch(setFilters({}));

  }, [props.page, isSearchOpen])


  if (props.page === "project") {
    useEffect(() => {
      setTaskList(props.taskList.filter(task => task.projectName === props.projectname));
    }, [props.taskList]);
  }


  const handleGroupBy = (group) => {
    dispatch(setGroupBy(group));
    setIsGroupBy(false)
  }



  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  const handleSearchChange = (e) => {
    props.setSearchQuery(e.target.value);
  };

  const handleTaskSearch = (e) => {
    dispatch(setQuery(e.target.value))
  };

  return (
    <>
      {props.page === "home" && (
        <div className="bg-gray-100 dark:bg-gray-700 shadow-md py-3 px-4 flex justify-between items-center sticky top-0 z-40">
          <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm lg:text-xl mg:text-lg">
            Have a productive day!
          </div>

          <div className="flex items-center gap-2">
            <button
              className="bg-gradient-to-r from-blue-400 to-blue-800 text-white p-2 rounded-md"
              onClick={props.openAddProject}
            >
              <span className="p-1">
                <FontAwesomeIcon icon={faAdd} />
              </span>
              <span className="hidden md:inline lg:inline">Add Project</span>
            </button>
            <DarkModeToggle
              onChange={handleToggle}
              checked={isDarkMode}
              size={50}
            />
          </div>
        </div>
      )} {props.page === "project" && (
        <div className="bg-gray-100 dark:bg-gray-700 shadow-md py-3 px-4 flex justify-between items-center  sticky top-0  z-40 ">
          {/* Greeting */}

          <div className={`flex flex-row gap-1 font-semibold text-gray-800 dark:text-gray-200 ${props.isKanAndGantt ? "*:hidden" : ""}`}>

            <button
              className={`relative text-gray-500 dark:text-gray-300 p-2 rounded-md 
      hover:bg-blue-100 hover:text-blue-500 dark:hover:text-blue-400 
      ${hasActiveFilters ? "bg-blue-100 !text-blue-500 " : ""}`}
              onClick={props.openFilter}
            >
              <span className="p-1">
                <FontAwesomeIcon icon={faFilter} />
              </span>
              <span className="hidden md:inline lg:inline">Filter</span>

              {hasActiveFilters && (
                <span
                  className="absolute -top-1 -right-2 bg-gray-400 text-white p-0.5 rounded-3xl text-xs hover:bg-gray-500 h-5 w-5 z-10"
                  onClick={handleClearFilters}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </span>
              )}
            </button>
            <div className="relative">
              <button className={`text-gray-500 dark:text-gray-300 p-2 rounded-md hover:bg-blue-100  hover:text-blue-500 dark:hover:text-blue-400 ${groupBy ? "bg-blue-100 !text-blue-500" : ""}`} onClick={() => { setIsGroupBy(!isGroupBy); setSearchOpen(false) }}>
                <span className="p-1">
                  <FontAwesomeIcon icon={faClone} />
                </span>
                <span className="hidden md:inline lg:inline">Group by</span>
                <span onClick={(e) => { e.stopPropagation(); handleGroupBy(null) }}><FontAwesomeIcon icon={faXmark} className={`absolute -top-1 -right-2 bg-gray-400 text-white p-1 w-3 h-3 rounded-3xl tex-xs hover:bg-gray-500 z-10 ${!groupBy ? "hidden" : ""}`} /></span>
              </button>
              {isGroupBy && (
                <div className="absolute bg-white dark:bg-gray-800 border  border-gray-200  dark:border-gray-600 rounded-md shadow-lg mt-2 py-2 w-72 z-50">
                  <div className="flex  flex-row justify-between p-2">
                    <h4 className="text-gray-400  dark:border-gray-300">Group By</h4>
                    <span onClick={() => setIsGroupBy(false)}><FontAwesomeIcon icon={faXmark} className="hover:text-blue-500" /></span>
                  </div>
                  <div className="my-1 bg-gray-400 dark:bg-gray-700 h-[1px]"></div>
                  <button className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200  hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-500" onClick={() => handleGroupBy("status")}>
                    Status
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200  hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-500" onClick={() => handleGroupBy("priority")}>
                    Priority
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200  hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-500" onClick={() => handleGroupBy("assignee")}>
                    Assignee
                  </button>

                </div>
              )}
            </div>

            <div className="relative">
              <button className={`text-gray-500 p-2 rounded-md dark:text-gray-300 hover:bg-blue-100 hover:text-blue-500 dark:hover:text-blue-400 ${isSearchOpen ? "bg-blue-100 !text-blue-500" : ""}`} onClick={() => { setSearchOpen(!isSearchOpen); setIsGroupBy(false) }}>
                <span className="p-1">
                  <FontAwesomeIcon icon={faSearch} />
                </span>
                <span className="hidden md:inline lg:inline">Search</span>
                <span onClick={(e) => { e.stopPropagation(); setSearchOpen(false) }}><FontAwesomeIcon icon={faXmark} className={`absolute -top-1 -right-2 bg-gray-400 text-white p-1 w-3 h-3 rounded-3xl tex-xs hover:bg-gray-500 z-10 ${!isSearchOpen ? "hidden" : ""}`} /></span>
              </button>
              {isSearchOpen && (
                <div className="absolute -left-10 md:left-0 bg-white dark:bg-gray-800 border border-gray-200  dark:border-gray-600 rounded-md shadow-lg mt-2 w-72 z-50">
                  <div className="p-4 flex items-center rounded-md px-4 duration-300 cursor-pointer bg-white dark:bg-gray-500 text-black">
                    <FontAwesomeIcon icon={faSearch} className="text-sm dark:text-gray-100" />
                    <input
                      type="text"
                      placeholder="Search tasks"
                      className="ml-4 w-full bg-transparent focus:outline-none dark:text-white"
                      onChange={handleTaskSearch}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* Icons */}
          <div className="flex items-center gap-2">
            <Link to={`/team-management/${props.projectname}`}>
              {" "}
              <button className="bg-gray-200 dark:bg-gray-400 text-blue-500 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-100 hover:text-blue-500">
                <span className="p-1">
                  <FontAwesomeIcon icon={faUsers} />
                </span>
              </button>
            </Link>
            {currentUserId === projectManagerId && (
              <button
                className="bg-gradient-to-r from-blue-400 to-blue-900 text-white p-2 rounded-md"
                onClick={props.openAddTask}
              >
                <span className="p-1">
                  <FontAwesomeIcon icon={faAdd} />
                </span>
                <span className="hidden md:inline lg:inline">Add Task</span>
              </button>
            )}

            <button className="py-2 px-5 hover:bg-blue-100 hover:text-blue-500 dark:hover:text-blue-400 dark:text-gray-100 rounded-md" onClick={() => { setIsMenuOpen(!isMenuOpen); setIsExportSubmenuOpen(false) }}>
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>
          </div>
          {isMenuOpen && (
            <div className="absolute bg-white dark:bg-gray-700 rounded-md shadow-lg -mb-48 mr-6 right-0 z-10 border ">
              {/* Import Option */}
              <label className="w-full px-8 p-2 py-3 text-gray-600 dark:text-white dark:hover:text-blue-500 hover:bg-blue-100 hover:text-blue-500 cursor-pointer flex items-center">
                <span className="mr-3"><FontAwesomeIcon icon={faFileImport} /></span>Import
                <input type="file" accept=".xlsx, .xls" onChange={(e) => handleImport(e, setImportTasks)} className="hidden" />
              </label>
              <div className="border-b mt-1"></div>
              <div className="relative">
                <p
                  className="w-full px-8 p-2 py-3 text-gray-600 dark:text-white dark:hover:text-blue-500 hover:bg-blue-100 hover:text-blue-500 flex items-center cursor-pointer"
                  onClick={() => setIsExportSubmenuOpen(!isExportSubmenuOpen)}
                >
                  <span className="mr-3"><FontAwesomeIcon icon={faFileExport} /></span>Export
                </p>

                {/* Export Submenu */}
                {isExportSubmenuOpen && (
                  <div className="absolute right-full top-0 mt-2 bg-white border text-black dark:text-white dark:bg-gray-700 shadow-lg rounded-md w-32">
                    <p className="px-4 py-2  hover:bg-blue-100 hover:text-blue-500 cursor-pointer" onClick={() => { setIsMenuOpen(false); setIsExportSubmenuOpen(false); handleExportPDF(taskList, props.projectname) }}>
                      <FontAwesomeIcon icon={faFilePdf} className="mr-2" /> PDF
                    </p>
                    <p className="px-4 py-2 hover:bg-blue-100 hover:text-blue-500 cursor-pointer " onClick={() => { setIsMenuOpen(false); setIsExportSubmenuOpen(false); handleExportExcel(taskList) }}>
                      <FontAwesomeIcon icon={faFileExcel} className="mr-2" /> Excel
                    </p>

                  </div>
                )}
              </div>

              <div className="border-b mt-1"></div>
              <p className="w-full px-8 p-2 py-3 text-gray-600 dark:text-white dark:hover:text-blue-500 hover:bg-blue-100 hover:text-blue-500 cursor-pointer flex items-center" onClick={() => { toggleRangeSelector(true); setIsMenuOpen(false); setIsExportSubmenuOpen(false) }}>
                <span className="mr-3"><FontAwesomeIcon icon={faFileArrowDown} /></span>Project Report
              </p>

            </div>
          )}
        </div>
      )}

      {props.page === "team_management" && (
        <div className="bg-gray-100 dark:bg-gray-700 shadow-md py-3 px-4 flex justify-between items-center sticky top-0">
          {/* Left Section */}
          <div className="flex flex-row gap-1 font-semibold text-gray-800">

            {/* Filter Button */}
            <div className="relative">
              <button
                className={`p-2 rounded-md transition-all duration-300 ${props.isFilterVisible
                  ? "bg-blue-100 text-blue-500 dark:bg-gray-700 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-500 dark:hover:text-blue-400"
                  }`}
                onClick={props.openFilter}
              >
                <span className="p-1">
                  <FontAwesomeIcon icon={faFilter} />
                </span>
                <span className="hidden md:inline lg:inline mr-4">Filter</span>
              </button>

              {/* Close (X) Icon when Filter is Visible */}
              {props.isFilterVisible && (
                <button
                  className="absolute -top-2 -right-2 bg-gray-400 text-white p-1 rounded-3xl text-xs hover:bg-gray-500 h-6 w-6"
                  onClick={handleCloseFilter}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>
            <div className="p-2.5 flex items-center rounded-full px-4 duration-300 cursor-pointer bg-gray-200 dark:bg-gray-500  w-[70%] ml-2 ">
              <FontAwesomeIcon
                icon={faSearch}
                className="text-sm text-gray-500 dark:text-gray-200"
              />
              <input
                type="text"
                placeholder="Search"
                onChange={handleSearchChange} // Call the function passed via props
                className="text-[15px] ml-7 w-full bg-transparent focus:outline-none text-gray-500 dark:text-white"
              />
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2">
            {currentUserId === projectManagerId && (
              <button
                className="bg-gradient-to-r from-blue-400 to-blue-900 text-white p-2 rounded-md"
                onClick={props.openAddMember}
              >
                <span className="p-1">
                  <FontAwesomeIcon icon={faUserPlus} />
                </span>
                <span className="hidden md:inline lg:inline">Add Member</span>
              </button>
            )}

          </div>
        </div>
      )}
      {props.page === "notification-settings" && (
        <div className="bg-gray-100 dark:bg-gray-700 shadow-md py-3 px-4 flex justify-between items-center sticky top-0 z-40 mb-4">
          {/* Left: Header title */}
          <div className="font-semibold dark:text-white text-gray-800 text-sm lg:text-xl md:text-lg">
            Notification Settings
          </div>
          {/* Right: Global Toggle Buttons */}
          <div className="flex justify-end dark:text-white space-x-4 sm:space-x-8 md:space-x-16 lg:space-x-80 mr-4 sm:mr-8 md:mr-16 lg:mr-44">
            {["inApp", "email"].map((type) => (
              <div key={type} className="flex flex-col items-center">
                <label className="mr-2 font-bold capitalize">{type}</label>
                <button
                  onClick={() => props.toggleGlobalSetting(type)}
                  className={`relative w-10 h-5 rounded-full transition duration-300 ${(type === "inApp" ? props.globalInApp : props.globalEmail)
                    ? "bg-blue-500"
                    : "bg-gray-400 dark:bg-gray-500"
                    }`}
                >
                  <div
                    className={`absolute top-0.5 left-1 w-4 h-4 bg-white rounded-full transform transition duration-300 ${(type === "inApp" ? props.globalInApp : props.globalEmail)
                      ? "translate-x-5"
                      : "translate-x-0"
                      }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {props.page === "profile" && (
        <div className="bg-gray-100 dark:bg-gray-700 shadow-md py-3 px-4 flex justify-between items-center sticky top-0 z-40">
          {/* Left: Header title */}
          <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm lg:text-xl md:text-lg">
            {props.isAdmin ? "Hello Admin!" : "User Account"}
          </div>
          {/* Right: Global Toggle Buttons */}
        </div>
      )}

      {props.page === "notifications" && (
        <div className="bg-gray-100 dark:bg-gray-700 shadow-md py-3 px-4 flex justify-between items-center sticky top-0 z-40 mb-4">
          {/* Left: Header title */}
          <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm lg:text-xl md:text-lg">
            Notifications
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="text-gray-600 p-2 rounded-md hover:bg-blue-100 hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-500 dark:hover:bg-blue-100"
              onClick={() => props.clearNotifications()}
            >
              <FontAwesomeIcon icon={faTrash} /><span className="hidden ml-2 md:inline lg:inline">Clear</span>
            </button>

            {/* Mark All Read with Bell Icon */}
            <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-200 dark:hover:text-blue-500 dark:hover:bg-blue-100 p-2 rounded-md hover:bg-blue-100 hover:text-blue-500" onClick={props.markAllAsRead}>
              <FontAwesomeIcon icon={faBell} />
              <span>Mark all Read</span>
            </button>
          </div>
        </div>
      )}

      {rangeSelector && (
        <RangeSelector toggleRangeSelector={toggleRangeSelector} visibility={true} projectName={props.projectname}/>
      )}
    </>
  );
};

export default PageHeader;
