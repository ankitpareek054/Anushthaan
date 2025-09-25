/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import AddSubTask from "./Componentss/AddSubTask.jsx";
import Filter from "./Componentss/Filter.jsx";
import ForgotPassword from "./Componentss/ForgotPassword.jsx";
import GanttDhtml from "./Componentss/GanttDhtml.jsx";
import Kanban from "./Componentss/Kanban.jsx";
import NavBar from "./Componentss/Nav.jsx";
import NotificationSettings from "./Componentss/NotificationSettings.jsx";
import ProjectDashboard from "./Componentss/ProjectDashboard.jsx";
import ResetPassword from "./Componentss/ResetPassword.jsx";
import TeamSheetReview from "./Componentss/TeamSheetReviewPanel.jsx";
import TimeSheet from "./Componentss/TimeSheet.jsx";
import VerifyOtp from "./Componentss/VerifyOtp.jsx";
import "./index.css";
import Home from "./pages/Home";
import Notifications from "./pages/Notifications";
import ProfilePage from "./pages/ProfilePage";
import ProjectPage from "./pages/ProjectPage";
import Summary from "./pages/Summary";
import AddMember from "./Componentss/AddMember.jsx";
import ProjectOverview from "./Componentss/ProjectOverview.jsx";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { List } from "@mui/material";
import AuthSteps from "./pages/AuthSteps";
import ProtectedRoute from "./protectedRoute/ProtectedRoute.jsx";
import TeamManagement from "./pages/TeamManagement.jsx";
import { useSelector } from "react-redux";
import AdminRequestManagement from "./pages/adminRequestManagement.jsx";
import AdminPortal from "./pages/AdminPortal.jsx";
import UserManagement from './pages/UserManagement.jsx';
//import SubmitTimer from "./Components/SubmitTimer";
//for admin project management
import AdminProjManagement from "./pages/AdminProjManagement.jsx";
import TaskCalendar from "./Componentss/TaskCalendar.jsx";


function App() {
  const location = useLocation();
  const nav = useNavigate();
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  

  // Hide nav bar on specific pages
  const hiddenNavPaths = ["/user-registration", "/VerifyOtp", "/reset-password", "/forgot-password"];
  const shouldHideNavBar = hiddenNavPaths.some((path) => location.pathname.startsWith(path));

  //redirecting user if token not exist
  useEffect(() => {
    const token = localStorage.getItem("token");
    const publicPaths = ["/forgot-password", "/reset-password", "/VerifyOtp"];

    // Allow access to reset-password even if token doesn't exist
    if (!token && !publicPaths.some((path) => location.pathname.startsWith(path))) {
      nav("/user-registration");
    }
  }, [nav, location.pathname]);
  
   useEffect(() => {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }, [isDarkMode]);
  

  return (
    <div className="flex flex-col lg:flex-row dark:bg-gray-700 h-screen">
      {!shouldHideNavBar && <NavBar />}
      <div className="flex-1 dark:bg-gray-800">
        <main className={` ${location.pathname==="/user-registration"? "p-0":"p-4"} dark:bg-gray-800`}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={<motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.5 }}><Navigate to="/home" /></motion.div>}
            />

            <Route path="/user-registration" element={<motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.5 }}><AuthSteps /></motion.div>} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/home"
                element={<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.5 }}><Home /></motion.div>
                }
              />
              <Route
                path="/team-management/:title"
                element={
                  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.5 }}>
                    <TeamManagement />
                  </motion.div>
                }
              />
              <Route path="/agenda" element={<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.5 }}><Home /></motion.div>} />
              <Route path="/kanban" element={<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 }}><Kanban /></motion.div>} />
              {/* <Route path="/ganttdhtml" element={<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.5 }}><GanttDhtml /></motion.div>} /> */}
              <Route path="/team-management" element={<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.5 }}><TeamManagement /></motion.div>} />
              <Route path="/project-page/:title" element={<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 }}><ProjectPage /></motion.div>} />
              <Route path="/profile" element={<motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.5 }}><ProfilePage /></motion.div>} />
              <Route path="/summary" element={<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.5 }}><Summary /></motion.div>} />

              <Route path="/notification" element={<motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.5 }}><Notifications /></motion.div>} />
              <Route path="/notification-settings" element={<motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.5 }}><NotificationSettings /></motion.div>} />
              <Route path="/my-tasks" element={<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.5 }}><Home /></motion.div>} />
              <Route path="/dashboard" element={<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.5 }}><ProjectDashboard /></motion.div>} />
              <Route path="/admin-request-management" element={<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.5 }}><AdminRequestManagement /></motion.div>} />
              
              {/*for project management*/}
              <Route path="/admin-project-management" element={<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.5 }}><AdminProjManagement /></motion.div>} />
              <Route path="/overview/:title" element={<ProjectOverview />} />


              <Route path="/admin-portal" element={<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.5 }}><AdminPortal /></motion.div>} />

              <Route path="/user-management" element={<motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.5 }}><UserManagement /></motion.div>} />




              <Route path="/teamSheetView" element={<TeamSheetReview />} />
            </Route>

            {/* Public Routes */}
            <Route path="/VerifyOtp" element={<motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.5 }}><VerifyOtp /></motion.div>} />
            <Route path="/reset-password/:id/:token" element={<motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.5 }}><ResetPassword /></motion.div>} />
            <Route path="/forgot-password" element={<motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.5 }}><ForgotPassword /></motion.div>} />
            <Route path="/timeSheet" element={<TimeSheet/>} />


          </Routes>
        </main>
      </div>
      <ToastContainer autoClose={3000} />
    </div>
  );
}

const AppWrapper = () => {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

export default AppWrapper;