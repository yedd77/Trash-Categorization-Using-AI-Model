import React from 'react'
import {HashRouter as Router, Route, Routes} from 'react-router-dom'
import Homepage from './Pages/Homepage'
import SignIn from './Pages/SignIn'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </Router>
  )
}

export default App