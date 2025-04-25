import React from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import Navbar from '../Components/Navbar/Navbar'
import GoogleLogin from "../Components/GoogleLogin"
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from "firebase/auth"

const SignIn = () => {

  // State variable to manage redirection after login
  const navigate = useNavigate();

  // State variables for email, password
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  // Function to handle login
  const handleLogin = async () => {
    // Check if email and password are not empty
    if (email === "" || password === "") {
      alert("Please fill in all fields!")
      return
    }
    // Attempt to sign in with email and password
    try {

      await signInWithEmailAndPassword(auth, email, password)
      console.log("User signed in successfully") //Debugging line
      // Redirect to the categorizer page after successful login
      navigate("/categorizer")
    } catch (err) {
      console.error("Error signing in:", err)
    }
  }

  return (
    <>
    <div className="d-flex flex-column vh-100">
    <Navbar />
      <main className="flex-fill">
        <div className="container-fluid">
          <div className="row h-100">
            <div className="col-md-7 p-0">
              <img
                src="https://img.freepik.com/free-photo/used-plastic-bottles-recycling-bins-earth-day-campaign_53876-104848.jpg?t=st=1744912132~exp=1744915732~hmac=22486357cfb1855af022c6fd4a7baa301610b26a825048aa1f845fbdb81d5f48&w=996"
                alt="Recyclables"
                className="w-100 flex-fill object-fit-cover"
              />
            </div>
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
              <h4 className="fw-bold mb-2">Welcome Back!</h4>
              <p className="text-muted mb-4">
                Don't have account?{" "}
                <Link to="/register" className="text-decoration-none text-muted">
                  <strong>Create a new account now</strong>
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
              <button
                type="submit"
                className="btn w-100 mb-4"
                style={{ backgroundColor: "#80BC44", color: "#fff" }}
                onClick={handleLogin}
              >
                Sign In
              </button>
              <div className="mb-4 w-75 text-center">
                <GoogleLogin />
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
