import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from '../Components/Navbar/Navbar';
import { Link } from 'react-router-dom';
import { getAuth, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';

const InProgress = () => {

    const Text = "Feature In Progress";
    const Desc = "Sorry for inconvenience. This feature is currently under development. Please check back later for updates!";
    return (
        <>
            <Navbar />
            <div className="container-fluid" style={{ height: "100vh" }}>
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: "90vh" }}>

                    

                    <img
                        src="inprogress.png"
                        className="img-fluid w-25 w-md-70 my-3"
                        alt="image"
                    />
                    <p className="fw-bold fs-2">{Text}</p>
                    <p className="fw-light text-secondary">{Desc}</p>
                    <button
                          className="btn rounded-4 shadow fw-semibold w-50 w-md-25 text-nowrap responsive-font"
                          type="button"
                          style={{ backgroundColor: '#80BC44', color: '#fff' }}

                          onClick={() => window.location.href = '/categorizer'}>
                          <i className="bi bi-lightbulb-fill me-2"></i> Classify More
                        </button>

                </div>
            </div>
        </>
    );
};

export default InProgress;