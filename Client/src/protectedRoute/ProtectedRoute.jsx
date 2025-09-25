import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const isTokenValid = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; 

    // If token is expired, clear storage immediately
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error decoding token:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }
};

const ProtectedRoute = () => {
  return isTokenValid() ? <Outlet /> : <Navigate to="/user-registration" />;
};

export default ProtectedRoute;
