import React, { use } from 'react'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import Homepage from './Pages/Homepage'
import SignIn from './Pages/SignIn'
import Register from './Pages/Register'
import Categorizer from './Pages/Categorizer'
import Profile from './Pages/Profile'
import OurApp from './Pages/ourApp'
import Dashboard from './Pages/Admin/Dashboard'
import AdminRoute from './AdminRoute'
import ForgotPassword from './Pages/ForgotPass'
import ResetPass  from './Pages/ResetPass'

import { registerSW } from 'virtual:pwa-register';
import { onAuthStateChanged } from 'firebase/auth'
import { getDoc } from 'firebase/firestore'

import Station from './Pages/Admin/Station'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/categorizer" element={<Categorizer />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ourApp" element={<OurApp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPass />} />

        {/* Admin Route */}
        <Route path="/admin/dashboard" 
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        } 
        />
        <Route path="/admin/dashboard/station" 
        element={
          <AdminRoute>
            <Station />
          </AdminRoute>
        } 
        />

      </Routes>
    </Router>
  )
}

export default App