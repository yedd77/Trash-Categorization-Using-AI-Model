import React, { useState, useEffect } from 'react';
import './Navbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';

function getIsPWA() {
  if (document.referrer.startsWith('android-app://')) return true;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  if (window.matchMedia?.('(display-mode: fullscreen)').matches) return true;
  if (window.matchMedia?.('(display-mode: minimal-ui)').matches) return true;
  if (window.navigator.standalone === true) return true;
  return false;
}

const Navbar = () => {
  const [isPWA, setIsPWA] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  useEffect(() => {
    setIsPWA(getIsPWA());

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleNavbar = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  const closeNavbar = () => {
    setIsNavCollapsed(true); // Optional: closes menu when link clicked (on mobile)
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 vh-10">
      <Link to="/" className="navbar-brand" onClick={closeNavbar}><img src="/icons/icon-long.png" alt="Logo" height="40" /></Link>

      <button
        className="navbar-toggler"
        type="button"
        onClick={toggleNavbar}
        aria-controls="navbarNav"
        aria-expanded={!isNavCollapsed}
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className={`collapse navbar-collapse justify-content-end ${!isNavCollapsed ? 'show' : ''}`} id="navbarNav">
        <ul className="navbar-nav me-3 d-flex gap-4">
          <li className="nav-item">
            <Link to="/" className="nav-link text-decoration-none text-dark" onClick={closeNavbar}>Home</Link>
          </li>
          <li className="nav-item">
             <Link to="/?scrollTo=howItWorks" className="nav-link text-decoration-none text-dark" onClick={closeNavbar}>How it works</Link>
          </li>
          {!isPWA && (
            <li className="nav-item">
              <Link to="/?scrollTo=download" className="nav-link text-decoration-none text-dark" onClick={closeNavbar}>Our App</Link>
            </li>
          )}
          <li className="nav-item">
            <Link to="/categorizer" className="nav-link text-decoration-none text-dark" onClick={closeNavbar}>Try us</Link>
          </li>
        
        {!loading && (
          user ? (
              <li className="nav-item">
                <Link to="/profile" className="nav-link text-decoration-none text-dark" onClick={closeNavbar}>
                  <i className="bi bi-person-fill mx-2" style={{ color: "#6b6968" }}></i>
                  {user.displayName || 'User'}
                </Link>
              </li>
          ) : (
            <Link to="/signin" className="nav-link text-decoration-none text-dark" onClick={closeNavbar}>
              Sign Up
            </Link>
          )
        )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
