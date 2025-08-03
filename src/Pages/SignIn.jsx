import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from '../Components/Navbar/Navbar';
import GoogleLogin from "../Components/GoogleLogin";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import "./SignIn.css";

const SignIn = () => {

  // State variable to manage error messages
  const [error, setError] = useState('');
  // State variable to manage redirection after login
  const navigate = useNavigate();
  // State variables for email, password
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  // Check if user is already logged in
  useEffect(() => {

    // Check if user is already logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/categorizer"); // Redirect if already logged in
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Function to handle login 
  const handleLogin = async () => {

    //email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression for email validation

    // Validate email and password
    if (email === "" || password === "") {
      setError("Please fill in all fields!");
      return;
    } 
    else if (!emailRegex.test(email)) {
      setError("Please enter a valid email address!");
      return;
    }
    else if (password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }
    // Clear previous error
    setError('');

    // Attempt to sign in with email and password
    try {

      // Sign in with Firebase Authentication
      await signInWithEmailAndPassword(auth, email, password); 
      console.log("User signed in successfully"); //Debugging line

      // Redirect to the categorizer page after successful login
      navigate("/categorizer");
    } catch (err) {
      console.error("Error signing in:", err); // Debugging line
      setError("Invalid email or password"); // Set error message for invalid credentials
    }
  };

  return (
    <>
      <div className="d-flex flex-column vh-100">
        <Navbar />
        <main className="flex-fill">
          <div className="container-fluid h-100 p-0">
            <div className="row h-100 m-0">
              {/* Left Image Section */}
              <div className="col-12 col-md-7 p-0">
                <img
                  src="https://img.freepik.com/free-photo/used-plastic-bottles-recycling-bins-earth-day-campaign_53876-104848.jpg?t=st=1744912132~exp=1744915732~hmac=22486357cfb1855af022c6fd4a7baa301610b26a825048aa1f845fbdb81d5f48&w=996"
                  alt="Recyclables"
                  className="w-100 h-100 object-fit-cover"
                />
              </div>

              {/* Right Form Section */}
              <div className="col-12 col-md-5 d-flex flex-column justify-content-center align-items-center">
                <div className="form-container" style={{ width: "80%" }}>
                  {/* Welcome Message */}
                  <p className="fw-bold fs-4 empty">Welcome Back!</p>
                  <p className="fw-light text-secondary f-9">
                    Don't have an account?{"  "}
                    <Link to="/register" className="text-decoration-none fw-semibold text-muted">
                      Create a new account now!
                    </Link>
                  </p>

                  {/* Google Login */}
                  <div className="row g-2 mb-2">
                    <GoogleLogin />
                  </div>

                  {/* Divider */}
                  <div className="d-flex align-items-center my-3">
                    <hr className="flex-grow-1 m-0" />
                    <p className="px-2 m-0 text-secondary f-9">Or</p>
                    <hr className="flex-grow-1 m-0" />
                  </div>

                  {/* Email Input */}
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className="form-control form-control-sm border-0 border-bottom fs-9"
                      id="email-input"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                    />
                    <label htmlFor="email-input" className="text-muted" style={{ fontSize: "14px" }}>
                      Email
                    </label>
                  </div>

                  {/* Password Input */}
                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className="form-control form-control-sm border-0 border-bottom fs-9"
                      id="password-input"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleLogin();
                        }
                      }}
                    />
                    <label htmlFor="password-input" className="text-muted" style={{ fontSize: "14px" }}>
                      Password
                    </label>
                  </div>

                  {/* Error Message */}
                  {error && <p className="fw-light text-danger text-start f-9">{error}</p>}

                  {/* Sign In Button */}
                  <button
                    className="btn rounded-3 col-12 mb-3"
                    type="button"
                    style={{ backgroundColor: "#80BC44", color: "#fff" }}
                    onClick={handleLogin}
                  >
                    Sign in
                  </button>

                  {/* Forgot Password Link */}
                  <Link to="/forgot-password" className="text-decoration-none fw-semibold text-muted">
                    Forgot Password?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default SignIn;
