import React from 'react'
import {HashRouter as Router, Route, Routes} from 'react-router-dom'
import Homepage from './Pages/Homepage'
import SignIn from './Pages/SignIn'
import Register from './Pages/register'
import Categorizer from './Pages/Categorizer'
import Profile from './Pages/Profile'
import OurApp from './Pages/ourApp'

// main.jsx or App.jsx
import { registerSW } from 'virtual:pwa-register';

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

      </Routes>
    </Router>
  )
}

export default App