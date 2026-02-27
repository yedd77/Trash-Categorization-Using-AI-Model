import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { Navigate, useNavigate } from 'react-router-dom'


function GoogleLogin() {

  const navigate = useNavigate()
  
  const handleGoogleSignIn = () => {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const user = result.user
        console.log('User Info:', user)
        navigate('/categorizer') 
      })
      .catch((error) => {
        console.error('Error signing in with Google:', error)
      })
  }

  return (
    
    <button
      className="btn w-100 d-flex align-items-center justify-content-center gap-2 border"
      onClick={handleGoogleSignIn}
    >
         <img src="https://img.icons8.com/?size=100&id=V5cGWnc9R4xj&format=png&color=000000" alt="Google logo" style={{width:"28px"}}></img>
          <span className="text-sm font-medium text-[#5F6368]">Login with Google</span>
    </button>
  )
}

export default GoogleLogin