import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import Navbar from '../Components/Navbar/Navbar';
import GoogleLogin from '../Components/GoogleLogin';
import { auth } from '../firebase';
import "./Register.css";

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/categorizer");
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignup = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // At least 6 characters, at least one letter and one number capital and lowercase
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
   
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields!");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address!");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms of Service!");
      return;
    }
    if (!passwordRegex.test(password)) {
      setError("Password must contain at least one letter and one number!");
      return;
    }

    // Clear previous error
    setError('');


    try {
      // Create user with Firebase Authentication
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/categorizer"); // Redirect to the categorizer page after successful signup
    } catch (err) {
      console.error("Error signing up:", err);
      setError("Failed to create an account. Please try again.");
    }
  };

  return (
    <div className="d-flex flex-column vh-100">
      <Navbar />
      <main className="flex-fill">
        <div className="container-fluid h-100 p-0">
          <div className="row h-100 m-0">
            {/* Mobile Image */}
            <div className="col-12 col-md-7 d-block d-md-none">
              <img
                src="https://img.freepik.com/free-photo/used-plastic-bottles-recycling-bins-earth-day-campaign_53876-104848.jpg"
                alt="Recyclables"
                className="w-100 h-100 object-fit-cover"
              />
            </div>

            {/* Form Section */}
            <div className="col-12 col-md-5 d-flex flex-column justify-content-center align-items-center">
              <div style={{ width: "80%" }}>
                <p className="fw-bold fs-4">Welcome Back!</p>
                <p className="fw-light text-secondary">
                  Already have an account?{" "}
                  <Link to="/register" className="text-decoration-none fw-semibold text-muted">
                    Sign in now!
                  </Link>
                </p>

                <div className="row g-2 mb-2">
                  <GoogleLogin />
                </div>

                <div className="d-flex align-items-center">
                  <hr className="flex-grow-1 m-0" />
                  <p className="px-2 m-0 text-secondary">Or</p>
                  <hr className="flex-grow-1 m-0" />
                </div>

                {/* Email Input */}
                <div className="form-floating mb-1">
                  <input
                    type="email"
                    className="form-control form-control-sm mb-2 border-0 border-bottom"
                    id="email"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label htmlFor="email" className="text-muted" style={{ fontSize: "14px" }}>
                    Email
                  </label>
                </div>

                {/* Password Input */}
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control form-control-sm mb-2 border-0 border-bottom"
                    id="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label htmlFor="password" className="text-muted" style={{ fontSize: "14px" }}>
                    Password
                  </label>
                </div>

                {/* Confirm Password Input */}
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control form-control-sm mb-2 border-0 border-bottom"
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <label htmlFor="confirmPassword" className="text-muted" style={{ fontSize: "14px" }}>
                    Confirm Password
                  </label>
                </div>

                {/* Terms of Service */}
                <div className="form-check text-start mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="terms"
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <label className="form-check-label text-muted" htmlFor="terms">
                    I agree to the <span className="fw-bold">Terms of Service</span>.
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  className="btn rounded-3 col-12 mb-2"
                  style={{ backgroundColor: "#80BC44", color: "#fff" }}
                  onClick={handleSignup}
                >
                  Sign Up
                </button>

                {/* Error Message */}
                {error && <p className="fw-light text-danger text-start">{error}</p>}
              </div>
            </div>

            {/* Desktop Image */}
            <div className="col-12 col-md-7 p-0 d-none d-md-block">
              <img
                src="https://img.freepik.com/free-photo/used-plastic-bottles-recycling-bins-earth-day-campaign_53876-104848.jpg"
                alt="Recyclables"
                className="w-100 h-100 object-fit-cover"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;