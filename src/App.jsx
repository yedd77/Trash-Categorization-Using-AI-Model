import React from 'react'
import {HashRouter as Router, Route, Routes} from 'react-router-dom'
import Homepage from './Pages/Homepage'
import SignIn from './Pages/SignIn'
import Register from './Pages/register'
import Categorizer from './Pages/Categorizer'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/categorizer" element={<Categorizer />} />
      </Routes>
    </Router>
  )
}

export default App