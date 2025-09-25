import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const back = () => {
    navigate('/user-registration');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleReset = async () => {
    if (!email) {
      toast.error('Please enter your email.');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          toast.success('A reset link has been sent to your email.');
        } else {
          toast.error('Email not found in our database.');
        }
      } else {
        toast.error('An error occurred. Please try again later.');
      }
    } catch (error) {
      toast.error('Failed to connect to the server.');
    } finally {
      setLoading(false);
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
              className="w-full h-full object-contain animate-pulse"
            />
            {/* Example shimmer overlay span */}
            <span className="absolute inset-0 bg-white opacity-10 rounded-full blur-md animate-ping"></span>
          </span>
        </div>
        <div className="w-full md:w-1/2 p-4 md:p-8 mt-20">
          <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
          <p className="text-gray-600 mb-6">Enter your email address to reset your password</p>
          <form>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded mb-4"
              required
            />
            <motion.button
              type="button"
              onClick={handleReset}
              className="w-full bg-blue-600 text-white p-3 rounded mb-4"
              whileHover={{ scale: 1.05 }}
              disabled={loading}
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin className="text-white text-lg" />
              ) : (
                'Reset Password'
              )}
            </motion.button>
            <motion.button
              type="button"
              onClick={back}
              className="w-full bg-gray-100 text-black p-3 rounded border border-gray-300"
              whileHover={{ color: 'black', scale: 1.05 }}
            >
              Back to Login
            </motion.button>
          </form>
        </div>
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center rounded-r-xl mt-6 md:mt-0">
          <img
            src="./forgotPass.jpg"
            alt="Illustration"
            className="w-full h-auto object-cover rounded-b-xl md:rounded-r-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
