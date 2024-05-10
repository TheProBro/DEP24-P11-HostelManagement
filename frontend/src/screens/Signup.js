import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import "../styles/tailwind.css";
import { Spinner } from "@material-tailwind/react";

const StudentSignup = () => {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showOTP, setShowOTP] = useState(false); 
  const [otp, setOtp] = useState(''); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isSignup=true;
  const backendUrl = process.env.REACT_APP_BASE_URL;

  const handleStudentNameChange = (event) => {
    setStudentName(event.target.value);
  };

  const handleStudentEmailChange = (event) => {
    setStudentEmail(event.target.value);
  };

  const handleStudentPasswordChange = (event) => {
    setStudentPassword(event.target.value);
  };

  const handleOtpChange = (event) => {
    setOtp(event.target.value);
  };

  const handleStudentSignup = async (event) => {
    event.preventDefault();

    if (showOTP) {
      // OTP verification stage
      setLoading(true);
      try {
        const response = await axios.post(`${backendUrl}/api/verify_otp`, {
          email: studentEmail,
          otp,
          is_signup: isSignup,
        }, {withCredentials: true});

        console.log(response);
        toast.success('OTP Verified');
        // Signup after successful verification
        await handleActualSignup();
      } catch (error) {
        console.error(error);
        toast.error('Invalid OTP');
      } finally {
        setLoading(false);
      }
    } else {
      // Send OTP stage
      setLoading(true);
      try {
        const response = await axios.post(
          `${backendUrl}/api/send_otp`,
          {
            email: studentEmail,
            is_signup: isSignup,
          },
          { withCredentials: true }
        );

        console.log(response);
        toast.success('OTP Sent Successfully');
        setShowOTP(true);
      } catch (error) {
        console.error(error);
        toast.error('Error Sending OTP');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleActualSignup = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/signup`, {
        name: studentName,
        email: studentEmail,
        password: studentPassword,
        role: 'student',
      });

      console.log(response);
      toast.success('Student Signup Successful');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Signup Failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center my-20">
        {loading ? (
          <Spinner />
        ) : (
          <div className="w-full max-w-md p-6 bg-gray-100 bg-opacity-75 rounded shadow-md">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold">Register your Account</h2>
            </div>
            <form onSubmit={handleStudentSignup}>
              <div className="mb-4">
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={handleStudentNameChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Name"
                />
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={handleStudentEmailChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Email"
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  required
                  value={studentPassword}
                  onChange={handleStudentPasswordChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Password"
                />
              </div>
              {showOTP && (
                <div className="mb-4">
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={handleOtpChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="OTP"
                  />
                </div>
              )}
              <button
                type="submit"
                className="bg-color text-white px-4 py-2 rounded w-full"
              >
                {showOTP ? "Verify OTP" : "Send OTP"}
              </button>
            </form>
            <div className="mt-4 text-center">
              Already have an account?{" "}
              <NavLink to="/login" className="text-blue-500">
                Login
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSignup;

