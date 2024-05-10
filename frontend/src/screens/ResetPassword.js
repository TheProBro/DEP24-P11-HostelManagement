import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Spinner } from "@material-tailwind/react";
import axios from "axios";
import { useAuth } from "../contexts/authContext";
import "../styles/tailwind.css";
import { toast } from 'react-toastify';

const WrongIcon = ({ wrapperClass }) => (
  <div className={wrapperClass}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  </div>
);

export const ResetPassword = ({ email }) => {
  const backendUrl = process.env.REACT_APP_BASE_URL;
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [virginity, setVirginity] = useState(true);
  const [errors, setErrors] = useState({
    minValueValidation: false,
    numberValidation: false,
    capitalLetterValidation: false,
  });
  const [displaySubmit, setDisplaySubmit] = useState(false);
  const [displayp2, setDisplayp2] = useState(false);
  useEffect(() => {
    if (
      Object.entries(errors).every(
        ([key, value]) => key === "isMatching" || value === true
      )
    ) {
      setDisplayp2(true);
    } else {
      setDisplayp2(false);
    }
    if (
      password === password2 &&
      Object.values(errors).every((err) => err === true)
    ) {
      if (Object.values(errors).every((err) => err === true)) {
        setDisplaySubmit(true);
      } else {
        setDisplaySubmit(false);
      }
    } else {
      setDisplaySubmit(false);
    }
  }, [errors]);
  const validatePassword = (password) => {
    setErrors({
      minValueValidation: password.length >= 8,
      numberValidation: /\d/.test(password),
      capitalLetterValidation: /[A-Z]/.test(password),
    });
  };
  const validatePassword2 = (password2) => {
    if (password !== password2 && password2.length > 0) {
      setErrors({
        ...errors,
        isMatching: false,
      });
    } else if (password === password2) {
      setErrors({
        ...errors,
        isMatching: true,
      });
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(email, password, password2);
    if (password !== password2) {
      toast.error("Passwords do not match");
      return;
    }
    axios
      .post(`${backendUrl}/api/reset_password`, {
        email: email,
        password: password,
      })
      .then((response) => {
        console.log(response);
        toast.success("Password Reset Successfully");
      });
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <input
          type="password"
          required
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            validatePassword(e.target.value);
          }}
          onFocus={() => setVirginity(false)}
          className="w-full p-2 rounded"
          placeholder="New Password"
        />
      </div>
      <div className="mb-4">
        <input
          type="password"
          required
          value={password2}
          onChange={(e) => {
            setPassword2(e.target.value);
            validatePassword2(e.target.value);
          }}
          className="w-full p-2 rounded border border-gray-300 focus:bg-color"
          placeholder="Confirm Password"
          disabled={!displayp2}
          style={{ borderColor: password === password2 ? "gray" : "red" }}
        />
      </div>
      {Object.entries(errors).map(
        ([key, value]) =>
          !value && !virginity && (
            <div
              key={key}
              className={`flex items-center gap-4 my-6 ${"opacity-100"}`}
            >
              <WrongIcon wrapperClass="w-4 h-auto text-red-500" />
              <p className="text-base font-medium text-red-500">
                {key === "minValueValidation" &&
                  "Password must be at least 8 Characters"}
                {key === "numberValidation" &&
                  "Password must have at least one Number"}
                {key === "capitalLetterValidation" &&
                  "Password must have at least one Capital Letter"}
                {key === "specialCharacterValidation" &&
                  "Password must have at least one Special Character"}
                {key === "isMatching" && "Passwords do not match"}
              </p>
            </div>
          )
      )}
      <button
        type="submit"
        className="bg-color text-white px-4 py-2 rounded w-full disabled:bg-gray-800 disabled:cursor-not-allowed"
        disabled={!displaySubmit}
        onSubmit={handleSubmit}
      >
        Reset Password
      </button>
    </form>
  );
};

const StudentSignup = () => {
  const backendUrl = process.env.REACT_APP_BASE_URL;
  const { currentUser } = useAuth();
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStudentEmailChange = (event) => {
    setStudentEmail(event.target.value);
  };

  const handleStudentPasswordChange = (event) => {
    setStudentPassword(event.target.value);
  };

  const handleStudentSignup = (event) => {
    event.preventDefault();
    if (showOTP) {
      //   console.log('Student Email:', studentEmail, 'Student Password:', studentPassword);
      axios
        .post(`${backendUrl}/api/verify_otp`, {
          email: studentEmail,
          otp: studentPassword,
        })
        .then((response) => {
          console.log(response);
          toast.success("OTP Verified");
          // navigate('/password_reset', {state: {email: studentEmail}});
          setShowPassword(true);
        });
    } else {
      console.log("Student Email:", studentEmail);
      setLoading(true);
      axios
        .post(
          `${backendUrl}/api/send_otp`,
          {
            email: studentEmail,
          },
          { withCredentials: true }
        )
        .then((response) => {
          console.log(response);
          toast.success("OTP Sent Successfully");
          setShowOTP(true);
          setLoading(false);
        });
    }
  };
  useEffect(() => {
    if (currentUser) {
      setShowPassword(true);
    }
  }, [currentUser]);
  return (
    <div>
      <div className="flex items-center justify-center my-20">
        {loading ? (
          <Spinner />
        ) : (
          <div className="w-full max-w-md p-6 bg-gray-100 bg-opacity-75 rounded shadow-md">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold">Forgot Password?</h2>
            </div>
            {showPassword ? (
              <ResetPassword email={studentEmail} />
            ) : (
              <form onSubmit={handleStudentSignup}>
                {/* <div className="mb-4">
        <input
          type="text"
          required
          value={studentName}
          onChange={handleStudentNameChange}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Name"
        />
      </div> */}
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
                {showOTP && (
                  <div className="mb-4">
                    <input
                      type="password"
                      required
                      value={studentPassword}
                      onChange={handleStudentPasswordChange}
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
            )}
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
