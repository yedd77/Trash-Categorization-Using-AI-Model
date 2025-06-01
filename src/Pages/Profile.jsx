import React, { useState, useEffect } from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import Navbar from '../Components/Navbar/Navbar'
import { auth } from '../firebase'
import { useNavigate, Link } from 'react-router-dom'
import { updateProfile } from 'firebase/auth'

const Profile = () => {
    const [username, setUsername] = useState('')
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)

    const handlelogout = () => {
        auth.signOut().then(() => {
            console.log("User signed out successfully.");
            navigate("/")
        }).catch((error) => {
            console.error("Error signing out: ", error);
        });
    }

    const handleUsernameChange = (newUsername) => {
        updateProfile(auth.currentUser, {
            displayName: newUsername
        }).then(() => {
            console.log("Username updated successfully.");
            window.location.reload();
        }).catch((error) => {
            console.error("Error updating username: ", error);
        });
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUser(user);
                // Check for admin claim
                try {
                    const tokenResult = await user.getIdTokenResult();
                    setIsAdmin(!!tokenResult.claims.admin);
                } catch (error) {
                    setIsAdmin(false);
                    console.error("Error checking admin status:", error);
                }
                console.log("User is authenticated:", user);
            } else {
                setUser(null);
                setIsAdmin(false);
                console.log("User is not authenticated.");
                navigate("/");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    return (
        <>
            <Navbar />
            <div className="d-flex flex-column">
                <div className="d-flex flex-column flex-grow-1 pt-5">
                    <div className="row">
                        <div className="col-6">
                            <div className="mx-3 my-3"><p>Profile Settings</p></div>
                            <div className="card px-3 py-3">
                                <p>Change Username</p>
                            </div>
                        </div>
                        <div className="col-6">4s</div>
                    </div>
                </div>
            </div>
            <div className="container-fluid">

            </div>
            <div>
                <Navbar />
                <button className='btn btn-danger' onClick={handlelogout}>
                    Log Out
                </button>
            </div>
            <div className='form-group'>
                <label htmlFor="DEBUG">Change Username</label>
                <input type="text"
                    placeholder='new username'
                    className='form-control'
                    onChange={(e) => setUsername(e.target.value)} />

                <button
                    type="submit"
                    className="btn w-100 mb-4"
                    style={{ backgroundColor: "#80BC44", color: "#fff" }}
                    onClick={() => handleUsernameChange(username)}>
                    Save
                </button>
            </div>
            {isAdmin && (
                <Link to="/admin/dashboard">Admin Dashboard</Link>
            )}
            <p>Version 1.1 Dev</p>
        </>
    )
}

export default Profile