/**
 * Webcam component for capturing face photos
 */
import { useRef, useState } from 'react';
import Webcam from 'react-webcam';

export const WebcamCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    
    // Convert base64 to blob
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'face_capture.png', { type: 'image/png' });
        onCapture(file);
        setIsCameraOpen(false);
      });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {isCameraOpen ? (
        <>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/png"
            width={300}
            height={300}
            className="rounded-lg border-2 border-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCapture}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              Capture
            </button>
            <button
              onClick={() => setIsCameraOpen(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={() => setIsCameraOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Open Camera
        </button>
      )}
    </div>
  );
};

export default WebcamCapture;
