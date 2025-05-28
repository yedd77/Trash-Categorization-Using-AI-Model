import React, { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar/Navbar';
import { useDropzone } from 'react-dropzone';
import './Categorizer.css';
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from 'firebase/app';
import { getFirestore, Timestamp, collection, addDoc, query, where, getDocs, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';


const Categorizer = () => {

  // State to manage files and image presence
  const [files, setFiles] = useState([]);
  const [hasImage, setHasImage] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false); // DEBUG: Track if button is clicked
  const [isPWA, setIsPWA] = useState(getIsPWA()); // PROD: Check if the app is running in PWA mode
  const [nfcError, setNfcError] = useState(""); // PROD: State to manage NFC error messages
  const [showNfcOverlay, setShowNfcOverlay] = useState(false); // PROD: State to manage NFC overlay visibility
  const [successfull, setSuccessfull] = useState(""); // DEBUG: State to manage successful NFC scan
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  //set point for each item type thrown
  const typeTrash = 1;
  const typePaper = 4;
  const typePlastic = 6;
  const typeMetalGlass = 10;

  // PROD: Set up Firebase functions and Firestore
  const auth = getAuth();

  // FLOW 1 
  // handle drag and drop functionality using react-dropzone
  // This allows users to drop images into the designated area
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    noClick: true, // Disable default click behavior
    onDrop: (acceptedFiles) => {
      const updatedFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      setFiles(updatedFiles);
      setHasImage(updatedFiles.length > 0);
    },
  });

  // FLOW 1 
  // handle paste events to allow users to paste images directly
  // This listens for paste events and checks if the pasted content is an image
  // If an image is pasted, it creates a preview URL and updates the files state
  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;

      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const preview = URL.createObjectURL(file);
            const newFile = Object.assign(file, { preview });

            setFiles((prevFiles) => [...prevFiles, newFile]);
            setHasImage(true);
          }
        }
      }
    };
    // Add event listener for paste events
    document.addEventListener('paste', handlePaste);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  // PROD : FLOW 1 
  // Check if the user is authenticated
  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        console.log("User is not authenticated");
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe(); // Clean up listener
  }, []);

  // PROD : FLOW 1
  // This hook checks if the app is running in PWA mode which will allows
  // the user to scan NFC tags and store points in Firestore
  function getIsPWA() {
    // Check if the app is running as a PWA
    if (document.referrer.startsWith('android-app://')) return true; // Trusted Web Activity (TWA) on Android
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
    if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) return true;
    if (window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches) return true;
    if (window.navigator.standalone === true) return true; // iOS standalone check

    return false;
  }

  // FLOW 2 
  // Generate image previews for the uploaded files
  // This maps over the files state and creates an img element for each file
  const images = files.map((file) => (
    <img
      key={file.name}
      src={file.preview}
      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
      alt="preview"
      onLoad={() => {
        URL.revokeObjectURL(file.preview);
      }}
    />
  ));

  // DEBUF : FLOW 3
  // This function create a dummy simulation of classification of an item and stores points in Firestore
  // It sets the buttonClicked state to true, which triggers the change of layout
  // if user is authenticated, it will call the point function with the user's UID, item type, and points.
  // to store the record of pending points in Firestore.
  const dummyButtonClick = () => {
    setButtonClicked(true);
    let points = 0; // Initialize points variable
    let itemtype = ""; // Initialize item type variable

    if (isAuthenticated) {
      //PROD : manually set the item type as plastic
      const itemScanned = "plastic";

      //PROD : Set points based on item type
      if (itemScanned == "trash") {
        points = typeTrash;
      } else if (itemScanned == "paper") {
        points = typePaper;
      } else if (itemScanned == "plastic") {
        points = typePlastic;
      } else if (itemScanned == "metal" || itemScanned == "glass") {
        points = typeMetalGlass;
      } else {
        points = 0;
        console.error("Unknown item type scanned:", itemScanned); //DEBUG: Log unknown item type
      }

      //PROD : Set user UID
      const user = auth.currentUser;
      const uid = user ? user.uid : null; // Get the authenticated user's UID

      //PROD : Set item type scanned
      itemtype = itemScanned;

      storePoints(uid, itemtype, points);
    }
  }

  // PROD : FLOW 4
  // Function to store pending points in Firestore Firebase
  // This function can only available for PWA and auth user
  // It will invoke once via callback from dummyButtonClick() 
  // passing UID, itemType, and points and only be run with a successfull 
  // intended scan
  const db = getFirestore();
  const storePoints = async (uid, itemtype, points) => {
    try {
      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(now.toMillis() + 3 * 60 * 60 * 1000); // 3 hours expiration time

      await addDoc(collection(db, "Points"), {
        uid: uid,
        itemType: itemtype,
        points: points,
        createdAt: now,
        expiresAt: expiresAt,
        isClaimed: false,
        isExpired: false,
      });

      console.log("Pending points stored successfully."); // DEBUG: Log success message

    } catch (error) {

      console.error("Error storing pending points:", error); // DEBUG: Log error message
    }
  };

  // PROD : FLOW 4
  //To have this function active, the user must be authenticated and the app must be running in PWA mode
  // This function is triggered when the user clicks the "Scan for rewards" button
  //it well set the showNfcOverlay state to true, indicating that the NFC scan is ready
  //it then will read the NFC tag using the NDEFReader API
  // If the NFC tag data is valid, it will decode the data and extract the tagUID and binID from the URL
  // then it will call the callVerifyScan function to verify the scan
  const handleNFCScan = async () => {
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

              console.log("NFC Tag UID:", tagUID); // DEBUG: Log NFC tag UID
              console.log("NFC Bin ID:", binID); // DEBUG: Log NFC bin ID
              console.log("NFC URL Data:", urlData); // DEBUG: Log NFC URL data

              if (!tagUID || !binID) {
                alert("Invalid NFC tag format.");
                setNfcError("Invalid NFC.");
                return;
              }

              // Call function to verify the scan
              callVerifyScan(tagUID, binID);
              setSuccessfull("Scan successful!"); // DEBUG: Set success message
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

  // PROD : FLOW 5
  // This function is called from handleNFCScan after a successful NFC scan
  // Then it will call the Firebase function "verifyScan" with the tagUID and binID as parameters
  // The function will verify the scan and update the user's points in Firestore
  // If the scan is successful, 
  const callVerifyScan = async (tagUID, binID) => {
    const functions = getFunctions(getApp(), "us-central1");
    const verifyScan = httpsCallable(functions, "verifyScan");

    try {
      const result = await verifyScan({ tagUID, binID });

      if (result.data.success) {
        alert(result.data.message);

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
                claimedAt: Timestamp.now() // Set the claimed timestamp
              })
            ));
          });

          alert("Points claimed successfully!");
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
        </div>
      )}
      {/* Main container for the categorizer page before user click "Classify" */}
      {!buttonClicked ? (
        <div {...getRootProps()} style={{ position: 'relative' }}> {/* Main container with drag-and-drop functionality */}
          <Navbar />
          <input {...getInputProps()} />
          <div className="container-fluid">
            {/* Full-Screen Overlay */}
            {isDragActive && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  zIndex: 9999,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 'bold',
                }}
              >
                Drop image everywhere
              </div>
            )}
            <div className="d-flex flex-column" style={{ minHeight: '90vh' }}>
              {/* Page 1 */}
              <div className="d-flex flex-column flex-grow-1 pt-5" id="page-1">
                <p className="fw-bold empty fs-2 text-center">What Kind of Trash Is This</p>
                <p className="fw-semibold empty text-muted text-center lh-sm">
                  Not sure what kind of trash you have? Upload picture
                </p>
                <p className="fw-semibold empty text-muted text-center lh-sm mb-5">
                  and let us figure it out for you.
                </p>
                {/* Conditionally render elements */}
                {!hasImage ? (
                  <>
                    <div className="d-flex justify-content-center mb-5">
                      <div
                        className="card border-0 rounded-4 shadow resizeCard"
                        style={{ height: '30vh' }}
                      >
                        <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
                          <button
                            className="btn btn-lg rounded-4 col-8 mb-4 shadow fw-bold"
                            id="btn-1"
                            type="button"
                            style={{ backgroundColor: '#80BC44', color: '#fff' }}
                            onClick={open} // Manually trigger file input
                          >
                            <i className="bi bi-upload me-3"></i>Upload Image
                          </button>
                          <p className="fw-semibold empty f-9 text-muted lh-sm">or drop a file here</p>
                          <p className="fw-semibold empty f-9 text-muted lh-sm">CTRL + V to paste an image</p>
                        </div>
                      </div>
                    </div>
                    <div>{images}</div>
                    <div className="d-flex flex-column flex-md-row justify-content-center align-items-center mb-7 text-center gap-2">
                      <div className="mb-2 mb-md-0 me-md-3">
                        <p className="fw-semibold text-muted mb-1">No image?</p>
                        <p className="fw-semibold text-muted mb-0">Try one of these images</p>
                      </div>

                      <div className="d-flex flex-wrap justify-content-center gap-2">
                        <img
                          src="https://cdn1.npcdn.net/images/1593584628fb904e0fb02092edd14651cf0f25c4a4.webp?md5id=6281642964070c8fc6df23720ee81281&new_width=1000&new_height=1000&w=1652761475&from=jpg"
                          className="rounded-3"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                        <img
                          src="https://cdn1.npcdn.net/images/1593584628fb904e0fb02092edd14651cf0f25c4a4.webp?md5id=6281642964070c8fc6df23720ee81281&new_width=1000&new_height=1000&w=1652761475&from=jpg"
                          className="rounded-3"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                        <img
                          src="https://cdn1.npcdn.net/images/1593584628fb904e0fb02092edd14651cf0f25c4a4.webp?md5id=6281642964070c8fc6df23720ee81281&new_width=1000&new_height=1000&w=1652761475&from=jpg"
                          className="rounded-3"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="d-flex justify-content-center mb-5">
                      <div className="card border-0" style={{ height: '30vh' }}>
                        <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
                          <img
                            src={files[0].preview}
                            alt="Plastic Bag"
                            className="rounded-3 mb-3"
                            style={{ objectFit: 'cover', height: '200px', width: '100%', margin: '0 auto' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <button
                        className="btn btn-lg rounded-4 mb-4 shadow fw-bold text-center w-75 w-md-25"
                        id="btn-2"
                        type="button"
                        style={{ backgroundColor: '#80BC44', color: '#fff' }}
                        onClick={dummyButtonClick} // DEBUG: Simulate classification
                      >
                        <i className="bi bi-lightbulb-fill me-2"></i>Classify Trash
                      </button>
                    </div>

                  </>
                )}
                <div className="mt-auto text-center px-4 pb-3">
                  <p className="fw-semibold empty text-muted">
                    Install our app to get rewarded each time you scan and throw it correctly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Displayed layout after user click "Classify Image" */}
          <Navbar />
          <div className="container-fluid">
            <div className="d-flex flex-column" style={{ minHeight: '90vh' }}>
              <div className="d-flex flex-column flex-grow-1 pt-5" id="page-3">
                <div className="main-section container">
                  <div className="result-card">
                    <img
                      src={files[0].preview} />
                    <div className="text-block">
                      <p className="fw-bold empty fs-2 mb-2">Plastic Bag (Plastic)</p>
                      <p className="text-muted lh-sm mb-2">Please rinse and throw it in our blue recycle bin</p>
                      <p className="text-muted lh-sm">
                        Almost there!
                        <br />
                        Install our app and dispose of your waste properly to start earning rewards.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 pt-3 d-flex flex-column flex-md-row justify-content-center align-items-center gap-3 text-center">
                    <button
                      className="btn btn-lg rounded-4 shadow fw-bold w-100 w-md-25 text-nowrap"
                      type="button"
                      style={{ backgroundColor: '#80BC44', color: '#fff' }}
                      onClick={() => window.location.reload()}
                    >
                      <i className="bi bi-lightbulb-fill me-2"></i> Classify More
                    </button>

                    {isPWA && (
                      <button
                        className="btn btn-lg rounded-4 shadow fw-bold w-100 w-md-25 text-nowrap"
                        type="button"
                        style={{ backgroundColor: '#80BC44', color: '#fff' }}
                        onClick={handleNFCScan}
                      >
                        <i className="bi bi-lightbulb-fill me-2"></i> Scan for rewards
                      </button>
                    )}
                  </div>

                </div>
                {!isPWA && (
                  <div className="mt-auto text-center px-8 pb-3">
                    <p className="fw-semibold empty text-muted">
                      Install our app to get rewarded each time you scan and throw it correctly.
                      {successfull && <span className="text-success">{successfull}</span>}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

    </>
  );
};

export default Categorizer;