import React, { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar/Navbar';
import { useDropzone } from 'react-dropzone';
import './Categorizer.css';
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from 'firebase/app';
import { getFirestore, Timestamp, collection, addDoc, query, where, getDocs, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import "./responsive.css";
import heic2any from "heic2any";
import QRScanner from '../Components/QRScanner.jsx';


const API_URL = import.meta.env.VITE_API_URL;

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
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [havePrediction, setHavePrediction] = useState(false);
  const [error, setError] = useState(null);
  const [onLoader, setOnLoader] = useState(false);
  const [itemType, setItemType] = useState("");
  const [instructions, setInstructions] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadLoaderActive, setUploadLoaderActive] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Set point for each item type thrown
  const typeTrash = 1;
  const typePaper = 4;
  const typePlastic = 6;
  const typeMetalGlass = 10;

  // Set up Firebase functions and Firestore
  const auth = getAuth();

  // handle drag and drop functionality using react-dropzone
  // This allows users to drop images into the designated area
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true, // Disable default click behavior
    onDrop: async (acceptedFiles) => {
      setUploadLoaderActive(true);
      const processedFiles = await Promise.all(
        acceptedFiles.map(async (file) => {

          // If it's a valid image file (jpeg/png/webp)
          if (file.type.startsWith('image/') && file.type !== 'image/heic') {
            return Object.assign(file, {
              preview: URL.createObjectURL(file),
            });
          }

          // If it's a .heic file
          if (file.type === 'image/heic' || file.name.endsWith('.heic')) {
            try {
              const convertedBlob = await heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 0.8,
              });

              return Object.assign(convertedBlob, {
                preview: URL.createObjectURL(convertedBlob),
                name: file.name.replace(/\.heic$/, '.jpg'),
              });
            } catch (err) {
              console.error("Failed to convert HEIC", err);
              setUploadError('Failed to convert HEIC image. Please upload a different format.');
              return null; // Skip file
            }
          }

          // Not an image
          return null;
        })
      );

      // Filter out nulls (failed conversions or invalid files)
      const validFiles = processedFiles.filter(Boolean);

      if (validFiles.length === 0) {
        setUploadError('Only valid image files (JPG, PNG, HEIC) are allowed.');
        setFiles([]);
        setHasImage(false);
      } else {
        setFiles(validFiles);
        setHasImage(true);
        setUploadError('');
      }
      setUploadLoaderActive(false);
    },
  });

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

  // Function to send the image file to the backend for classification
  // This function creates a FormData object, appends the file to it, and sends it to the backend API
  async function sendImageToBackend(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data;
  }

  // Function to handle the classification of the image
  // This function is called when the user clicks the "Classify Trash" button
  // It checks if there are any files uploaded, then sets necessary states for loading and error handling
  // It sends the image to the backend for classification and updates the prediction state with the result
  // If there is an error during the classification, it sets the error state
  // If the result contains predictions, it calls getPredictionSummary to process the result
  const handleClassify = async () => {
    if (!files.length) {
      setError('Please upload an image first.');
      return;
    }
    setButtonClicked(true);
    setOnLoader(true);
    setError(null);
    setPrediction(null);
    try {
      const result = await sendImageToBackend(files[0]);

      // Check if the result contains predictions
      if (result && result.predictions && result.predictions.length > 0) {
        setHavePrediction(true);
        getPredictionSummary(result); // Call function to get prediction summary
      } else {
        setHavePrediction(false);
        setError('No Trash Detected');
      }
    } catch (err) {
      setError('Failed to classify image.');
      console.error('Error classifying image:', err);
    } finally {
      setOnLoader(false);
    }
  };

  // This function processes the classification raw result to get more user-friendly
  // information about the prediction, such as item type, instructions, and confidence level
  // It sets the item type based on the best prediction and provides instructions for disposal
  // Once set, it will send itemType to setPendingPoint function to store the points in Firestore
  const getPredictionSummary = (result) => {

    // Set all possible prediction keywords for each item type (Lowercase)
    const paperKeywords = [
      "paper",
      "carton"
    ];
    const plasticKeywords = [
      "plastic bag - wrapper",
      "plastic container",
      "straw",
      "styrofoam piece",
      "other plastic",
      "lid",
      "cup",
      "bottle cap",
      "bottle"
    ];
    const metalGlassKeywords = [
      "aluminium foil",
      "broken glass",
      "can",
      "pop tab"
    ];
    const trashKeywords = [
      "cigarette",
      "other litter",
      "unlabeled litter"
    ]

    const bestPrediction = result.predictions.reduce((a, b) =>
      a.confidence > b.confidence ? a : b
    );

    let itemPredicted = bestPrediction.class_name.toLowerCase();
    let itemType = "";

    if (paperKeywords.some(keyword => itemPredicted.includes(keyword))) {
      itemType = "Paper";
      setInstructions(
        <>Keep it dry and clean. Try to fold or stack it. Please throw it into our <b>blue recycling bin</b>.</>
      );
    }
    else if (plasticKeywords.some(keyword => itemPredicted.includes(keyword))) {
      itemType = "Plastic";
      setInstructions(
        <>Rinse it out and remove any labels. Flatten if possible. Please throw it into our <b>green recycling bin</b>.</>
      );
    }
    else if (metalGlassKeywords.some(keyword => itemPredicted.includes(keyword))) {
      itemType = "Metal or glass";
      setInstructions(
        <>Rinse it out and remove any labels. Flatten if possible. Please throw it into our <b>yellow recycling bin</b>.</>
      );
    }
    else if (trashKeywords.some(keyword => itemPredicted.includes(keyword))) {
      itemType = "Trash";
      setInstructions("Please throw it into our black trash bin.");
    }

    setItemType(itemType); // Set the item type based on the best prediction
    setPrediction(bestPrediction.class_name); // Set the best prediction
    setConfidence((bestPrediction.confidence * 100).toFixed(1)); // Set the confidence level
    setPendingPoint(itemType); // Call function to set pending point
  }

  // Function to set pending points based on the item scanned
  // This function is called after the item type is determined
  // It checks if the user is authenticated and assigns points based on the item type
  // It then calls the storePoints function to store pending points in Firestore
  const setPendingPoint = async (itemScanned) => {
    let points = 0;

    if (isAuthenticated) {

      // Assign points based on the item type scanned
      if (itemScanned == "Trash") {
        points = typeTrash;
      } else if (itemScanned == "Paper") {
        points = typePaper;
      } else if (itemScanned == "Plastic") {
        points = typePlastic;
      } else if (itemScanned == "Metal or glass") {
        points = typeMetalGlass;
      } else {
        points = 0;
        console.error("Unknown item type scanned:", itemScanned); //DEBUG: Log unknown item type
      }

      const user = auth.currentUser;
      const uid = user ? user.uid : null;

      storePoints(uid, itemScanned, points); // Store points in Firestore
    }
  }

  // Function to store pending points in Firestore Firebase
  // This function can only available for PWA and auth user
  // It will invoke once via callback from dummyButtonClick() 
  // passing UID, itemType, and points and only be run with a successfull 
  // intended scan
  const db = getFirestore();
  const storePoints = async (uid, itemtype, points) => {

    try {
      let user = auth.currentUser;
      const username = user && user.displayName ? user.displayName : "user";
      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(now.toMillis() + 3 * 60 * 60 * 1000); // 3 hours expiration time

      await addDoc(collection(db, "Points"), {
        username: username,
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
                claimedAt: Timestamp.now(), // Set the claimed timestamp
                claimedBin: binID // Store the bin ID where the points were claimed
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

  // Utility function to capitalize the first letter of a string
  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Utility function to get the badge class based on the item type
  const getBadgeClass = (itemType) => {
    switch (itemType) {
      case "Paper":
        return "text-bg-info"; // green
      case "Plastic":
        return "text-bg-success"; // yellow
      case "Metal or glass":
        return "text-bg-warning"; // blue
      case "Trash":
        return "text-bg-dark"; // black/gray
      default:
        return "text-bg-secondary"; // default gray
    }
  };

  // Utility function to covert HEIC files to JPEG
  const convertHEIC = async (file) => {
    try {
      const outputBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8
      });

      const preview = URL.createObjectURL(outputBlob);
      return Object.assign(outputBlob, {
        preview,
        name: file.name.replace(/\.heic$/, '.jpg'),
      });
    } catch (e) {
      console.error("HEIC conversion failed", e);
      return null;
    }
  };

  const handleQRScan = () => {
    setShowQRScanner(true); // Show QR Scanner
  }

  const handleScanResult = (data) => {
    console.log("Scanned QR Code:", data);
    // Handle scanned data
  };

  // Utility constant to determine the footer content based on PWA and authentication status
  let footerContent;
  if (!isPWA) {
    footerContent = "Install our app and sign up to get rewarded each time you scan and throw it correctly.";
  } else if (!isAuthenticated) {
    footerContent = "Almost there! Sign up to start earning rewards for your waste disposal.";
  } else {
    footerContent = "";
  }

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
      {showQRScanner && (
        <div className="d-flex justify-content-center align-items-center flex-column min-vh-100" style={{ minHeight: '90vh' }}>
          <QRScanner
            onScan={handleScanResult}
            onClose={() => setShowQRScanner(false)} />
        </div>
      )}
      {/* Main container for the categorizer page before user click "Classify" */}
      {!buttonClicked ? (
        <div {...getRootProps()} style={{ position: 'relative' }}> {/* Main container with drag-and-drop functionality */}
          <Navbar />
          <input
            {...getInputProps()} />
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
              <div className="d-flex flex-column flex-grow-1 pt-5" id="page-1">
                <p className="fw-bold empty fs-2 text-center">What Type of Waste Is This?</p>
                <p className="fw-semibold empty text-muted text-center lh-sm mb-5">
                  Not sure how to dispose of it? Upload a picture and we&#39;ll help you out.
                </p>
                {/* Conditionally render elements */}
                {!hasImage ? (
                  <>
                    {uploadLoaderActive ? (
                      <div className="d-flex text-center justify-content-center align-items-center pt-6 mb-2 mb-md-0 me-md-3">
                        <div className="uploadLoader">
                          <span className="dotsElement"></span>
                          <span className="dotsElement "></span>
                          <span className="dotsElement"></span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="d-flex justify-content-center mb-5">
                          <div
                            className="card border-0 rounded-4 shadow resizeCard"
                            style={{ height: '30vh' }}>
                            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
                              <button
                                className="btn btn-lg rounded-4 col-8 mb-4 shadow fw-bold responsive-font"
                                id="btn-1"
                                type="button"
                                style={{ backgroundColor: '#80BC44', color: '#fff' }}
                                onClick={open}>
                                <i className="bi bi-upload me-3"></i>Upload Image
                              </button>
                              <p className="fw-medium empty fs-7 text-muted lh-sm">or drop a file here</p>
                              <p className="fw-medium empty fs-7 text-muted lh-sm">CTRL + V to paste an image</p>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex justify-content-center text-danger">
                          <p className="fw-semibold empty fs-6 lh-sm mb-3">
                            {uploadError}
                          </p>
                        </div>
                        <div className="d-flex flex-column flex-md-row justify-content-center align-items-center mb-7 text-center gap-2">
                          <div className="mb-2 mb-md-0 me-md-3">
                            <p className="fw-medium text-muted mb-1">No image?</p>
                            <p className="fw-medium text-muted mb-0">Try one of these images</p>
                          </div>
                          <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
                            <img
                              src="https://cdn1.npcdn.net/images/1593584628fb904e0fb02092edd14651cf0f25c4a4.webp?md5id=6281642964070c8fc6df23720ee81281&new_width=1000&new_height=1000&w=1652761475&from=jpg"
                              className="rounded-3"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                            <img
                              src="https://cdn1.npcdn.net/images/1593584628fb904e0fb02092edd14651cf0f25c4a4.webp?md5id=6281642964070c8fc6df23720ee81281&new_width=1000&new_height=1000&w=1652761475&from=jpg"
                              className="rounded-3"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                            <img
                              src="https://cdn1.npcdn.net/images/1593584628fb904e0fb02092edd14651cf0f25c4a4.webp?md5id=6281642964070c8fc6df23720ee81281&new_width=1000&new_height=1000&w=1652761475&from=jpg"
                              className="rounded-3"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="d-flex justify-content-center mb-5">
                      <div className="card border-0" style={{ height: '30vh' }}>
                        <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
                          <img
                            src={files[0].preview}
                            className="rounded-3 mb-3"
                            style={{ objectFit: 'cover', height: '200px', width: '100%', margin: '0 auto' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-center d-flex flex-column align-items-center mb-3">
                      <button
                        className="btn btn-lg rounded-4 mb-3 shadow fw-bold text-center responsive-font"
                        id="btn-2"
                        type="button"
                        style={{ backgroundColor: '#80BC44', color: '#fff' }}
                        onClick={handleClassify} // DEBUG: Simulate classification
                      >
                        <i className="bi bi-lightbulb-fill me-2"></i>Classify Trash
                      </button>
                      <button
                        className="btn btn-lg rounded-4 mb-3 shadow fw-bold text-center responsive-font"
                        id="btn-2"
                        type="button"
                        style={{ backgroundColor: '#c9665f', color: '#fff' }}
                        onClick={() => window.location.reload()}
                      >
                        <i className="bi bi-file-earmark-x me-2"></i>Remove Image
                      </button>
                    </div>

                  </>
                )}
                {!isPWA && (
                  <div className="mt-auto text-center px-4 pb-3">
                    <p className="fw-medium empty text-muted">
                      Install our app to get rewarded each time you scan and throw it correctly.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Displayed layout after user click "Classify Image" */}
          <Navbar />
          {onLoader ? (
            <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '90vh' }}>
              <div className="dots-spinner">
                <span className="dot-1"></span>
                <span className="dot-2"></span>
                <span className="dot-3"></span>
              </div>
              <div className="loading-text pt-3" aria-live="polite">
                Classifying<span id="dot-loader">.</span>
              </div>
            </div>
          ) : (
            <div className="container-fluid">
              <div className="d-flex flex-column" style={{ minHeight: '90vh' }}>
                <div className="d-flex flex-column flex-grow-1 pt-5" id="page-3">
                  <div className="main-section container">
                    <div className="result-card d-flex flex-column align-items-center justify-content-center">
                      <div className="d-flex justify-content-center mb-2">
                        <div className="card border-0" style={{ height: '30vh' }}>
                          <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
                            <img
                              src={files[0].preview}
                              className="rounded-3 mb-1"
                              style={{ objectFit: 'cover', height: '200px', width: '100%', margin: '0 auto' }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-block">
                        {havePrediction && (
                          <div className="text-block">
                            <p className="fw-semibold empty fs-2">Scanned Item: {capitalizeWords(prediction)}</p>
                            <p className='fw-medium empty fs-2'>Category: {itemType}</p>
                            <p className="text-muted fw-medium mb-1">Confidence Level {confidence}%</p>
                            <span className={`badge ${getBadgeClass(itemType)} mb-2`}>{itemType} Bin</span>
                            <p className="text-muted lh-sm mb-1">{instructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {error && (
                      <>
                        <p className="text-semibold fw-semibold fs-2 lh-sm my-1">No Trash Detected</p>
                        <p className='text-muted fw-semibold lh-sm'>There are no trash in the image</p>
                      </>
                    )}
                    <div className="mt-3 pt-3 d-flex flex-column flex-md-row justify-content-center align-items-center gap-3 text-center">
                      <button
                        className="btn btn-lg rounded-4 shadow fw-bold w-100 w-md-25 text-nowrap responsive-font"
                        type="button"
                        style={{ backgroundColor: '#80BC44', color: '#fff' }}
                        onClick={() => window.location.reload()}
                      >
                        <i className="bi bi-lightbulb-fill me-2"></i> Classify More
                      </button>

                      {/*{isPWA && error !== "No Trash Detected" && isAuthenticated && (*/
                        <>
                          <button
                            className="btn btn-lg rounded-4 shadow fw-bold w-100 w-md-25 text-nowrap responsive-font"
                            type="button"
                            style={{ backgroundColor: '#80BC44', color: '#fff' }}
                            onClick={handleNFCScan}>
                            <i className="bi bi-lightbulb-fill me-2"></i> Scan NFC for rewards
                          </button>
                          <button
                            className="btn btn-lg rounded-4 shadow fw-bold w-100 w-md-25 text-nowrap responsive-font"
                            type="button"
                            style={{ backgroundColor: '#80BC44', color: '#fff' }}
                            onClick={handleQRScan}>
                            <i className="bi bi-lightbulb-fill me-2"></i> Scan QR Code for rewards
                          </button>
                        </>
                      /*)}*/}
                    </div>
                  </div>
                  {!isPWA && (
                    <div className="mt-auto text-center px-8 pb-3">
                      {successfull && <span className="text-success">{successfull}</span>}
                      <p className="fw-semibold empty text-muted">
                        {footerContent}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Categorizer;