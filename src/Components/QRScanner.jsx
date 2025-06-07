import React, { useState } from "react";
import BarcodeScanner from "react-qr-barcode-scanner";
import './QRScanner.css';

const QRScanner = () => {
  const [data, setData] = useState("Not Found");

  return (
    <div className="scanner-overlay">
      <BarcodeScanner
        width={300}
        height={300}
        onUpdate={(err, result) => {
          if (result) setData(result.text);
          else setData("Not Found");
        }}
      />
      <div className="text text-white text-center px-4">
        <h2>Scan QR Code To Verify</h2>
        <p>Please place the QR Code within the frame to ensure grater success</p>
      </div>
      {/* Transparent scanning window */}
      <div className="scanner-window"></div>

      {/* Optional: Result display */}
      <div className="scanner-result d-flex flex-column justify-content-center align-items-center">
        <button
          className="btn btn-danger mt-3"
          onClick={() => {
            // You may want to call a prop like onClose if passed
            if (typeof window !== "undefined" && window.history) {
              window.history.back();
            }
          }}
        >
          Cancel
        </button>
        {data}
      </div>
    </div>
  );
};

export default QRScanner;
