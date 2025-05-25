import React from 'react'
import AdminNavbar from './Components/AdminNavbar'
import Sidebar from './Components/sidebar'

const Point = () => {
  return (
    <>
        <div className="app-wrapper">
            <AdminNavbar />
            <Sidebar />
            <p>Points</p>
        </div>
    </>
  )
}

export default Point