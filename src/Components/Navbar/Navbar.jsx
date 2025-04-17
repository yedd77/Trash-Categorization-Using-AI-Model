import React from 'react'
import './Navbar.css'
import 'bootstrap/dist/css/bootstrap.min.css'

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4">
      <a className="navbar-brand" href="#">
        {/* Replace with an actual logo image if you have one */}
        <img src="https://via.placeholder.com/120x40?text=Logo" alt="Logo" height="40" />
      </a>

      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul className="navbar-nav me-3 d-flex gap-4">
          <li className="nav-item">
            <a className="nav-link" href="#">Home</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">How it works</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">Our App</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">Try us</a>
          </li>
        </ul>
        <a className="btn btn-signin" href="#">Sign In</a>
      </div>
    </nav>
  )
}

export default Navbar