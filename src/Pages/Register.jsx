import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from '../Components/Navbar/Navbar';
import { Link } from 'react-router-dom';
import GoogleLogin from '../Components/GoogleLogin';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useState } from 'react';

const Register = () => {

    // State variables for email, password, and confirm password
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Function to handle signup
    const handleSignup = async () => {
       
        // Check if password and confirm password match
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        // Check if email and password are not empty
        if (email === "" || password === "") {
            alert("Please fill in all fields!");
            return;
        }
        // Check if password length is at least 6 characters
        if (password.length < 6) {
            alert("Password must be at least 6 characters long!");
            return;
        }
        // Attempt to create a new user with email and password
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        }
        catch (err) {
            console.error("Error signing up:", err);
        }
    }
    return (
        <>
            <Navbar />
            <div className="container-fluid vh-100">
                <div className="row h-100">
                    <div className="col-md-5 d-flex flex-column justify-content-center align-items-center p-5">
                        <div className="mb-4 w-50">
                            <div
                                style={{
                                    backgroundColor: "#e0e0e0",
                                    height: "80px",
                                    width: "100%",
                                }}
                            ></div>
                        </div>
                        <h4 className="fw-bold mb-2">Welcome!
                        </h4>
                        <p className="text-muted mb-4">
                            Already have an account?{" "}
                            <Link to="/signin" className="text-decoration-none text-muted">
                                <strong>Sign in now</strong>
                            </Link>
                        </p>
                        <input
                            type="email"
                            placeholder="test@gmail.com"
                            className="form-control mb-3"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="form-control mb-4"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Repeat Your Password"
                            className="form-control mb-4"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="btn w-100 mb-4"
                            style={{ backgroundColor: "#80BC44", color: "#fff" }}
                            onClick={handleSignup}
                        >
                            Sign Up
                        </button>
                        <div className="mb-4 w-75 text-center">
                            <GoogleLogin />
                        </div>
                    </div>
                    <div className="col-md-7 p-0">
                        <img
                            src="https://img.freepik.com/free-photo/used-plastic-bottles-recycling-bins-earth-day-campaign_53876-104848.jpg?t=st=1744912132~exp=1744915732~hmac=22486357cfb1855af022c6fd4a7baa301610b26a825048aa1f845fbdb81d5f48&w=996"
                            alt="Recyclables"
                            className="w-100 h-100 object-fit-cover"
                        />
                    </div>
                </div>
            </div>

        </>
    )
}

export default Register