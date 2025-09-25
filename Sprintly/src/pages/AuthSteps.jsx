import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faEye, faEyeSlash, faSpinner } from "@fortawesome/free-solid-svg-icons";
import DarkModeToggle from "react-dark-mode-toggle";



export default function AuthSteps() {
  const location = useLocation();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(location.state?.email || "");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [experience, setExperience] = useState("");
  const [authMode, setAuthMode] = useState("email");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showAgreementPopup, setShowAgreementPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateOfJoining, setDateOfJoining] = useState("");
  const [highestDegree, setHighestDegree] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const [isLoading, setIsLoading] = useState(false);


  const [step, setStep] = useState(1);
  const totalSteps = 3;

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
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{}|;':",.<>?]).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateConfirmPassword = () => password === confirmPassword;

  const validateStep1 = () => {
    if (!name.trim() || !validateEmail(email) || !validatePhone(phone)) {
      toast.error("Please enter a valid name, email, and phone number.");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!validatePassword(password) || !validateConfirmPassword()) {
      toast.error("Please enter a valid password and make sure they match.");
      return false;
    }
    if (!agreeToTerms) {
      toast.error("You must agree to the terms and conditions.");
      return false;
    }
    return true;
  };

  const toggleAgreementPopup = () => {
    setShowAgreementPopup(!showAgreementPopup);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setAgreeToTerms(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start spinner

    try {
      if (validateEmail(email) && validatePassword(password)) {
        const response = await axios.post("http://localhost:5000/auth/login", {
          email,
          password,
        });

        const { success, message, user, token } = response.data;

        if (success) {
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token", token);
          nav("/home");
        } else {
          toast.error(message);
        }
      } else {
        toast.error("Validation failed. Please check your email and password format.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login. Please try again later.");
    } finally {
      setIsLoading(false); // Stop spinner
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (
      name.trim() &&
      validateEmail(email) &&
      validatePassword(password) &&
      validateConfirmPassword() &&
      validatePhone(phone) &&
      dateOfJoining.trim() &&
      highestDegree.trim() &&
      agreeToTerms
    ) {
      setLoading(true);
      try {
        const response = await axios.post("http://localhost:5000/auth/signup", {
          name,
          email,
          phone,
          password,
          dateOfJoining,
          highestDegree,
        });

        toast.success("OTP sent to email.");
        resetForm();
        nav("/VerifyOtp", { state: { email } });
      } catch (error) {
        if (
          error.response?.status === 400 &&
          error.response?.data?.message === "Email already exists."
        ) {
          toast.error("This email is already registered. Please use a different email.");
        } else {
          console.error("Error during registration:", error.response?.data || error);
          toast.error("An error occurred during registration. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Validation failed. Please complete all required fields.");
    }
  };
  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1 && !validateStep1()) return;
    if (step === 3 && !validateStep3()) return;
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSignup(e);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const [validations, setValidations] = useState({
    name: null,
    email: null,
    phone: null,
    password: null,
    confirmPassword: null,
  });

  //dynamic front end validation
  const validateField = (field, value) => {
    let isValid = false;

    switch (field) {
      case "name":
        isValid = value.trim() !== "";
        break;
      case "email":
        isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
        break;
      case "phone":
        isValid = /^[6-9]\d{9}$/.test(value);
        break;
      case "password":
        isValid = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{}|;':",.<>?]).{8,}$/.test(value);
        break;
      case "confirmPassword":
        isValid = value === password && password.length > 0;
        break;
      default:
        break;
    }

    setValidations((prev) => ({ ...prev, [field]: isValid }));
  };

  const renderValidationIcon = (field) => {
    if (validations[field] === null) return null;
    return validations[field] ? (
      <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 ml-2" size="lg" />
    ) : (
      <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 ml-2" size="lg" />
    );
  };

  if (showSplash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen ">
        <img src={isDarkMode ? "/SprintlyyLogo_3.png" : "/SprintlyyLogo_2.png"} alt="Anushtaan Logo" className="w-96 h-96 object-contain" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg w-full max-w-5xl p-4 md:p-6 lg:p-8 relative">
        <div className="absolute top-4 left-4 flex items-center gap-2">
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
          <h2 className="text-2xl font-bold mb-4">
            {authMode === "signup" ? "Create an Account" : "Welcome Back"}
          </h2>

          {authMode === "signup" && (
            <div className="flex justify-between items-center mb-6 w-full px-4">
              {[...Array(totalSteps)].map((_, index) => (
                <div key={index} className="flex items-center w-full">
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-white font-semibold ${step > index ? "bg-blue-600" : "bg-gray-300"
                      }`}
                  >
                    {index + 1}
                  </div>
                  {index < totalSteps - 1 && (
                    <div
                      className={`h-1 flex-grow mx-2 ${step > index + 1 ? "bg-blue-600" : "bg-gray-300"
                        }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {authMode === "email" ? (
            <form onSubmit={handleLogin}>
              <div className="relative w-full">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateField("email", e.target.value);
                  }}
                  className="w-full p-3 border rounded mb-2 pr-10"
                />
                <span className="absolute right-3 top-3">{renderValidationIcon("email")}</span>
              </div>
              <div className="relative w-full">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validateField("password", e.target.value);
                  }}
                  className="w-full p-3 border rounded mb-2 pr-10"
                />
                <span className="absolute right-3 top-3">{renderValidationIcon("password")}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <a href="/forgot-password" className="text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <motion.button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded mb-4"
                whileHover={{ scale: 1.05 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <FontAwesomeIcon icon={faSpinner} spin className="text-white text-lg" />
                ) : (
                  "Login"
                )}
              </motion.button>
            </form>
          ) : (
            <form>
              {step === 1 && (
                <div>
                  <h2 className="text-xl mb-4">Personal Information<span className="text-red-500">*</span></h2>
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        validateField("name", e.target.value);
                      }}
                      className="w-full p-3 border rounded mb-2 pr-10"
                    />
                    <span className="absolute right-3 top-3">{renderValidationIcon("name")}</span>
                  </div>
                  <div className="flex gap-4 mb-4 flex-col md:flex-row">
                    <div className="relative w-full">
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          validateField("email", e.target.value);
                        }}
                        className="w-full p-3 border rounded mb-2 pr-10"
                      />
                      <span className="absolute right-3 top-3">{renderValidationIcon("email")}</span>
                    </div>
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          validateField("phone", e.target.value);
                        }}
                        className="w-full p-3 border rounded mb-2 pr-10"
                      />
                      <span className="absolute right-3 top-3">{renderValidationIcon("phone")}</span>
                    </div>
                  </div>

                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-xl mb-4">Experience & Education<span className="text-red-500">*</span></h2>

                  <label htmlFor="dateOfJoining" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    id="dateOfJoining"
                    className="w-full p-3 border rounded mb-4"
                    value={dateOfJoining}
                    onChange={(e) => setDateOfJoining(e.target.value)}
                    min={new Date().toISOString().split("T")[0]} // Prevent past dates
                  />


                  <input
                    type="text"
                    id="highestDegree"
                    placeholder="Enter your highest degree"
                    className="w-full p-3 border rounded mb-4"
                    value={highestDegree}
                    onChange={(e) => setHighestDegree(e.target.value)}
                  />

                </div>
              )}




              {step === 3 && (
                <div>
                  <h2 className="text-xl mb-4">Password<span className="text-red-500">*</span></h2>
                  <div className="relative w-full">
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validateField("password", e.target.value);
                      }}
                      className="w-full p-3 border rounded mb-2 pr-10"
                    />
                    <span className="absolute right-3 top-3">{renderValidationIcon("password")}</span>
                  </div>

                  <div className="relative w-full">
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        validateField("confirmPassword", e.target.value);
                      }}
                      className="w-full p-3 border rounded mb-2 pr-10"
                    />
                    <span className="absolute right-3 top-3">{renderValidationIcon("confirmPassword")}</span>
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={() => setAgreeToTerms(!agreeToTerms)}
                      className="mr-2"
                    />
                    <span>
                      I agree to the
                      <button
                        type="button"
                        className="text-blue-500 underline"
                        onClick={toggleAgreementPopup}
                      >
                        Terms and Conditions
                      </button>
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between w-full mt-4">
                <motion.button
                  type="button"
                  onClick={handlePreviousStep}
                  disabled={step === 1}
                  className="w-1/2 bg-blue-600 text-white p-2 mb-2 m-2 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: step === 1 ? 1 : 1.05 }}
                >
                  Previous
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleNextStep}
                  className="w-1/2 bg-blue-600 text-white p-2 mb-2 m-2 rounded-lg cursor-pointer flex items-center justify-center"
                  whileHover={{ scale: loading ? 1 : 1.05 }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"
                        viewBox="0 0 24 24"
                      ></svg>
                      Processing...
                    </>
                  ) : step === totalSteps ? "Submit" : "Next"}
                </motion.button>
              </div>

            </form>
          )}

          <div className="text-center mt-4">
            {authMode === "signup" ? (
              <p className="text-gray-600">
                Already have an account?{" "}
                <span
                  className="text-blue-600 font-semibold cursor-pointer hover:underline"
                  onClick={() => setAuthMode("email")}
                >
                  Sign In
                </span>
              </p>
            ) : (
              <p className="text-gray-600">
                Don't have an account?{" "}
                <span
                  className="text-blue-600 font-semibold cursor-pointer hover:underline"
                  onClick={() => setAuthMode("signup")}
                >
                  Sign Up
                </span>
              </p>
            )}
          </div>

        </div>

        <div className="w-full md:w-1/2 bg-white flex items-center justify-center rounded-r-xl mt-4 md:mt-0">
          <img src="./login.jpg" alt="Illustration" className="w-full h-auto object-cover rounded-b-xl md:rounded-r-xl" />
        </div>

        {showAgreementPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
              <h2 className="text-xl font-bold mb-4">Terms and Conditions</h2>
              <p className="text-sm mb-4">
                By signing up, you agree to our terms and policies...
              </p>
              <button
                onClick={toggleAgreementPopup}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
