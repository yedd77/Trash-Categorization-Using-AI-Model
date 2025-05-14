import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from '../Components/Navbar/Navbar';
import { Link } from 'react-router-dom';
import { getAuth, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';

const ResetPass = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [title, setTitle] = useState('Change Password');
  const [desc, setDesc] = useState('Enter a new password to change.');
  const [passwordChanged, setPasswordChanged] = useState(false);

  const handlePasswordReset = async () => {
    const queryParameters = new URLSearchParams(window.location.search);
    const oobCode = queryParameters.get('oobCode');
    const auth = getAuth();

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{6,}$/;

    // Validate password
    if (!password || !confirmPassword) {
      setError("Please fill in all fields!");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }
    if (!passwordRegex.test(password)) {
      setError("Password must contain at least one letter and one number!");
      return;
    }
    if (!oobCode) {
      setError("Invalid or expired password reset code. Please try again.");
      return;
    }

    setError('');

    try {
      await verifyPasswordResetCode(auth, oobCode);
      await confirmPasswordReset(auth, oobCode, password);
      setTitle("Password Changed Successfully");
      setDesc("Your password has been changed successfully. You can now log in with your new password.");
      setPassword('');
      setConfirmPassword('');
      setPasswordChanged(true);
    } catch (error) {
      console.error("Error changing password:", error);
      setError("Invalid or expired password reset code. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container-fluid" style={{ height: "100vh" }}>
        <div className="d-flex justify-content-center align-content-center flex-wrap" style={{ minHeight: "90vh" }}>
          <div className="card border-0 resizeCard">
            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center w-100 empty">
              <div className="text-center" id="page-newPass">
                <div className="text-center">
                  <i className="bi bi-robot text-center" style={{ fontSize: "50px" }}></i>
                </div>
                <p className="fw-bold empty fs-2 text-center">{title}</p>
                <p className="fw-light text-secondary f-9 text-center">{desc}</p>

                {!passwordChanged && (
                  <>
                    <div className="form-floating mb-1">
                      <input
                        type="password"
                        className="form-control form-control-sm mb-2 border-0 border-bottom"
                        id="new-password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <label className="f-9 text-muted" htmlFor="new-password">
                        Enter your new password
                      </label>
                    </div>
                    <div className="form-floating mb-1">
                      <input
                        type="password"
                        className="form-control form-control-sm mb-2 border-0 border-bottom"
                        id="confirm-password"
                        placeholder="Re-enter Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handlePasswordReset();
                          }
                        }}
                      />
                      <label className="f-9 text-muted" htmlFor="confirm-password">
                        Re-enter your new password
                      </label>
                    </div>
                    {error && <p className="fw-light text-danger text-start f-9">{error}</p>}
                  </>
                )}

                {passwordChanged ? (
                  <Link to="/signin" className="f-9 col-12 rounded-3 mb-4 btn btn-signin text-decoration-none">
                    Return to Login Page
                  </Link>
                ) : (
                  <button
                    className="btn rounded-3 col-12 mb-3"
                    id="btn-2"
                    type="button"
                    style={{ backgroundColor: "#80BC44", color: "#fff" }}
                    onClick={handlePasswordReset}
                  >
                    Change Password
                  </button>
                )}

                {!passwordChanged && (
                  <div className="text-start">
                    <Link to="/signin" className="text-decoration-none fw-semibold text-muted">
                      <span className="f-9">
                        <i className="bi bi-chevron-left"></i> Return to Login Page
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPass;