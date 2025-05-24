import React, { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar/Navbar';
import { useDropzone } from 'react-dropzone';

const API_URL = import.meta.env.VITE_API_URL;

const Categorizer = () => {
  const [files, setFiles] = useState([]);
  const [hasImage, setHasImage] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  // Example function to call Flask API
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

  // Function to handle image classification
  const handleClassify = async () => {
    if (!files.length) {
      setError('Please upload an image first.');
      return;
    }
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const result = await sendImageToBackend(files[0]);
      setPrediction(result);
    } catch (err) {
      setError('Failed to classify image.');
    } finally {
      setLoading(false);
    }
  };

  // Add this function inside your Categorizer component
  const handleClear = () => {
    setFiles([]);
    setHasImage(false);
    setPrediction(null);
    setError(null);
  };

  return (
    <div {...getRootProps()} style={{ position: 'relative' }}>
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
                    onClick={handleClassify}
                  >
                    <i className="bi bi-lightbulb-fill me-2"></i>Classify Trash
                  </button>
                </div>

                {/* Show loading, error, or prediction result here */}
                <div className="text-center mb-3">
                  {loading && <p>Classifying...</p>}
                  {error && <p className="text-danger">{error}</p>}
                  {prediction && prediction.predictions && prediction.predictions.length > 0 ? (
                    <div>
                      <h5>Prediction Result:</h5>
                      {(() => {
                        // Find the prediction with the highest confidence
                        const best = prediction.predictions.reduce((a, b) =>
                          a.confidence > b.confidence ? a : b
                        );
                        return (
                          <div>
                            <strong>{best.class_name}</strong> ({(best.confidence * 100).toFixed(1)}%)
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    prediction && <div>No trash detected.</div>
                  )}
                </div>
              </>
            )}

            {hasImage && (
              <div className="text-center">
                <button
                  className="btn btn-lg rounded-4 col-3 mb-4 shadow fw-bold text-center"
                  id="btn-clear"
                  type="button"
                  style={{ backgroundColor: '#d9534f', color: '#fff' }}
                  onClick={handleClear}
                >
                  <i className="bi bi-x-circle me-2"></i>Clear Image
                </button>
              </div>
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
  );
};

export default Categorizer;