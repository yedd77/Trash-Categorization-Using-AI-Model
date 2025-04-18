import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from '../Components/Navbar/Navbar';
import GoogleLogin from "../Components/GoogleLogin";

const SignIn = () => {
  return (
    <>
      <Navbar />
      <div className="container-fluid vh-100">
        <div className="row h-100">
          <div className="col-md-7 p-0">
            <img
              src="https://img.freepik.com/free-photo/used-plastic-bottles-recycling-bins-earth-day-campaign_53876-104848.jpg?t=st=1744912132~exp=1744915732~hmac=22486357cfb1855af022c6fd4a7baa301610b26a825048aa1f845fbdb81d5f48&w=996"
              alt="Recyclables"
              className="w-100 h-100 object-fit-cover"
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
              <strong>Create a new account now</strong>
            </p>
            <form className="w-75">
              <input
                type="email"
                placeholder="test@gmail.com"
                className="form-control mb-3"
              />
              <input
                type="password"
                placeholder="Password"
                className="form-control mb-4"
              />
              <button
                type="submit"
                className="btn w-100 mb-4"
                style={{ backgroundColor: "#80BC44", color: "#fff" }}
              >
                Sign In
              </button>
            </form>
            <div className="mb-4 w-75 text-center">
              <GoogleLogin />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


export default SignIn;
