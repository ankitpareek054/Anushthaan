/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Dashboard from "../Componentss/AdminComponents/Dashboard.jsx";
import KPISection from "../Componentss/AdminComponents/KPISection.jsx";
import Cards from "../Componentss/AdminComponents/Cards.jsx";
import PageHeader from "../Header/PageHeader.jsx";
// import PageHeader from "../Header/PageHeader";

const AdminPortal = () => {
  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Session expired");
      nav("/user-registeration"); // Redirect to login if no token
    }
  }, [nav]);


  return (
    <div className="admin-page ">
      <PageHeader page="profile" isAdmin/>
      <div className="content ">
        <div>
          <Dashboard />
        </div>
        
        <div className="grid md:grid-cols-[2fr_1.5fr] mt-2 grid-cols-1 gap-3">
          <KPISection />
        
          <Cards />
        </div>
      </div>
    </div>
  );
};


export default AdminPortal;

// import React, { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import PageHeader from "../Header/PageHeader";
// import Dashboard from "../Components/AdminComponents/Dashboard";
// import KPISection from "../Components/AdminComponents/KPISection";
// import Cards from "../Components/AdminComponents/Cards";

// const AdminPortal = () => {
//   const nav = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       toast.error("Session expired");
//       nav("/user-registeration");
//     }
//   }, [nav]);

//   return (
//     <div className="admin-page min-h-screen bg-gray-100">
//       {/* Page Header */}
//       <PageHeader page="admin" />

//       {/* Main Content Section */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
//         {/* Welcome + Overview */}
//         <section>
//           <Dashboard />
//         </section>

//         {/* KPI Summary */}
//         <section className="mt-4">
//           <KPISection />
//         </section>

//         {/* Management Cards */}
//         <section className="mt-4">
//           <Cards />
//         </section>
//       </div>
//     </div>
//   );
// };

// export default AdminPortal;
