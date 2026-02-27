import React from 'react'
import { Link } from 'react-router-dom';

const Sidebar = () => (
  <aside
    className="app-sidebar bg-body-secondary shadow"
    data-bs-theme="dark"
    data-toggle="sidebar"
  >
    <div className="sidebar-brand d-flex justify-content-start mx-3">
      <Link to="/admin/dashboard" className="brand-link">
      <img
          src="/icons/logo-black-white.png"
          alt="AdminLTE Logo"
          className="brand-image opacity-75 shadow"
        />
        <span className="brand-text fw-light">Bin Buddy Admin</span>
      </Link>
    </div>
    <div className="sidebar-wrapper">
      <nav className="mt-2">
        <ul
          className="nav sidebar-menu flex-column"
          data-lte-toggle="treeview"
          role="menu"
          data-accordion="false"
        >
          <li className="nav-item menu-open">
            <ul className="nav nav-treeview">
              <li className="nav-item">
                <Link to="/admin/dashboard" className="nav-link">
                  <i className="bi bi-house-fill"></i>
                  <p>Dashboard</p>
                </Link>
              </li>
            </ul>
            <ul className="nav nav-treeview">
              <li className='nav-item'>
                <Link to="/admin/dashboard/station" className="nav-link">
                  <i className="bi bi-trash"></i>
                  <p>Station</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/dashboard/users" className="nav-link">
                  <i className="bi bi-person-fill"></i>
                  <p>Users</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/dashboard/leaderboard" className="nav-link">
                  <i className="bi bi-trophy-fill"></i>
                  <p>Leaderboard</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/dashboard/point" className="nav-link">
                  <i className="bi bi-123"></i>
                  <p>Point Distribution</p>
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
);

export default Sidebar;