import { QRCodeCanvas } from "qrcode.react";
import { useRef, useEffect } from "react";

export default function QRDownload({ stationURL }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Trigger QR generation once when component mounts
    const canvas = document.createElement("canvas");
    const qrCode = (
      <QRCodeCanvas
        value={stationURL}
        size={200}
        includeMargin={true}
        ref={(node) => {
          if (node) {
            const tempCanvas = node.querySelector("canvas");
            if (tempCanvas) canvasRef.current = tempCanvas;
          }
        }}
      />
    );
  }, [stationURL]);

  const handleDownload = () => {
    const qrCanvas = document.querySelector("canvas");
    const url = qrCanvas.toDataURL("image/png");

    const a = document.createElement("a");
    a.href = url;
    a.download = "station-qr.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      {/* Hidden QR rendering */}
      <div style={{ display: "none" }}>
        <QRCodeCanvas value={stationURL} size={200} includeMargin={true} />
      </div>

      {/* Download button only */}
      <button className="btn btn-success" onClick={handleDownload}>
        Download QR Code
      </button>
    </>
  );
}
