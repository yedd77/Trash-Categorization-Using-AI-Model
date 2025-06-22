import React, { useState, useEffect } from 'react';
import { auth } from '../../../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import '../../../Components/initialAvatar.jsx';
import InitialAvatar from '../../../Components/initialAvatar.jsx';


const AdminNavbar = ({ toggleSidebar }) => {

    const [user, setUser] = useState(null); // State to manage the user authentication

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            setUser(user);
        } else {
            setUser(null);
        }
    }, []);

    const handleSidebarToggle = (e) => {
        e.preventDefault();
        if (typeof toggleSidebar === 'function') {
            toggleSidebar();
        }
    };

    return (
        <>
            <nav className="app-header navbar navbar-expand bg-body">
                <div className="container-fluid">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <a
                                className="nav-link"
                                data-lte-toggle="sidebar"
                                href="#"
                                role="button"
                                onClick={handleSidebarToggle}>
                                <i className="bi bi-list"></i>
                            </a>
                        </li>
                        <li className="nav-item d-none d-md-block">
                            <Link to="/admin/dashboard" className="nav-link">Home</Link>
                        </li>
                    </ul>
                    <ul className="navbar-nav ms-auto">
                        <Link to="/" className="btn btn-outline-primary mx-4">
                        Go to Homepage
                        </Link>
                        <li className="nav-item dropdown user-menu">
                            <a href="#" className="nav-link dropdown-toggle d-flex gap-3 align-items-center" data-bs-toggle="dropdown">
                                <InitialAvatar username={user ? user.displayName : 'User'} size={30}/>
                                <span className="d-none d-md-inline">{user ? user.displayName : 'User'}</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    )
}

export default AdminNavbar;
