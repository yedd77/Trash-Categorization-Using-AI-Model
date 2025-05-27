import React, { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar/Navbar';
import { useDropzone } from 'react-dropzone';
import './Categorizer.css';
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from 'firebase/app';

const Categorizer = () => {

  // State to manage files and image presence
  const [files, setFiles] = useState([]);
  const [hasImage, setHasImage] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false); // DEBUG: Track if button is clicked
  const [isPWA, setIsPWA] = useState(getIsPWA()); // PROD: Check if the app is running in PWA mode
  const [nfcError, setNfcError] = useState(""); // PROD: State to manage NFC error messages
  const [showNfcOverlay, setShowNfcOverlay] = useState(false); // PROD: State to manage NFC overlay visibility
  const [successfull, setSuccessfull] = useState(""); // DEBUG: State to manage successful NFC scan

  // handle uploading and dropping images
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: 'image/*',
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

  // Generate image previews
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

  // Handle paste events to capture images from clipboard
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


  //DEBUG : Handle button click to imitate classification process
  const dummyButtonClick = () => {
    setButtonClicked(true);
  }

  //PROD : Function to check if user is on PWA
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

  //PROD : Handle the NFC Scan event to verify if user is at the location
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
              setShowNfcOverlay(false);
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

  //PROD : Function to verify the NFC scan via invoking Firebase Cloud Function
  // then we give JSON response either the scan is successful or invalid
  const callVerifyScan = async (tagUID, binID) => {
    const functions = getFunctions(getApp(), "us-central1"); 
    const verifyScan = httpsCallable(functions, "verifyScan");

    try {
      const result = await verifyScan({ tagUID, binID });
      alert(result.data.message);
    } catch (err) {
      console.error("Scan verification failed:", err.message);
      alert(err.message);
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
                    <div className="d-flex justify-content-center mb-4">
                      <div className="text-center me-3">
                        <p className="fw-semibold empty f-8 text-muted">No image?</p>
                        <p className="fw-semibold empty f-8 text-muted">Try one of these images</p>
                      </div>
                      <img
                        src="https://cdn1.npcdn.net/images/1593584628fb904e0fb02092edd14651cf0f25c4a4.webp?md5id=6281642964070c8fc6df23720ee81281&new_width=1000&new_height=1000&w=1652761475&from=jpg"
                        className="rounded-3 me-3"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                      <img
                        src="https://cdn1.npcdn.net/images/1593584628fb904e0fb02092edd14651cf0f25c4a4.webp?md5id=6281642964070c8fc6df23720ee81281&new_width=1000&new_height=1000&w=1652761475&from=jpg"
                        className="rounded-3 me-3"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                      <img
                        src="https://cdn1.npcdn.net/images/1593584628fb904e0fb02092edd14651cf0f25c4a4.webp?md5id=6281642964070c8fc6df23720ee81281&new_width=1000&new_height=1000&w=1652761475&from=jpg"
                        className="rounded-3 me-3"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
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
                        className="btn btn-lg rounded-4 col-3 mb-4 shadow fw-bold text-center"
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

                  <div className="d-grid col-6 mt-5 pt-3 text-center gap-3 d-flex justify-content-center">
                    <button
                      className="btn btn-lg rounded-4 mb-4 shadow fw-bold col-6 "
                      type='button'
                      style={{ backgroundColor: '#80BC44', color: '#fff' }}>
                      <i className="bi bi-lightbulb-fill me-2"></i> Classify More
                    </button>

                    {isPWA && (<button
                      className="btn btn-lg rounded-4 mb-4 shadow fw-bold col-6 "
                      type='button'
                      style={{ backgroundColor: '#80BC44', color: '#fff' }}
                      onClick={handleNFCScan}>
                      <i className="bi bi-lightbulb-fill me-2"></i> Scan for rewards
                    </button>)}
                  </div>
                </div>
                <div className="mt-auto text-center px-4 pb-3">
                  <p className="fw-semibold empty text-muted">
                    Install our app to get rewarded each time you scan and throw it correctly.
                    {successfull && <span className="text-success">{successfull}</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </>
  );
};

export default Categorizer;