import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';


const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [otpExpired, setOtpExpired] = useState(false);
  const [resending, setResending] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setOtpExpired(true); // OTP expired
    }
  }, [timer]);

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };


  const verifyOtp = async () => {
    if (!email || !otp) {
      toast.error("Please enter both email and OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/auth/verifyOTP", { email, otp });

      if (response.data.success) {
        toast.success(response.data.message);
        setTimeout(() => {
          navigate("/user-registration", { state: { email } });
        }, 2000);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      toast.error("Error verifying OTP: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP function
  const resendOtp = async () => {
    setResending(true);
    try {
      const response = await axios.post("http://localhost:5000/auth/resendOTP", { email });

      if (response.data.success) {
        toast.success("New OTP sent to your email.");
        setTimer(120); // Reset timer
        setOtpExpired(false); // Reset OTP expired state
        setMessage("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error resending OTP: " + (error.response?.data?.message || error.message));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg w-full max-w-5xl p-4 md:p-6 lg:p-8 relative">
        <div className="absolute top-4 left-4">
          <span className="relative w-48 h-48 block">
            <img
              src="./SprintlyyLogo_2.png"
              alt="Anushtaan Logo"
              className="w-full h-full object-contain animate-pulse" //should I add animate-pulse?
            />
            {/* Example shimmer overlay span */}
            <span className="absolute inset-0 bg-white opacity-10 rounded-full blur-md animate-ping"></span>
          </span>
        </div>

        <div className="w-full md:w-1/2 p-4 md:p-8 mt-20">
          <h2 className="text-2xl font-bold mb-6 text-center">Verify OTP</h2>

          <div className="flex flex-col space-y-4">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 border rounded mb-4"
              disabled
            />

            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full p-3 border rounded mb-4"
            />

            {otpExpired ? (
              <div className="text-red-600 text-center">
                OTP expired. <button onClick={resendOtp} disabled={resending} className="text-blue-600 underline ml-2">{resending ? "Resending..." : "Resend OTP"}</button>
              </div>
            ) : (
              <div className="text-center text-gray-600">OTP expires in: <span className="font-semibold">{formatTime(timer)}</span></div>
            )}

            <motion.button
              onClick={verifyOtp}
              className="w-full bg-blue-600 text-white p-3 rounded mb-4 hover:bg-white hover:text-black border-white hover:border-blue-600 border transition-all"
              whileHover={{ scale: 1.05 }}
              disabled={loading}
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin className="text-white text-lg" />
              ) : (
                "Verify"
              )}
            </motion.button>
          </div>

          {message && (
            <div
              className={`mt-4 p-4 text-sm rounded-lg ${message.includes("Error") ? "bg-red-100 text-red-700 border-red-200" : "bg-green-100 text-green-700 border-green-200"
                } border`}
            >
              {message}
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 bg-white flex items-center justify-center rounded-r-xl mt-4 md:mt-0">
          <img src="./login.jpg" alt="Illustration" className="w-full h-auto object-cover rounded-b-xl md:rounded-r-xl" />
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
