import React from 'react'
import AdminNavbar from './Components/AdminNavbar'
import Sidebar from './Components/sidebar'

const Users = () => {
  return (
    <>
    <div className="app-wrapper">
        <AdminNavbar toggleSidebar={() => setIsCollapsed(prev => !prev)} />
        <Sidebar />
        <div className="app-main">
            
        </div>
        Users
    </div>
    </>
  )
}

export default Users