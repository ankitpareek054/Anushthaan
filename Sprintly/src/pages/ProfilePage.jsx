import axios from "axios";
import { useEffect, useState } from "react";
import { FaCamera, FaSpinner } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Select from "react-select"; // Import react-select
import PageHeader from "../Header/PageHeader.jsx";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [reason, setReason] = useState("");

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

  const fetchPresignedUrl = async (profilePicUrl) => {
    try {
      const fileName = profilePicUrl;
      const response = await axios.post(`http://localhost:5000/api/getPresignedUrls/${fileName}`);
      if (response.status === 200) {
        setUrl(response.data.presignedUrl);
        setUser((prevUser) => ({ ...prevUser }));
      } else {
        console.log("Error fetching presigned URL:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching presigned URL:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        toast.error("Session expired..");
        nav("/user-registration");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      const response = await axios.post(
        `http://localhost:5000/api/getUser/${parsedUser.email}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const { _id, createdAt, updatedAt, __v, email, profilePicUrl, ...filteredUser } = response.data.user;
        if (profilePicUrl) {
          fetchPresignedUrl(profilePicUrl);
        }
        setFormData(filteredUser);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/getUsers");
        if (response.data.success) {
          setAllUsers(response.data.users);
        } else {
          console.log(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUserData();
    fetchAllUsers();
  }, [nav]);

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const token = localStorage.getItem("token");
        const fileName = user.profilePicUrl;
        const fileNamesArray = Array.isArray(fileName) ? fileName : [fileName];

        if (fileNamesArray.length > 0) {
          try {
            await axios.delete("http://localhost:5000/api/deleteFilesS3", {
              data: { fileUrls: fileNamesArray },
            });
          } catch (error) {
            console.error("Error deleting files:", error);
          }
        }

        const response = await axios.post('http://localhost:5000/api/upload', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        });

        if (response.data.message === "Files uploaded successfully!") {
          const imageName = response.data.urls[0].fileName;

          const updateResponse = await axios.post("http://localhost:5000/auth/updateUserProfilePic",
            { email: user.email, profilePicUrl: imageName },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (updateResponse.data.success) {
            const updatedUser = { ...user, profilePicUrl: imageName };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            fetchPresignedUrl(imageName);
          }
          handleSave();
        } else {
          toast.error('Error updating profile picture');
        }
      } catch (error) {
        toast.error('Error uploading profile picture');
      }
    }
  };

  const handleEdit = (field) => setEditingField(field);

  const handleSelectChange = (selectedOption) => {
    setFormData({ ...formData, reportTo: selectedOption ? selectedOption.value : "" });
  };

  const handleSave = async () => {
     // ✅ Validate experience (should be a non-negative number)
  if (
    formData.experience &&
    (!/^\d+(\.\d+)?$/.test(formData.experience) || parseFloat(formData.experience) < 0)
  ) {
    toast.error("Experience must be a non-negative number.");
    return;
  }
 
    // Validation for phone number (10-digit basic example)
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      toast.error("Phone number must be a valid 10-digit number.");
      return;
    }
 
    const updatedUser = { ...user, ...formData, id: user._id };
 
    try {
      const response = await axios.post("http://localhost:5000/api/updateUser", updatedUser);
      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        toast.success("Profile updated successfully!");
        setEditingField(null);
      } else {
        console.log("Error updating user:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };
 

  const handleCancel = () => {
    setEditingField(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    nav("/user-registration");
  };

  const handleRequestAdminAccess = async () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason for requesting admin access.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/requests/create_admin_access_request", {
        userID: user._id,
        reason,
      });

      if (response.data.success) {
        toast.success("Admin access request sent successfully!");
      } else {
        toast.error(response.data.message || "Failed to send request");
      }
    } catch (error) {
      toast.error("Error sending request. Please try again later.");
    } finally {
      setLoading(false);
      setShowPopup(false);
      setReason("");
    }
  };

  if (!user) {
    return <p className="text-center mt-10 dark:text-gray-200">Loading...</p>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <>
      <PageHeader page="profile" />
      <div className="bg-white shadow-lg rounded-lg p-6 w-full mt-4 border border-gray-300 dark:bg-gray-800 dark:border-gray-600">
        <div className="md:flex md:items-center md:space-x-6">
          <div className="relative w-24 h-24 md:w-32 md:h-32 bg-blue-400 rounded-full flex-shrink-0 flex items-center justify-center text-4xl font-bold text-white mx-auto md:mx-0">
            {url ? (
              <img
                src={url}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              className="hidden"
              id="profilePicInput"
            />
            <button
              onClick={() => document.getElementById("profilePicInput").click()}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition duration-200"
            >
              <FaCamera className="text-white text-2xl" />
            </button>
          </div>
          <div className="mt-4 md:mt-0">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{user.name || "N/A"}</h2>
            <p className="text-gray-500 dark:text-gray-100">{user.email || "N/A"}</p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {Object.entries(formData).map(([field, value]) => (
            <div key={field} className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center w-full">
                <label className="text-gray-700 dark:text-gray-200 font-medium capitalize min-w-[120px]">
                  {field}:
                </label>
                {field === "adminAccess" ? (
                  <input
                    type="text"
                    value={value ? "Granted" : "Not Granted"}
                    readOnly
                    className="w-full sm:w-64 px-3 py-2 rounded-lg dark:bg-gray-800 dark:text-white transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:shadow-lg focus:outline-none border-gray-300 bg-white"
                  />
                ) : field === "reportTo" ? (
                  <div className="w-full sm:w-auto flex-grow">
                    <Select
                      options={allUsers
                        .filter(u => u.email !== user?.email)
                        .map(u => ({ value: u.email, label: `${u.name} (${u.email})` }))}
                      value={allUsers.find(u => u.email === formData.reportTo && u.email !== user?.email)
                        ? { value: formData.reportTo, label: `${allUsers.find(u => u.email === formData.reportTo)?.name} (${formData.reportTo})` }
                        : null}
                      onChange={handleSelectChange}
                      isSearchable
                      isDisabled={editingField !== "reportTo"}
                      placeholder="Select Supervisor"
                      className="w-65 sm:w-96"
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      menuPlacement="bottom"// Prevents layout shift
                    />
                  </div>
                ) : (
<div className="flex items-center space-x-2 w-full sm:w-64">
  {field === "experience" ? (
    <input
      type="text"
      name={field}
      value={formData[field]}
      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
      readOnly={editingField !== field}
      className={`w-10 px-2 py-1 rounded-lg border dark:bg-gray-800 dark:text-white transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:shadow-lg focus:outline-none ${editingField === field ? "border-gray-300 bg-white dark:bg-gray-600" : "border-none bg-transparent"}`}
    />
  ) : (
    <input
      type="text"
      name={field}
      value={formData[field]}
      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
      readOnly={editingField !== field}
      className={`flex-grow px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:shadow-lg focus:outline-none ${editingField === field ? "border-gray-300 bg-white dark:bg-gray-600" : "border-none bg-transparent"}`}
    />
  )}
  {field === "experience" && (
    <span className="text-gray-700 dark:text-gray-300 ml-1">years</span>
  )}
</div>




                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-x-2 sm:space-y-0">
                {editingField === field ? (
                  <>
                    <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                      Save
                    </button>
                    <button onClick={handleCancel} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                      Cancel
                    </button>
                  </>
                ) : field === "adminAccess" ? (
                  <button
                    disabled={value}
                    onClick={() => setShowPopup(true)}
                    className={`px-4 py-2 rounded-lg border transition duration-200 ${value ? "bg-gray-400 text-white cursor-not-allowed border-gray-400" : "bg-blue-500 text-white hover:bg-blue-600 border-blue-500"}`}
                  >
                    Request
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingField(field)}
                    className="px-4 py-2 rounded-md border bg-white dark:bg-gray-600 dark:text-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-400"
                  >
                    Update
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center mt-2">
          <button onClick={handleLogout} className="px-6 py-2 text-white bg-red-500 rounded-lg shadow-lg hover:bg-red-600 transition duration-300">
            Logout
          </button>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 m-2 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Request Admin Access</h2>

            <div className="mt-3">
              <label className="text-gray-700 dark:text-gray-300 font-medium">Name:</label>
              <input
                type="text"
                value={user?.name || ""}
                readOnly
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="mt-3">
              <label className="text-gray-700 dark:text-gray-300 font-medium">Email:</label>
              <input
                type="text"
                value={user?.email || ""}
                readOnly
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="mt-3">
              <label className="text-gray-700 dark:text-gray-300 font-medium">Reason:</label>
              <textarea
                className="w-full h-24 p-2 mt-1 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white"
                placeholder="Enter your reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              ></textarea>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={handleRequestAdminAccess}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
