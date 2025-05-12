import React, { useState, useEffect } from 'react';
import './Navbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';

// This hook checks if the app is running in PWA mode
function getIsPWA() {
  // Check if the app is running as a PWA
  if (document.referrer.startsWith('android-app://')) return true; // Trusted Web Activity (TWA) on Android
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
  if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) return true;
  if (window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches) return true;
  if (window.navigator.standalone === true) return true; // iOS standalone check

  return false;
}

const Navbar = () => {
  // State to manage the PWA status and user authentication
  const [isPWA, setIsPWA] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const isAppPWA = getIsPWA();
    setIsPWA(isAppPWA);
    console.log('Is PWA:', isAppPWA); //DEBUG

    // Check if the user is authenticated
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed. User:', user); //DEBUG
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      // Cleanup the subscription to avoid memory leaks
      unsubscribe();
    };

  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 vh-10">
      <a className="navbar-brand" href="#">
        <img src="https://via.placeholder.com/120x40?text=Logo" alt="Logo" height="40" />
      </a>

      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul className="navbar-nav me-3 d-flex gap-4">
          <li className="nav-item">
            <Link to="/" className="nav-link text-decoration-none text-dark">Home</Link>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">How it works</a>
          </li>
          {isPWA ? (
            // This will be true if the app is running as a PWA
            <li className="nav-item d-none">
              <a className="nav-link" href="#">PWA</a>
            </li>
          ) : (
            // This will be false if the app is running in a browser
            <li className="nav-item">
              <Link to="/ourApp" className="nav-link text-decoration-none text-dark">Our App</Link>
            </li>
          )}
          <li className="nav-item">
            <Link to="/categorizer" className="nav-link text-decoration-none text-dark">Try us</Link>
          </li>
        </ul>
        {!loading && (
          user ? (
            <Link to="/profile" className="btn btn-profile text-decoration-none">
              {user.displayName || 'User'}
            </Link>
          ) : (
            <Link to="/signin" className="btn btn-signin text-decoration-none">
              Sign Up
            </Link>
          )
        )}
      </div>
    </nav>
  );
}

export default Navbar;
