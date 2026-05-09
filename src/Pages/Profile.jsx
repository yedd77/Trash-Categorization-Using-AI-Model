import React, { useState, useEffect, use, useRef } from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import Navbar from '../Components/Navbar/Navbar'
import { auth } from '../firebase'
import { getFunctions, httpsCallable } from "firebase/functions";
import { useNavigate, Link } from 'react-router-dom'
import { getAuth, updateProfile, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, collection, query, where, orderBy, limit, doc, getDoc, getDocs, Timestamp, addDoc, updateDoc, serverTimestamp, setDoc, getCountFromServer } from "firebase/firestore";
import './Profile.css'
import { getApp } from 'firebase/app';
import QRScanner from '../Components/QRScanner.jsx';

const Profile = () => {

    // State variables
    const [oldUsername, setOldUsername] = useState('')
    const [username, setUsername] = useState('')
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [claimedPoints, setClaimedPoints] = useState(0);
    const [pendingPoints, setPendingPoints] = useState(0);
    const [expiredPoints, setExpiredPoints] = useState(0);
    const [earliestPoint, setEarliestPoint] = useState(null);
    const [timeLeft, setTimeLeft] = useState("");
    const [claimedData, setClaimedData] = useState([]);
    const [UsernameError, setUsernameError] = useState("");
    const [isPWA, setIsPWA] = useState(getIsPWA());
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showNfcOverlay, setShowNfcOverlay] = useState(false);
    const [nfcError, setNfcError] = useState("");
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [successfull, setSuccessfull] = useState("");
    const [verifyStatus, setVerifyStatus] = useState("");
    const [verifyDescription, setVerifyDescription] = useState("");
    const [showVerifyProcess, setShowVerifyProcess] = useState(false);
    const [ranking, setRanking] = useState(0);
    const [totalRankings, setTotalRankings] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const hasFetched = useRef(false);

    // Consolidated auth listener - sets user state and immediate properties
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setOldUsername(currentUser.displayName || "No username set");

                // Check for admin claim
                try {
                    const tokenResult = await currentUser.getIdTokenResult();
                    setIsAdmin(!!tokenResult.claims.admin);
                } catch (error) {
                    setIsAdmin(false);
                    console.error("Error checking admin status:", error);
                }
            } else {
                setUser(null);
                setIsAdmin(false);
                setOldUsername("No username set");
                console.log("User is not authenticated.");
                navigate("/");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    //Function to handle username change
    const handleUsernameChange = async (newUsername) => {
        const db = getFirestore();
        const user = auth.currentUser;

        try {
            await updateProfile(user, {
                displayName: newUsername
            });

            const pointsRef = collection(db, "Points");
            const q = query(pointsRef, where("uid", "==", user.uid));
            const snapshot = await getDocs(q);

            // Step 3: Update username on each point document
            const updatePromises = snapshot.docs.map(doc => updateDoc(doc.ref, {
                username: newUsername
            }));
            await Promise.all(updatePromises);

            console.log("Username updated successfully in Auth and Firestore.");
            window.location.reload(); // Optional: refresh UI

        } catch (error) {
            console.error("Error updating username: ", error);
            setUsernameError("Error updating username. Please try again.");
        }
    };

    // Function to handle logout
    const handlelogout = () => {
        auth.signOut().then(() => {
            console.log("User signed out successfully.");
            navigate("/")
        }).catch((error) => {
            console.error("Error signing out: ", error);
        });
    }

    //function to check if user is on PWA or not
    function getIsPWA() {
        // Check if the app is running as a PWA
        if (document.referrer.startsWith('android-app://')) return true; // Trusted Web Activity (TWA) on Android
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
        if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) return true;
        if (window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches) return true;
        if (window.navigator.standalone === true) return true; // iOS standalone check

        return false;
    }

    // Function to show the log out confirmation modal
    const showLogoutConfirmation = () => {
        setShowLogoutModal(true);
    }

    return (
        <>
            <Navbar />
            <div className="container-fluid" style={{ height: '100vh' }}>
                <div className="row g-3">
                    <div className="col-12 col-sm-6">
                        <p className="fw-bold empty pt-2 fs-4 mb-2">Profile Settings</p>
                        <div className="row">
                            <div className="col-12 mb-3">
                                <div className="card border-0 rounded-4 shadow-cs">
                                    <div className="card-body">
                                        <p className="fw-medium mb-4">Change Username</p>
                                        <p className="fw-regular f-9">Current Username :</p>
                                        <p className="fw-medium f-9">{oldUsername}</p>
                                        <p className="f-9 empty fw-medium">New Username :</p>
                                        <div className="form-floating mb-1">
                                            <input
                                                type="text"
                                                className="form-control form-control-sm mb-2 border-0 border-bottom"
                                                id="newUsername"
                                                placeholder="Enter new username"
                                                onChange={(e) => setUsername(e.target.value)}
                                            />
                                            <label className="f-9 text-muted" htmlFor="newUsername">New username</label>
                                        </div>
                                        <p className="fw-semibold text-danger f-9">{UsernameError}</p>
                                        <div className="d-flex justify-content-end">
                                            <button className="btn rounded-3" type="button" style={{ backgroundColor: '#80BC44', color: '#fff' }} onClick={() => handleUsernameChange(username)}>
                                                Change Username
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="col-12 mb-3">
                                <div className="card border-0 rounded-4 shadow-cs">
                                    <div className="card-body">
                                        <p className="fw-medium mb-2">Logout from this account</p>
                                        <div className="d-flex justify-content-end">
                                            <button className="btn rounded-3 btn-danger" type="button" onClick={showLogoutConfirmation}>
                                                Log out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {isAdmin && (
                                <div className="col-12 mb-3">
                                    <div className="card border-0 rounded-4 shadow-cs">
                                        <div className="card-body">
                                            <p className="fw-medium mb-2">Admin Dashboard</p>
                                            <div className="d-flex justify-content-end">
                                                <Link className="btn rounded-3 btn-warning" to="/admin/dashboard">Go to Dashboard</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            {showLogoutModal && (
                <div className="modal show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">Log out</h5>
                                <button type="button" className="btn-close" onClick={() => setShowLogoutModal(false)} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to log out?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => window.location.reload()}>Cancel</button>
                                <button type="button" className="btn btn-danger" onClick={handlelogout}>Yes, Log me out</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    )
}

export default Profile