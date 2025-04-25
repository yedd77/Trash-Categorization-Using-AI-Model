import React from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import Navbar from '../Components/Navbar/Navbar'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from 'firebase/auth'
import { useState } from 'react'



const Profile = () => {

    const [username, setUsername] = useState('')

    const navigate = useNavigate()
    const handlelogout = () => {

        auth.signOut().then(() => {
            console.log("User signed out successfully.");

            // Redirect to the sign-in page after successful logout
            navigate("/")

        }).catch((error) => {
            console.error("Error signing out: ", error);
        });
    }

    // Function to handle username change (to be implemented)
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

    return (
        <>
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
        </>
    )
}

export default Profile