import React from 'react'
import { Link } from 'react-router-dom';

const Sidebar = () => (
  <aside
    className="app-sidebar bg-body-secondary shadow"
    data-bs-theme="dark"
    data-toggle="sidebar"
  >
    <div className="sidebar-brand">
      <a href="./index.html" className="brand-link">
        <img
          src="../../dist/assets/img/AdminLTELogo.png"
          alt="AdminLTE Logo"
          className="brand-image opacity-75 shadow"
        />
        <span className="brand-text fw-light">AdminLTE 4</span>
      </a>
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
            <a href="#" className="nav-link active">
              <i className="nav-icon bi bi-speedometer"></i>
              <p>
                Dashboard
                <i className="nav-arrow bi bi-chevron-right"></i>
              </p>
            </a>
            <ul className="nav nav-treeview">
              <li className="nav-item">
                <a href="./index.html" className="nav-link ">
                  <i className="nav-icon bi bi-circle"></i>
                  <p>Bin</p>
                </a>
              </li>
              <Link to="/admin/dashboard/station" className="nav-link">
                <i className="nav-icon bi bi-circle"></i>
                <p>Station</p>
              </Link>
              <li className="nav-item">
                <a href="./index2.html" className="nav-link">
                  <i className="nav-icon bi bi-circle"></i>
                  <p>Home</p>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
);

export default Sidebar;