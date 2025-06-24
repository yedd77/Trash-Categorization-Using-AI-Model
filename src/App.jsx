import React, { use } from 'react'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import Homepage from './Pages/Homepage'
import SignIn from './Pages/SignIn'
import Register from './Pages/Register'
import Categorizer from './Pages/Categorizer'
import Profile from './Pages/Profile'
import Dashboard from './Pages/Admin/Dashboard'
import AdminRoute from './AdminRoute'
import ForgotPassword from './Pages/ForgotPass'
import ResetPass  from './Pages/ResetPass'

import { registerSW } from 'virtual:pwa-register';
import { onAuthStateChanged } from 'firebase/auth'
import { getDoc } from 'firebase/firestore'

import Station from './Pages/Admin/Station'
import AddStation from './Pages/Admin/AddStation'
import Users from './Pages/Admin/Users'
import Leaderboard from './Pages/Admin/Leaderboard'
import Point from './Pages/Admin/Point'
import Csv from './Pages/csvuploader'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/categorizer" element={<Categorizer />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPass />} />
        <Route path="/csvuploader" element={<Csv />} />

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
        <Route path="/admin/dashboard/addStation" 
        element={
          <AdminRoute>
            <AddStation />
          </AdminRoute>
        } 
        />
        <Route path="/admin/dashboard/users" 
        element={
          <AdminRoute>
            <Users />
          </AdminRoute>
        } 
        />
        <Route path="/admin/dashboard/leaderboard" 
        element={
          <AdminRoute>
            <Leaderboard />
          </AdminRoute>
        } 
        />
        <Route path="/admin/dashboard/point" 
        element={
          <AdminRoute>
            <Point />
          </AdminRoute>
        } 
        />
      </Routes>
    </Router>
  )
}

export default App