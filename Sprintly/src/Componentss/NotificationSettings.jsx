import React, { useEffect, useState } from "react";
import PageHeader from "../Header/PageHeader.jsx";

const NotificationSettings = () => {
  const [projects, setProjects] = useState([]);
  const [projectSettings, setProjectSettings] = useState({});
  const [globalInApp, setGlobalInApp] = useState(true);
  const [globalEmail, setGlobalEmail] = useState(true);

  const users = localStorage.getItem("user");
  const parsedUser = users ? JSON.parse(users) : null;
  const userId = parsedUser?._id || null;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!userId) return;

        const response = await fetch(
          "http://localhost:5000/api/fetchProjectsById",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data || data.length === 0) return;

        setProjects(
          data.map((project) => ({ id: project._id, name: project.pname }))
        );

        const initialSettings = {};
        let allInAppEnabled = true;
        let allEmailEnabled = true;
        let allInAppDisabled = true;
        let allEmailDisabled = true;

        data.forEach((project) => {
          if (project.members[userId]) {
            const inApp = project.members[userId].notifyinApp;
            const email = project.members[userId].notifyinEmail;

            initialSettings[project._id] = { inApp, email };

            if (!inApp) allInAppEnabled = false;
            if (!email) allEmailEnabled = false;
            if (inApp) allInAppDisabled = false;
            if (email) allEmailDisabled = false;
          }
        });

        setProjectSettings(initialSettings);
        setGlobalInApp(
          allInAppEnabled ? true : allInAppDisabled ? false : globalInApp
        );
        setGlobalEmail(
          allEmailEnabled ? true : allEmailDisabled ? false : globalEmail
        );
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProject();
  }, [userId]);

  // Toggle Project Notification Settings
  const toggleProjectSetting = async (projectId, type) => {
    setProjectSettings((prev) => {
      const updatedSettings = {
        ...prev,
        [projectId]: {
          ...prev[projectId],
          [type]: !prev[projectId][type],
        },
      };

      // Check if all projects have the same setting
      const allEnabled = Object.values(updatedSettings).every((p) => p[type]);
      const allDisabled = Object.values(updatedSettings).every((p) => !p[type]);

      if (type === "inApp")
        setGlobalInApp(allEnabled ? true : allDisabled ? false : globalInApp);
      if (type === "email")
        setGlobalEmail(allEnabled ? true : allDisabled ? false : globalEmail);

      fetch(`http://localhost:5000/api/updateProjectSettings/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          notifyInApp: updatedSettings[projectId].inApp,
          notifyEmail: updatedSettings[projectId].email,
        }),
      }).catch((error) =>
        console.error("Error updating project settings:", error)
      );

      return updatedSettings;
    });
  };

  // Toggle Global Notification Settings
  const toggleGlobalSetting = async (type) => {
    const newValue = type === "inApp" ? !globalInApp : !globalEmail;

    if (type === "inApp") setGlobalInApp(newValue);
    else setGlobalEmail(newValue);

    setProjectSettings((prevSettings) =>
      Object.fromEntries(
        Object.entries(prevSettings).map(([id, settings]) => [
          id,
          { ...settings, [type]: newValue },
        ])
      )
    );

    try {
      await fetch("http://localhost:5000/api/updateGlobalSettings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          notifyInApp: type === "inApp" ? newValue : globalInApp,
          notifyEmail: type === "email" ? newValue : globalEmail,
        }),
      });
    } catch (error) {
      console.error("Error updating global settings:", error);
    }
  };

  return (
    <>
      <PageHeader
        page="notification-settings"
        globalInApp={globalInApp}
        globalEmail={globalEmail}
        toggleGlobalSetting={toggleGlobalSetting}
      />

      <div className="w-full max-w-9xl space-y-1 mx-auto">
        <div className="sticky top-0 left-0 bg-white z-10 w-full"></div>

        {/* Projects Table */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-300 dark:bg-gray-800 dark:border-gray-600">
          <div className="overflow-y-auto mt-3 max-h-[370px] md:max-h-[470px] lg:max-h-[470px] hidden-scrollbar">
            <table className="w-full table-fixed ">
              <thead
                className=" bg-gray-200 z-10  dark:bg-gray-500"
                //style={{ transform: "translateZ(0)" }}
              >
                <tr className="h-12 dark:bg-gray-800 dark:text-white border">
                  <th className="border border-gray-300  dark:border-gray-600 p-2">
                    Project Name
                  </th>
                  <th className="border border-gray-300  dark:border-gray-600 p-2">
                    In-App
                  </th>
                  <th className="border border-gray-300  dark:border-gray-600 p-2">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center text-gray-500 dark:text-gray-300 p-4"
                    >
                      No projects yet.
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr
                      key={project.id}
                      className="border border-gray-300 dark:odd:bg-gray-700 dark:even:bg-gray-800 odd:bg-white even:bg-gray-200"
                    >
                      <td className="border border-gray-300 dark:border-gray-500 p-2 dark:text-white">
                        {project.name}
                      </td>
                      {["inApp", "email"].map((type) => (
                        <td
                          key={type}
                          className="border border-gray-300 dark:border-gray-500 p-2 text-center"
                        >
                          <button
                            onClick={() =>
                              toggleProjectSetting(project.id, type)
                            }
                            className={`relative w-10 h-5 rounded-full transition duration-300 ${
                              projectSettings[project.id]?.[type]
                                ? "bg-blue-500"
                                : "bg-gray-400 dark:bg-gray-500"
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 left-1 w-4 h-4 bg-white rounded-full transform transition duration-300 ${
                                projectSettings[project.id]?.[type]
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationSettings;
