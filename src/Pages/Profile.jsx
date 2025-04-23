import React from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import Navbar from '../Components/Navbar/Navbar'
import {auth} from '../firebase'
import { useNavigate } from 'react-router-dom'


const Profile = () => {

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

    return (
        <>
            <div>
                <Navbar />
                <button className='btn btn-danger' onClick={handlelogout}>
                    Log Out
                </button>
            </div>
        </>
    )
}

export default Profile