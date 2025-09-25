import React, { useState, useEffect } from "react";
import AddProject from "../Componentss/AddProject.jsx";
import Agenda from "../Componentss/Agenda.jsx";
import TaskList from "../Componentss/TaskList.jsx";
import PageHeader from "../Header/PageHeader.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TaskCalendar from "../Componentss/TaskCalendar.jsx";

const Home = () => {
  const nav = useNavigate();
  const [isAddProjectVisible, setAddProjectVisible] = useState(false);
  const currentUrl = window.location.pathname;

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(token);
    if (!token) {
      // toast.error('session expired');
      nav("/user-registration");
    }
  }, [nav]);

  const openAddProject = () => {
    setAddProjectVisible(true);
  };

  const closeAddProject = () => {
    setAddProjectVisible(false);
  };

  return (
    <div className="w-full overflow-x-hidden">
  <PageHeader page="home" openAddProject={openAddProject} />

  {currentUrl === "/home" ? (
  <div className="flex flex-col lg:flex-row gap-4 items-stretch w-full">
    {/* TaskList Column */}
    <div className="w-full lg:w-1/2 min-w-0">
      <TaskList name="home" addtask="yes" />
    </div>

    {/* Calendar Column with fix for +more visibility */}
    <div className="w-full lg:w-1/2 min-w-0">
      <div className="w-full h-full overflow-hidden">
        <TaskCalendar />
      </div>
    </div>
  </div>
) :
 currentUrl === "/my-tasks" ? (
    // Full-width task list
    <div className="w-full px-4">
      <TaskList name="home" addtask="no" />
    </div>
  ) : currentUrl === "/agenda" ? (
    // Full-width agenda/calendar
    <div className="w-full px-4">
      <TaskCalendar />
    </div>
  ) : null}

  {isAddProjectVisible && (
    <div className="fixed inset-0 z-50">
      <AddProject visiblity={isAddProjectVisible} close={closeAddProject} />
    </div>
  )}
</div>

  );
};

export default Home;
