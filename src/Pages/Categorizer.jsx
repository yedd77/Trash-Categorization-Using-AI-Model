import React, { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar/Navbar';
import { useDropzone } from 'react-dropzone';
import './Categorizer.css';
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from 'firebase/app';
import { getFirestore, Timestamp, collection, addDoc, query, where, getDocs, updateDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import "./responsive.css";
import heic2any from "heic2any";
import QRScanner from '../Components/QRScanner.jsx';
import blockhash from 'blockhash-core';

const API_URL = import.meta.env.VITE_API_URL;

const Categorizer = () => {

  // State to manage files and image presence
  const [files, setFiles] = useState([]);
  const [hasImage, setHasImage] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [isPWA, setIsPWA] = useState(getIsPWA());
  const [nfcError, setNfcError] = useState("");
  const [showNfcOverlay, setShowNfcOverlay] = useState(false);
  const [successfull, setSuccessfull] = useState("");
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
  const [displayPoint, setDisplayPoint] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showVerifyProcess, setShowVerifyProcess] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState("");
  const [verifyDescription, setVerifyDescription] = useState("");
  const [hashExist, setHashExist] = useState(false);

  // Set point for each item type thrown
  const typeTrash = 1;
  const typePaper = 4;
  const typePlastic = 6;
  const typeMetalGlass = 10;

  // Set up Firebase functions and Firestore
  const auth = getAuth();

  // Upload method : Drag and Drop 1
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
            const preview = URL.createObjectURL(file);

            try {
              const hash = await getImageHash(file);
              console.log("Image Hash:", hash);
              checkAndStoreHash(hash);
              return Object.assign(file, { preview, hash });
            } catch (error) {
              console.error("Error generating image hash:", error);
              setUploadError('Failed to generate image hash. Please try again.');
              return null; // Skip file if hash generation fails
            }
          }
          // If it's a .heic file
          if (file.type === 'image/heic' || file.name.endsWith('.heic')) {
            try {
              const convertedBlob = await heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 0.8,
              });

              const preview = URL.createObjectURL(convertedBlob);
              const hash = await getImageHash(convertedBlob);
              console.log("Converted HEIC Image Hash:", hash);
              checkAndStoreHash(hash);
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
            const hash = getImageHash(file);
            checkAndStoreHash(hash);

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

  async function getImageHash(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 128;
        ctx.drawImage(img, 0, 0, 128, 128);
        const imageData = ctx.getImageData(0, 0, 128, 128);
        const hash = blockhash.bmvbhash(imageData, 16);
        resolve(hash);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  async function checkAndStoreHash(hash) {
    const db = getFirestore();
    const hashRef = doc(db, 'hashes', hash);
    const snapshot = await getDoc(hashRef);

    if (snapshot.exists()) {
      console.log("Hash already exists in Firestore:");
      setHashExist(true);
    } else {
      await setDoc(hashRef, {
        createdAt: serverTimestamp()
      });
      setHashExist(false);
    }
  }

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
      "unlabeled litter",
      "plastic bag - wrapper"
    ];

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
    console.log(bestPrediction.class_name)
    setConfidence((bestPrediction.confidence * 100).toFixed(1)); // Set the confidence level
    setPendingPoint(itemType); // Call function to set pending point
  }

  // Function to set pending points based on the item scanned
  // This function is called after the item type is determined
  // It checks if the user is authenticated and assigns points based on the item type
  // It then calls the storePoints function to store pending points in Firestore
  const setPendingPoint = async (itemScanned) => {
    let points = 0;

    if (isAuthenticated && !hashExist) {
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
        console.error("Unknown item type scanned:", itemScanned);
      }

      setDisplayPoint(points);
      const user = auth.currentUser;
      const uid = user ? user.uid : null;

      storePoints(uid, itemScanned, points); // Store points in Firestore
    }
  }

  // Function to store pending points in Firestore Firebase
  // This function can only available for PWA and auth user
  // It will invoke once via callback from setPendingPoint() 
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
    } catch (error) {

      console.error("Error storing pending points:", error);
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

  // This function is called when the user clicks the "Scan QR Code" button
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

  // This function is called from handleNFCScan after a successful NFC scan
  // Then it will call the Firebase function "verifyScan" with the tagUID and binID as parameters
  // The function will verify the scan and update the user's points in Firestore
  // If the scan is successful, 
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
          setVerifyDescription("Scan verified successfully. Points have been credited.");
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
                  fontWeight: 'bold'
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
                            {["/sample1.jpg", "/sample2.jpg", "/sample3.jpg"].map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                className="rounded-3"
                                style={{ width: '40px', height: '40px', objectFit: 'cover', cursor: 'pointer' }}
                                onClick={async () => {
                                  const url = `/sample${idx + 1}.jpg`;
                                  const response = await fetch(url);
                                  const blob = await response.blob();
                                  const file = new File([blob], `sample${idx + 1}.jpg`, { type: blob.type });
                                  const hash = await getImageHash(file);
                                  checkAndStoreHash(hash);
                                  console.log("Sample Image Hash:", hash);
                                  file.preview = URL.createObjectURL(file);
                                  setFiles([file]);
                                  setHasImage(true);
                                  setUploadError('');
                                }}
                                alt="sample"
                              />
                            ))}
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
                            style={{ objectFit: 'cover', height: '200px', width: '100%', margin: '0 auto' }} />
                        </div>
                      </div>
                    </div>

                    <div className="text-center d-flex flex-column align-items-center mb-3">
                      <button
                        className="btn btn-lg rounded-4 mb-3 shadow fw-bold text-center responsive-font"
                        id="btn-2"
                        type="button"
                        style={{ backgroundColor: '#80BC44', color: '#fff' }}
                        onClick={handleClassify}>
                        <i className="bi bi-lightbulb-fill me-2"></i>Classify Trash
                      </button>
                      <button
                        className="btn btn-lg rounded-4 mb-3 shadow fw-bold text-center responsive-font"
                        id="btn-2"
                        type="button"
                        style={{ backgroundColor: '#c9665f', color: '#fff' }}
                        onClick={() => window.location.reload()} >
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
                          onClick={() => {
                            setShowVerifyModal(false);
                            setShowVerifyProcess(false);
                          }}
                          aria-label="Close"
                        ></button>
                      </div>
                      <div className="modal-body">
                        To claim your recycling points, please verify that you are near an authorized recycling station.
                        You can do this by scanning a QR code or tapping your device on the NFC tag located at the station.
                        <br /><br />
                        You can also choose to claim your points later, but they will expire in 3 hours if not verified.
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
                          <i className="bi bi-lightbulb-fill me-2"></i> Classify More
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column" style={{ minHeight: '90vh' }}>
                  <div className="d-flex flex-column flex-grow-1 pt-5">
                    <div className="main-section container">
                      <div className="result-card">
                        <div className="d-flex justify-content-center mb-2">
                          <div className="card border-0" style={{ height: '30vh' }}>
                            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
                              <img
                                src={files[0].preview}
                                className="rounded-3 mb-1"
                                style={{ objectFit: 'cover', height: '200px', width: '100%', margin: '0 auto' }} />
                            </div>
                          </div>
                        </div>
                        <div className="text-block">
                          {havePrediction && (
                            <div className="text-block">
                              <p className='fw-semibold empty fs-4'>Category: {itemType}</p>
                              <p className="text-muted fw-medium mb-1 fs-6">Confidence Level {confidence}%</p>
                              <span className={`badge ${getBadgeClass(itemType)} mb-2`}>{itemType} Bin</span>
                              <p className="text-muted lh-sm mb-3 ">{instructions}</p>

                              {!isAuthenticated && (
                                <p className="text-muted lh-sm mb-1">Download and use our app to get point when throwing out trash!</p>
                              )}

                              {hashExist && isAuthenticated ? (
                                <p className="text-muted lh-sm mb-1">
                                  This image has already been scanned and rewarded before. Please try another image to earn points.
                                </p>
                              ) : !hashExist && isAuthenticated ? (
                                <p className="text-muted lh-sm mb-1">
                                  You have earned {displayPoint} points, which are currently pending. Visit a nearby recycling station and dispose of your trash in the correct bin to claim your points.
                                </p>
                              ) : null}
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
                      <div className="mt-3 pt-3 d-flex flex-direction-column flex-md-row justify-content-center align-items-center gap-3 text-center">
                        <button
                          className="btn rounded-4 shadow fw-semibold w-100 w-md-25 text-nowrap responsive-font"
                          type="button"
                          style={{ backgroundColor: '#80BC44', color: '#fff' }}

                          onClick={() => window.location.reload()}>
                          <i className="bi bi-lightbulb-fill me-2"></i> Classify More
                        </button>
                        {isPWA && error !== "No Trash Detected" && isAuthenticated && !hashExist && (
                          <button
                            className="btn btn-outline-secondary rounded-4 fw-semibold w-100 w-md-25 text-nowrap responsive-font"
                            type="button"
                            style={{ color: 'rgb(128, 188, 68)', border: '2px solid rgb(128, 188, 68)', }}
                            onClick={() => {
                              setShowVerifyProcess(true);
                              setShowVerifyModal(true);
                            }}>
                            <i className="bi bi-patch-check me-2"></i> Verify Location
                          </button>
                        )}
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
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Categorizer;