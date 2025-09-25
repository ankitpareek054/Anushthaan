/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import AddTask from "../Componentss/AddTask.jsx";
import TaskList from "../Componentss/TaskList.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PageHeader from "../Header/PageHeader.jsx";
import Filter from "../Componentss/Filter.jsx";
import { Link, useParams } from "react-router-dom";
import { faChartGantt, faChartSimple, faList, faTableCellsLarge, faChartPie } from "@fortawesome/free-solid-svg-icons";
import Kanban from "../Componentss/Kanban.jsx";
import { useNavigate } from "react-router-dom";
import { TabularView } from "../Componentss/TabularView";
import { useSelector } from "react-redux";
import Gantt from "../Componentss/GanttDhtml.jsx";
import { is } from "date-fns/locale";


const ProjectPage = () => {
  const nav = useNavigate();
  const [isAddTaskVisible, setAddTaskVisible] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [isTabular, setTabular] = useState(false)
  const [isKanban, setIsKanban] = useState(false)
  const [isList, setIsList] = useState(true)
  const [isGnatt, setGantt] = useState(false)
  // const [isOverView, setOverView] = useState(false)
  const [isSummaryVisible, setSummaryVisible] = useState(false);


  // Dark-Mode
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
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
    const token = localStorage.getItem("token");
    if (!token) {
      nav("/user-registration");
    }
  }
    , [nav]);

  const openAddTask = () => {
    setAddTaskVisible(true);
  };


  const closeAddTask = () => {
    setAddTaskVisible(false);
  };

  const [isFilterOpen, setFilterOpen] = useState(false);
  const openFilter = () => {
    
    setFilterOpen(true);
  }
  

  const isKanAndGantt = () => {
    return isKanban || isGnatt;
  };
  
 

  const { title } = useParams();
  const handleSummary = () => {

    nav(`/overview/${title}`,{state:{page:"project-page"}});
  };
  // const openSummary = () => {
  //   nav(`/overview/${title}`);
  // };

  return (
    <div>
      <div className="h-full">
      
          <PageHeader page="project" openAddTask={openAddTask} openFilter={openFilter} projectname={title} taskList={taskList} isKanAndGantt={isKanAndGantt()} />
       
        <div className="w-full flex justify-between items-center  mt-3">

          {/* //view type options */}
          <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 p-2">
            <button className={`px-2 border-black border-r dark:border-white text-gray-500 hover:text-blue-400 dark:hover:text-blue-400 hover:bg-blue-100 ${isList ? "!text-blue-400 bg-blue-200 " : ""}`} title="List"
              onClick={() => { setIsList(true); setTabular(false); setIsKanban(false); setGantt(false) }}>
              <FontAwesomeIcon icon={faList} />
            </button>
            <button className={`px-2 border-black border-r dark:border-white text-gray-500 hover:text-blue-400 dark:hover:text-blue-400 hover:bg-blue-100 ${isTabular ? "!text-blue-400 bg-blue-100 " : ""}`} title="Tabular"
              onClick={() => { setIsList(false); setTabular(true); setIsKanban(false); setGantt(false); }}>
              <FontAwesomeIcon icon={faTableCellsLarge} />
            </button>
            <button className={`px-2 border-black border-r dark:border-white text-gray-500 hover:text-blue-400 hover:bg-blue-100 ${isKanban ? "!text-blue-400 bg-blue-100" : ""}`} title="Kanban"
              onClick={() => { setIsList(false); setTabular(false); setIsKanban(true); setGantt(false) }}><FontAwesomeIcon icon={faChartSimple} /></button>
            <button className={`px-2  text-gray-500 hover:text-blue-400 hover:bg-blue-100 ${isGnatt ? "!text-blue-400 bg-blue-100" : ""}`} title="Gantt"
              onClick={() => { setIsList(false); setTabular(false); setIsKanban(false); setGantt(true) }}><FontAwesomeIcon icon={faChartGantt} /></button>
          </div>
          <button className="text-gray-500 p-2 rounded-md bg-gray-200 dark:bg-gray-700 dark:dark:text-gray-300 hover:bg-blue-100 mb-2 hover:text-blue-500 dark:hover:text-blue-400" onClick={handleSummary}>
            <span className="p-1">
              <FontAwesomeIcon icon={faChartPie} />
            </span>
            <span className="hidden md:inline lg:inline">Summary</span>
          </button>
         
        </div>
        {isTabular &&

          <TabularView projectname={title} />
        }

        {isList &&

          <TaskList name="project" addtask="no" projectname={title} setTaskList={setTaskList} />
        }
        {isKanban &&
          <div className="max-h-[78vh] overflow-y-auto border-2 dark:border-gray-500 shadow rounded-lg dark:bg-gray-800">
            <Kanban />
          </div>
        }
        {isGnatt &&

          <Gantt projectname={title} />
        }

      </div>
      {isAddTaskVisible && (
        <div className="fixed inset-0 z-50 w-[60%]">
          <AddTask visiblity={isAddTaskVisible} close={closeAddTask} defaultProjectName={title} name="project" />
        </div>
      )}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 w-[60%]">
          <Filter visibility={isFilterOpen} close={() => setFilterOpen(false)} name="project" context="task_list" />
        </div>
      )}
      {isSummaryVisible && (
        <div className="fixed inset-0 z-50">
          <Summary visibility={isSummaryVisible} close={() => setSummaryVisible(false)} />
        </div>
      )}
    </div>
  );
};

export default ProjectPage;