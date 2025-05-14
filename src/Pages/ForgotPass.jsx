import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from '../Components/Navbar/Navbar';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import "./ForgotPass.css";

const ForgotPassword = () => {

  // State variables to manage email, error messages, title and description
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [title, setTitle] = useState('Forgot Your Password');
  const [desc, setDesc] = useState('Enter your email so that we can send you a password reset link');

  // Function to handle password reset
  const handlePasswordReset = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate email
    if (!email) {
      setError("Please enter your email!");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address!");
      return;
    }

    // Clear previous error
    setError('');

    const auth = getAuth();
    try {

      // Send password reset email
      await sendPasswordResetEmail(auth, email,{
        url: 'http://localhost:5173/reset-password', // URL to redirect after password reset
        handleCodeInApp: true, // Set to true if you want to handle the code in your app
      });
      setTitle("We've sent you a password reset email"); // Update title
      setDesc("Please check your inbox and follow the instructions to reset your password."); // Update description
      setEmail(''); // Clear email input
    } catch (error) {
      console.error("Error sending password reset email:", error); // Debugging line
      setError("Failed to send password reset email. Please try again."); // Update error message
    }
  };

  return (
    <>
      <Navbar />
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
          <div className="card border-0 resizeCard">
            <div className="card-body d-flex flex-column align-items-center text-center w-100">
              <div id="page-ForPass" className="text-center">
                <i className="bi bi-robot" style={{ fontSize: "50px" }}></i>
                <p className="fw-bold fs-2">{title}</p>
                <p className="fw-light text-secondary f-9">{desc}</p>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control form-control-sm border-0 border-bottom"
                    id="email-input"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label htmlFor="email-input" className="f-9 text-muted">Email</label>
                </div>
                {error && <p className="fw-light text-danger f-9">{error}</p>}
                <button
                  className="btn rounded-3 col-12 mb-4"
                  style={{ backgroundColor: "#80BC44", color: "#fff" }}
                  onClick={handlePasswordReset}
                >
                  Send Email
                </button>
                <Link to="/signin" className="text-decoration-none fw-semibold text-muted">
                  <span className="f-9"><i className="bi bi-chevron-left"></i> Back to Login</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;