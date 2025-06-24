import React, { useState, useEffect, use } from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import Navbar from '../Components/Navbar/Navbar'
import { auth } from '../firebase'
import { getFunctions, httpsCallable } from "firebase/functions";
import { useNavigate, Link } from 'react-router-dom'
import { getAuth, updateProfile, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, collection, query, where, orderBy, limit, doc, getDoc, getDocs, Timestamp, addDoc, updateDoc, serverTimestamp, setDoc } from "firebase/firestore";
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
                } catch (error) {
                    console.error("Error fetching user point data:", error);
                }
            } else {
                console.log("User not logged in.");
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const db = getFirestore();
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const fetchClaimedData = async () => {
                    const pointsDataQuery = query(
                        collection(db, "Points"),
                        where("uid", "==", user.uid),
                        where("isClaimed", "==", true)
                    );

                    const pointsDataSnapshot = await getDocs(pointsDataQuery);

                    const dataWithStationNames = await Promise.all(
                        pointsDataSnapshot.docs.map(async (docSnap) => {
                            const data = docSnap.data();
                            const stationRef = doc(db, "Station", data.claimedBin);
                            const stationDoc = await getDoc(stationRef);
                            const stationName = stationDoc.exists() ? stationDoc.data().stationName : "Unknown";

                            const claimedAt = data.claimedAt?.toDate?.() || new Date();
                            const dateStr = claimedAt.toLocaleDateString();
                            const timeStr = claimedAt.toLocaleTimeString();

                            return {
                                stationName,
                                itemType: data.itemType,
                                date: dateStr,
                                time: timeStr,
                                points: data.points || 0,
                            };
                        })
                    );

                    setClaimedData(dataWithStationNames);
                };

                fetchClaimedData();
            }
        });
        return () => unsubscribe();
    }, [user]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = claimedData.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(claimedData.length / itemsPerPage);
    const pageNumbers = [];
    const visiblePageCount = 5;

    let startPage = Math.max(1, currentPage - Math.floor(visiblePageCount / 2));
    let endPage = startPage + visiblePageCount - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - visiblePageCount + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

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

    //To have this function active, the user must be authenticated and the app must be running in PWA mode
    // This function is triggered when the user clicks the "Scan for rewards" button
    //it well set the showNfcOverlay state to true, indicating that the NFC scan is ready
    //it then will read the NFC tag using the NDEFReader API
    // If the NFC tag data is valid, it will decode the data and extract the tagUID and binID from the URL
    // then it will call the callVerifyScan function to verify the scan
    const handleNFCScan = async () => {
        console.log("NFC scan initiated");
        // Check if NFC is supported
        if (!("NDEFReader" in window)) {
            alert("NFC is not supported on this device.");
            return;
        }

        // Show NFC overlay
        setShowNfcOverlay(true); // set on NFC when its ready to write

        try {
            const ndef = new window.NDEFReader(); // Create a new NDEFReader instance
            await ndef.scan(); // Start scanning for NFC tags

            // Set up event listeners for NFC tag reading
            ndef.onreading = (event) => {
                // Create a TextDecoder to decode the NFC tag data
                const decoder = new TextDecoder();

                // loop through the records in the NFC message
                for (const record of event.message.records) {
                    // Check if the record is of type text or URL
                    if (record.recordType === "text" || record.recordType === "url") {
                        // Decode the record data
                        const urlData = decoder.decode(record.data);

                        // Check if the data is a valid URL
                        try {
                            const parseURL = new URL(urlData);
                            const tagUID = parseURL.searchParams.get("tagUID");
                            const binID = parseURL.searchParams.get("binID");

                            if (!tagUID || !binID) {
                                alert("Invalid NFC tag format.");
                                setNfcError("Invalid NFC.");
                                return;
                            }

                            // Call function to verify the scan
                            setShowNfcOverlay(false);
                            setShowVerifyModal(false);
                            callVerifyScan(tagUID, binID);
                            setSuccessfull("Scan successful!");
                        } catch (err) {
                            // catch any errors in URL parsing
                            setNfcError("Malformed NFC tag data.");
                            setShowNfcOverlay(false);
                        }
                    }
                }
            };
            ndef.onerror = (event) => {
                setNfcError("NFC scan failed. Please try again.");
                console.error("NFC scan error: ", event);
                setShowNfcOverlay(false);
            };
        } catch (error) {
            console.error("NFC scan failed:", err);
            alert("Unable to start NFC scan. Make sure NFC is enabled.");
        }
    };

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

    const callVerifyScan = async (tagUID, binID) => {
        const functions = getFunctions(getApp(), "us-central1");
        const verifyScan = httpsCallable(functions, "verifyScan");

        setVerifyStatus("Pending");
        setVerifyDescription("Please wait while we verify your scan.");

        try {
            const result = await verifyScan({ tagUID, binID });

            if (result.data.success) {
                // update record of user points in Firestore
                const db = getFirestore();
                const user = auth.currentUser;

                try {
                    const pointsQuery = query(
                        collection(db, "Points"),
                        where("uid", "==", user.uid),
                        where("isClaimed", "==", false),
                        where("isExpired", "==", false),
                        where("expiresAt", ">", Timestamp.now())
                    );
                    const querySnapshot = await getDocs(pointsQuery);

                    if (querySnapshot.empty) {
                        console.log("No pending points found for user.");
                        return;
                    }

                    querySnapshot.forEach(async (doc) => {
                        const docRef = doc.ref;
                        await Promise.all(querySnapshot.docs.map(doc =>
                            updateDoc(docRef, {
                                isClaimed: true, // Mark the points as claimed
                                claimedAt: Timestamp.now(), // Set the claimed timestamp
                                claimedBin: binID // Store the bin ID where the points were claimed
                            })
                        ));
                    });
                    setVerifyStatus("Success");
                    setVerifyDescription("Scan verified successfully. Points awarded.");
                } catch (err) {
                    console.error("Error updating points:", err.message);
                    alert("Error updating points: " + err.message);
                }

            } else {
                alert(err.message);
            }

            setShowNfcOverlay(false); // Hide NFC overlay after scan
        } catch (err) {
            console.error("Error verifying NFC scan:", err);
            alert("Error verifying NFC scan: " + err.message);
        }
    };

    // Function to handle QR code scan// This function is called when the user clicks the "Scan QR Code" button
    // It will set the showQRScanner state to true, indicating that the QR scanner should be displayed
    const handleQRScan = () => {
        setShowQRScanner(true); // Show QR Scanner
    }

    // This function is called from QRScanner component after a successful QR scan
    // It will handle the scanned QR code data, extract tagUID and binID,
    // and then call the callVerifyScan function to verify the scan
    const handleScanResult = (data) => {

        setShowQRScanner(false);
        setShowVerifyModal(false);
        if (!data || !data.startsWith("https://bin-buddy-v1.web.app/binVerify/")) {
            alert("Invalid QR Code. Please scan a valid Bin Buddy QR Code.");
            return;
        }

        // Extract tagUID and binID from the scanned QR code
        const url = new URL(data);
        const tagUID = url.searchParams.get("tagUID");
        const binID = url.searchParams.get("binID");
        if (!tagUID || !binID) {
            alert("Invalid QR Code format. Missing tagUID or binID.");
            return;
        }

        // Call the function to verify the scan with the extracted tagUID and binID
        callVerifyScan(tagUID, binID);
    };

    // Function to show the log out confirmation modal
    const showLogoutConfirmation = () => {
        setShowLogoutModal(true);
    }

    // Function to state the ranking of the user
    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return;

            const db = getFirestore();
            const q = query(collection(db, 'Points'), where("isClaimed", "==", true));
            const snapshot = await getDocs(q);

            const leaderboardMap = {};

            snapshot.forEach(doc => {
                const data = doc.data();
                const uid = data.uid;
                const points = data.points || 0;

                if (!leaderboardMap[uid]) {
                    leaderboardMap[uid] = 0;
                }

                leaderboardMap[uid] += points;
            });

            const sorted = Object.entries(leaderboardMap)
                .sort((a, b) => b[1] - a[1])
                .map(([uid]) => uid);

            const rank = sorted.indexOf(user.uid);
            if (rank !== -1) {
                setRanking(rank + 1);
            }
        });

        return () => unsubscribe();
    }, []);


    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(
                    "https://us-central1-bin-buddy-v1.cloudfunctions.net/getUserCount"
                ); 12

                const data = await res.json();
                setTotalRankings(data.userCount);
            } catch (err) {
                setError("Error fetching user count.");
            }
        })();
    }, []);

    return (
        <>
            {showNfcOverlay && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                }}>
                    <div>
                        <i className="bi bi-nfc" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <div>
                        Please scan your NFC tag now...
                    </div>
                    <div className="d-flex flex-column justify-content-center align-items-center">
                        <button
                            className="btn btn-secondary mt-3"
                            onClick={() => {
                                setShowNfcOverlay(false);
                                setVerifyStatus(false);
                            }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            {showQRScanner && (
                <div className="d-flex justify-content-center align-items-center flex-column min-vh-100" style={{ minHeight: '90vh' }}>
                    <QRScanner
                        onSend={handleScanResult}
                        onClose={() => {
                            setShowQRScanner(false);
                            setVerifyStatus(false);
                        }} />
                </div>
            )}
            <Navbar />
            <div className="container-fluid" style={{ height: '100vh' }}>
                {showVerifyProcess ? (
                    <div className="d-flex flex-column" style={{ minHeight: '90vh' }}>
                        <div className="d-flex flex-column flex-grow-1 pt-5">
                            <div className="main-section container">
                                <p className="fw-semibold empty fs-3 text-center">{verifyStatus}</p>
                                <p className="fw-normal empty text-muted text-center lh-sm mb-5">
                                    {verifyDescription}
                                </p>
                                {verifyStatus === "Success" && (
                                    <button
                                        className="btn rounded-4 shadow fw-semibold w-50 w-md-25 text-nowrap responsive-font"
                                        type="button"
                                        style={{ backgroundColor: '#80BC44', color: '#fff' }}

                                        onClick={() => window.location.reload()}>
                                        <i className="bi bi-lightbulb-fill me-2"></i> Return to Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="row g-3">
                        <div className="col-12 col-sm-6">
                            <p className="fw-bold empty pt-3 fs-4 mb-2">Point Information</p>
                            <div className="row g-3">
                                <div className="col-4 d-flex align-items-stretch">
                                    <div className="card border-0 rounded-4 shadow-cs w-100">
                                        <div className="card-body text-center">
                                            <p className="fw-bold fs-3 mb-2 text-success">{claimedPoints.toLocaleString()}</p>
                                            <p className="fw-semibold">Claimed Points</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-4 d-flex align-items-stretch">
                                    <div className="card border-0 rounded-4 shadow-cs w-100">
                                        <div className="card-body text-center">
                                            <p className="fw-bold fs-3 mb-2 text-warning">{pendingPoints}</p>
                                            <p className="fw-semibold">Pending Points</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-4 d-flex align-items-stretch">
                                    <div className="card border-0 rounded-4 shadow-cs w-100">
                                        <div className="card-body text-center">
                                            <p className="fw-bold fs-3 mb-2 text-danger">{expiredPoints}</p>
                                            <p className="fw-semibold">Expired Points</p>
                                        </div>
                                    </div>
                                </div>

                                {pendingPoints > 0 && (
                                    <div className="col-12">
                                        <div className="card border-0 rounded-4 shadow-cs">
                                            <div className="card-body">
                                                <p className="fw-semibold mb-2">Notification</p>
                                                {isPWA ? (
                                                    <>
                                                        <p className="empty">You have {pendingPoints} unclaimed points, claim now before they expire in {timeLeft}.</p>
                                                        <button
                                                            className="btn btn-outline-secondary rounded-4 fw-semibold w-50 w-md-25 text-nowrap responsive-font mt-2"
                                                            type="button"
                                                            style={{ color: 'rgb(128, 188, 68)', border: '2px solid rgb(128, 188, 68)', }}
                                                            onClick={() => {
                                                                setShowVerifyProcess(true);
                                                                setShowVerifyModal(true);
                                                            }}>
                                                            <i className="bi bi-patch-check me-2"></i> Verify Location
                                                        </button>
                                                    </>
                                                ) : (
                                                    <p className="empty">You have {pendingPoints} unclaimed points, claim now before they expire in {timeLeft}. Use our PWA to throw your trash properly and keep earning more! </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="col-12 mb-2">
                                    <div className="card border-0 rounded-4 shadow-cs">
                                        <div className="card-body">
                                            <p className="fw-semibold">Current Ranking</p>
                                            <p className="fw-regular">
                                                You are currently ranked <span className="fw-bold">{ranking}</span> out of <span className="fw-bold">{totalRankings}</span> users.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 mb-2">
                                    <div className="card border-0 rounded-4 shadow-cs">
                                        <div className="card-body">
                                            <p className="fw-semibold mb-2">Claimed Points</p>
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
                                                        {currentItems.map((data, index) => (
                                                            <tr key={index}>
                                                                <td>{indexOfFirstItem + index + 1}</td>
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
                                        <div className="card-footer clearfix">
                                            <ul className="pagination pagination-sm m-0 float-right">
                                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                                    <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>«</button>
                                                </li>

                                                {pageNumbers.map(page => (
                                                    <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                                                        <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                                                    </li>
                                                ))}

                                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                                    <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>»</button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                )}
                {showVerifyModal && (
                    <div
                        className={`modal fade show`}
                        id="staticBackdrop"
                        style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}
                        tabIndex="-1"
                        aria-labelledby="staticBackdropLabel"
                        aria-modal="true"
                        role="dialog" >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h1 className="modal-title fs-5" id="staticBackdropLabel">Verify Your Location</h1>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => { setShowVerifyModal(false); setShowVerifyProcess(false); }}
                                        aria-label="Close"
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    To claim your recycling points, please verify that you are near an authorized recycling station.
                                    You can do this by scanning a QR code or tapping your device on the NFC tag located at the station.
                                    <br /><br />
                                    You can also choose to claim your points later, but they will expire if not verified.
                                </div>
                                <div className="modal-footer">
                                    <button
                                        className="btn btn-lg rounded-4 shadow fw-bold w-100 w-md-25 text-nowrap responsive-font"
                                        type="button"
                                        style={{ backgroundColor: '#80BC44', color: '#fff' }}
                                        onClick={handleNFCScan}>
                                        <i className="bi bi-lightbulb-fill me-2"></i> Verify using NFC
                                    </button>
                                    <button
                                        className="btn btn-lg rounded-4 shadow fw-bold w-100 w-md-25 text-nowrap responsive-font"
                                        type="button"
                                        style={{ backgroundColor: '#80BC44', color: '#fff' }}
                                        onClick={handleQRScan}>
                                        <i className="bi bi-lightbulb-fill me-2"></i> Verify using QR Code
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary rounded-4 shadow fw-bold w-100 w-md-25 text-nowrap responsive-font"
                                        onClick={() => {
                                            setShowVerifyModal(false);
                                            setShowVerifyProcess(false);
                                        }}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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