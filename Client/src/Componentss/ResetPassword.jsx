import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { id, token } = useParams();
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleReset = async () => {
    if (!password || !cPassword) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (!validatePassword(password)) {
      toast.error(
        'Password must be at least 8 characters long, start with a capital letter, and contain alphabets, digits, and special characters.'
      );
      return;
    }

    if (password !== cPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/auth/reset-password/${id}/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          toast.success('Password updated successfully.');
          setTimeout(() => navigate('/user-registration'), 2000); // Redirect after 2 seconds
        } else {
          toast.error('Invalid reset token.');
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex bg-white rounded-xl shadow-lg w-full max-w-5xl p-4 md:p-6 lg:p-8 relative">
        {/* Top-left logo (image only, enlarged) */}
        <div className="absolute top-4 left-4">
          <span className="relative w-48 h-48 block">
            <img
              src="/SprintlyyLogo_2.png"
              alt="Anushtaan Logo"
              className="w-full h-full object-contain animate-pulse" //should I add animate-pulse?
            />
            {/* Example shimmer overlay span */}
            <span className="absolute inset-0 bg-white opacity-10 rounded-full blur-md animate-ping"></span>
          </span>
        </div>
        <div className="w-1/2 p-8 mt-20">
          <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
          <p className="text-gray-600 mb-6">Create a new password for your account</p>
          <form>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded mb-4"
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={cPassword}
              onChange={(e) => setCPassword(e.target.value)}
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
              onClick={() => navigate('/user-registration')}
              className="w-full bg-gray-100 text-black p-3 rounded border border-gray-300"
              whileHover={{ color: 'black', scale: 1.05 }}
            >
              Back to Login
            </motion.button>
          </form>
        </div>
        <div className="w-1/2 bg-purple-200 flex items-center justify-center rounded-r-xl">
          <img src="/forgotPass.jpg" alt="Illustration" className="w-full h-full object-cover rounded-r-xl" />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
