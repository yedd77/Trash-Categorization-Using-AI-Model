import React, { useState } from "react";
import BarcodeScanner from "react-qr-barcode-scanner";
import './QRScanner.css';

const QRScanner = ({ onClose, onSend }) => {
  const [data, setData] = useState("Not Found");

  const handleUpdate = (err, result) => {
    if (result) {
      setData(result.text);
      if (result.text.startsWith("https://bin-buddy-v1.web.app/binVerify/")) {
        if (onSend) onSend(result.text); // send data to parent
        onClose(); // close scanner
      }
    } else {
      setData("Not Found");
    }
  };

  return (
    <div className="scanner-overlay">
      <BarcodeScanner
        width={300}
        height={300}
        onUpdate={handleUpdate}
      />
      <div className="text text-white text-center px-4 z-index-10 position-fixed">
        <h2>Scan QR Code To Verify</h2>
        <p>Please place the QR Code within the frame to ensure greater success</p>
      </div>
      <div className="scanner-window"></div>
      <div className="scanner-result d-flex flex-column justify-content-center align-items-center">
        <button
          className="btn btn-secondary mt-3"
          onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default QRScanner;
