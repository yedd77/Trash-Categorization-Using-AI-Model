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

export default function Points() {
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

    // Fetch points data when user changes
    useEffect(() => {
        if (!user) return;

        const fetchPointsData = async () => {
            try {
                const db = getFirestore();
                const q = query(
                    collection(db, "Points"),
                    where("uid", "==", user.uid)
                );

                const snapshot = await getDocs(q);

                let claimed = 0;
                let pending = 0;
                let expired = 0;
                let earliest = null;

                const now = new Date();
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const points = data.points || 0;
                    const expiresAt = data.expiresAt?.toDate?.();
                    if (data.isClaimed) {
                        claimed += points;
                        return;
                    }
                    if (data.isExpired || (expiresAt && expiresAt <= now)) {
                        expired += points;
                        return;
                    }
                    if (expiresAt && expiresAt > now) {
                        pending += points;
                        if (!earliest || expiresAt < earliest.expiresAt?.toDate?.()) {
                            earliest = data;
                        }
                    }
                });

                setClaimedPoints(claimed);
                setPendingPoints(pending);
                setExpiredPoints(expired);

                if (earliest) {
                    setEarliestPoint(earliest);

                    const expiresAt = earliest.expiresAt.toDate();
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
        };

        fetchPointsData();
    }, [user]);

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
            console.error("NFC scan failed:", error);
            alert("Unable to start NFC scan. Make sure NFC is enabled.");
        }
    };

    const callVerifyScan = async (tagUID, binID) => {

        setVerifyStatus("Pending");
        setVerifyDescription("Please wait while we process your scan...");

        try {
            const db = getFirestore();
            const user = auth.currentUser;

            if (!user) {
                throw new Error("User not authenticated");
            }

            // Fetch pending points for this user
            const pointsQuery = query(
                collection(db, "Points"),
                where("uid", "==", user.uid),
                where("isClaimed", "==", false),
                where("isExpired", "==", false),
                where("expiresAt", ">", Timestamp.now())
            );
            const querySnapshot = await getDocs(pointsQuery);

            if (querySnapshot.empty) {
                setVerifyStatus("No Points Found");
                setVerifyDescription("You don't have any pending points to claim. Classify more items first!");
                setShowNfcOverlay(false);
                return;
            }

            const itemType = querySnapshot.docs[0].data().itemType;

            // Update all pending points to claimed
            const updatePromises = querySnapshot.docs.map((doc) =>
                updateDoc(doc.ref, {
                    isClaimed: true,
                    claimedAt: Timestamp.now(),
                    claimedBin: binID,
                    claimedTag: tagUID,
                })
            );

            await Promise.all(updatePromises);

            // Update user stats
            await setUserStats(user.uid, itemTypes);

            setVerifyStatus("Success");
            setVerifyDescription(
                `Scan verified successfully! ${querySnapshot.size} point(s) claimed.`
            );
            setShowNfcOverlay(false);
        } catch (err) {
            console.error("Error verifying scan:", err);
            setVerifyStatus("Error");
            setVerifyDescription(`Verification failed: ${err.message}`);
            setShowNfcOverlay(false);
        }
    };

    // Function to set the streak number based on the user's recycling activity
    const setUserStats = async (uid, itemTypes) => {
        if (!uid) return;

        const db = getFirestore();
        const statsRef = doc(db, "userStats", uid);
        const statsSnap = await getDoc(statsRef);

        const today = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        //calculate co2 saved based on the item type and add to total co2 saved in stats
        const co2PerItem = {
            "Paper": 0.005,
            "Plastic or Metal": 0.019,
            "Glass": 0.3,
        };
        const co2Amount = co2PerItem[itemType] || 0;

        // If user stats document doesn't exist, create it with initial values
        if (!statsSnap.exists()) {
            await setDoc(statsRef, {
                currentStreak: 1,
                lastDisposeDate: today,
                totalItemsRecycled: 1,
                co2Saved: co2Amount,
                createdAt: serverTimestamp(),
            });

            return;
        }
        const stats = statsSnap.data();

        let newStreak = stats.currentStreak || 0;

        if (stats.lastDisposeDate === today) {
            // User already disposed today
            // Streak should not increase again
            newStreak = stats.currentStreak || 1;
        } else if (stats.lastDisposeDate === yesterday) {
            // User disposed yesterday, continue streak
            newStreak += 1;
        } else {
            // User missed at least one day, reset streak
            newStreak = 1;
        }

        await updateDoc(statsRef, {
            currentStreak: newStreak,
            lastDisposeDate: today,
            totalItemsRecycled: (stats.totalItemsRecycled || 0) + 1,
            co2Saved: (stats.co2Saved || 0) + co2Amount,
            updatedAt: serverTimestamp(),
        });

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

    // Fetch user ranking when user changes
    useEffect(() => {
        if (!user) return;

        const fetchRank = async () => {
            try {
                const db = getFirestore();
                const userRef = doc(db, "Leaderboard", user.uid);
                const userSnap = await getDoc(userRef);
                if (!userSnap.exists()) return;

                const userPoints = userSnap.data().totalPoints;

                const q = query(
                    collection(db, "Leaderboard"),
                    where("totalPoints", ">", userPoints)
                );

                const countSnap = await getCountFromServer(q);
                setRanking(countSnap.data().count + 1);
            } catch (error) {
                console.error("Error fetching ranking:", error);
            }
        };

        fetchRank();
    }, [user]);

    // Get total user count for ranking display
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchCount = async () => {
            const db = getFirestore();
            const coll = collection(db, "Leaderboard");
            const snapshot = await getCountFromServer(coll);
            setTotalRankings(snapshot.data().count);
        };

        fetchCount();
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
                                            <p className="fw-bold fs-3 mb-2 text-warning">{pendingPoints.toLocaleString()}</p>
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
        </>
    );
}


