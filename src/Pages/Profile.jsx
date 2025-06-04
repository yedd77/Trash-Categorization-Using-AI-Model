import React, { useState, useEffect, use } from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import Navbar from '../Components/Navbar/Navbar'
import { auth } from '../firebase'
import { useNavigate, Link } from 'react-router-dom'
import { getAuth, updateProfile, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, collection, query, where, orderBy, limit, doc, getDoc, getDocs } from "firebase/firestore";
import './Profile.css'

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


    // function to fetch points data like claimed, pending, and expired points
    // then will be dispyed in counter cards
    // also fetches the time left for the earliest pending point if it exists
    // also fetches data for claimed points to display in a table
    useEffect(() => {
        const db = getFirestore();
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Fetching claimed points
                    const pointsQuery = query(
                        collection(db, "Points"),
                        where("uid", "==", user.uid),
                        where("isClaimed", "==", true)
                    );
                    const pointsSnapshot = await getDocs(pointsQuery);
                    let claimed = 0;
                    pointsSnapshot.forEach((doc) => {
                        claimed += doc.data().points || 0;
                    });
                    setClaimedPoints(claimed);

                    // Fetching expired points
                    const pendingQuery = query(
                        collection(db, "Points"),
                        where("uid", "==", user.uid),
                        where("isClaimed", "==", false),
                        where("expiresAt", ">", new Date())
                    );
                    const pendingSnapshot = await getDocs(pendingQuery);
                    let pending = 0;
                    pendingSnapshot.forEach((doc) => {
                        pending += doc.data().points || 0;
                    });
                    setPendingPoints(pending);

                    // Fetching expired points
                    const expiredQuery = query(
                        collection(db, "Points"),
                        where("uid", "==", user.uid),
                        where("isClaimed", "==", false),
                        where("isExpired", "==", true)
                    );
                    const expiredSnapshot = await getDocs(expiredQuery);
                    let expired = 0;
                    expiredSnapshot.forEach((doc) => {
                        expired += doc.data().points || 0;
                    });
                    setExpiredPoints(expired);

                    // Fetching earliest pending point
                    // This will find the earliest pending point that has not expired
                    const earliestPendingQuery = query(
                        collection(db, "Points"),
                        where("uid", "==", user.uid),
                        where("isClaimed", "==", false),
                        where("expiresAt", ">", new Date()),
                        orderBy("expiresAt", "asc"),
                        limit(1)
                    );

                    const snapshot = await getDocs(earliestPendingQuery);

                    if (!snapshot.empty) {
                        const doc = snapshot.docs[0];
                        const data = doc.data();
                        setEarliestPoint(data);

                        const expiresAt = data.expiresAt.toDate();
                        const now = new Date();
                        const timeLeftMs = expiresAt - now;

                        if (timeLeftMs > 0) {
                            const minutes = Math.floor(timeLeftMs / (1000 * 60)) % 60;
                            const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
                            setTimeLeft(`${hours} hour(s) ${minutes} minute(s)`);
                        } else {
                            setTimeLeft("Already expired");
                        }
                    } else {
                        setEarliestPoint(null);
                        setTimeLeft("No pending points");
                    }

                    // Fetching claimed data
                    const pointsDataQuery = query(
                        collection(db, "Points"),
                        where("uid", "==", user.uid),
                        where("isClaimed", "==", true)
                    );
                    const pointsDataSnapshot = await getDocs(pointsDataQuery);

                    const dataWithStationNames = await Promise.all(
                        pointsDataSnapshot.docs.map(async (docSnap, index) => {
                            const data = docSnap.data();
                            const stationRef = doc(db, "Station", data.claimedBin);
                            const stationDoc = await getDoc(stationRef);
                            const stationName = stationDoc.exists() ? stationDoc.data().stationName : "Unknown";

                            const claimedAt = data.claimedAt?.toDate?.() || new Date();
                            const dateStr = claimedAt.toLocaleDateString();
                            const timeStr = claimedAt.toLocaleTimeString();

                            return {
                                no: index + 1,
                                stationName,
                                itemType: data.itemType,
                                date: dateStr,
                                time: timeStr,
                                points: data.points || 0,
                            };
                        })
                    );

                    setClaimedData(dataWithStationNames);

                } catch (error) {
                    console.error("Error fetching user point data:", error);
                }
            } else {
                console.log("User not logged in.");
            }
        });

        return () => unsubscribe();
    }, []);

    // function to get the username of the user from firebase auth
    useEffect(() => {

        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setOldUsername(user.displayName || "No username set");
            } else {
                console.log("User is not authenticated.");
                navigate("/");
            }
        });
    }, []);

    //Function to handle username change
    const handleUsernameChange = (newUsername) => {
        updateProfile(auth.currentUser, {
            displayName: newUsername
        }).then(() => {
            console.log("Username updated successfully.");
            window.location.reload();
        }).catch((error) => {
            console.error("Error updating username: ", error);
            setUsernameError("Error updating username. Please try again.");
        });
    }

    // Function to handle logout
    function getIsPWA() {
        // Check if the app is running as a PWA
        if (document.referrer.startsWith('android-app://')) return true; // Trusted Web Activity (TWA) on Android
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
        if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) return true;
        if (window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches) return true;
        if (window.navigator.standalone === true) return true; // iOS standalone check

        return false;
    }

    //function to check if user is on PWA or not



    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUser(user);
                // Check for admin claim
                try {
                    const tokenResult = await user.getIdTokenResult();
                    setIsAdmin(!!tokenResult.claims.admin);
                } catch (error) {
                    setIsAdmin(false);
                    console.error("Error checking admin status:", error);
                }
            } else {
                setUser(null);
                setIsAdmin(false);
                console.log("User is not authenticated.");
                navigate("/");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

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
                        <p className="fw-bold empty pt-3 px-3 fs-5 mb-2">Profile Settings</p>
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

                            {/* Change Password Card */}
                            <div className="col-12 mb-3">
                                <div className="card border-0 rounded-4 shadow-cs">
                                    <div className="card-body">
                                        <p className="fw-medium mb-4">Change Password</p>
                                        <p className="fw-regular f-9 empty">Current Password</p>
                                        <div className="form-floating mb-1">
                                            <input
                                                type="password"
                                                className="form-control form-control-sm mb-2 border-0 border-bottom"
                                                id="currentPassword"
                                                placeholder="Enter Current Password"
                                            />
                                            <label className="f-9 text-muted" htmlFor="currentPassword">Enter Current Password</label>
                                        </div>

                                        <p className="fw-regular f-9 empty">New Password</p>
                                        <div className="form-floating mb-1">
                                            <input
                                                type="password"
                                                className="form-control form-control-sm mb-2 border-0 border-bottom"
                                                id="newPassword"
                                                placeholder="Enter New Password"
                                            />
                                            <label className="f-9 text-muted" htmlFor="newPassword">Enter New Password</label>
                                        </div>

                                        <p className="fw-regular f-9 empty">Confirm New Password</p>
                                        <div className="form-floating mb-1">
                                            <input
                                                type="password"
                                                className="form-control form-control-sm mb-2 border-0 border-bottom"
                                                id="confirmPassword"
                                                placeholder="Confirm New Password"
                                            />
                                            <label className="f-9 text-muted" htmlFor="confirmPassword">Confirm New Password</label>
                                        </div>

                                        <p className="fw-semibold text-danger f-9">Error choii!</p>
                                        <div className="d-flex justify-content-end">
                                            <button className="btn rounded-3" type="button" style={{ backgroundColor: '#80BC44', color: '#fff' }}>
                                                Change Password
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
                    <div className="col-12 col-sm-6">
                        <p className="fw-bold empty pt-3 px-3 fs-5 mb-2">Point Information</p>
                        <div className="row g-3">
                            <div className="col-4 d-flex align-items-stretch">
                                <div className="card border-0 rounded-4 shadow-cs w-100">
                                    <div className="card-body text-center">
                                        <p className="fw-bold fs-3 mb-2 text-success">{claimedPoints}</p>
                                        <p className="fw-bold">Claimed Points</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-4 d-flex align-items-stretch">
                                <div className="card border-0 rounded-4 shadow-cs w-100">
                                    <div className="card-body text-center">
                                        <p className="fw-bold fs-3 mb-2 text-warning">{pendingPoints}</p>
                                        <p className="fw-bold">Pending Points</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-4 d-flex align-items-stretch">
                                <div className="card border-0 rounded-4 shadow-cs w-100">
                                    <div className="card-body text-center">
                                        <p className="fw-bold fs-3 mb-2 text-danger">{expiredPoints}</p>
                                        <p className="fw-bold">Expired Points</p>
                                    </div>
                                </div>
                            </div>

                            {pendingPoints > 0 && (
                                <div className="col-12">
                                    <div className="card border-0 rounded-4 shadow-cs">
                                        <div className="card-body">
                                            <p className="fw-bold mb-2">Notification</p>
                                            
                                            {isPWA ? "PWA"
                                            :
                                             <p className="empty">You have {pendingPoints} unclaimed points, claim now before they expire in {timeLeft}. Use our PWA to throw your trash properly and keep earning more! </p>
                                            }
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="col-12 mb-2">
                                <div className="card border-0 rounded-4 shadow-cs">
                                    <div className="card-body">
                                        <p className="fw-bold mb-2">Claimed Points</p>
                                        <div className="table-responsive">
                                            <table className="table table-striped table text-center" style={{ width: '100%' }}>
                                                <thead>
                                                    <tr>
                                                        <th scope="col">No</th>
                                                        <th scope="col">Station Name</th>
                                                        <th scope="col">Item thrown</th>
                                                        <th scope="col">Date</th>
                                                        <th scope="col">Time</th>
                                                        <th scope="col">Point Given</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {claimedData.map((data, idx) => (
                                                        <tr key={idx}>
                                                            <td>{data.no}</td>
                                                            <td>{data.stationName}</td>
                                                            <td>{data.itemType}</td>
                                                            <td>{data.date}</td>
                                                            <td>{data.time}</td>
                                                            <td>{data.points}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal for logging out */}
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