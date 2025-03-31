import { useEffect, useRef } from "react";

const CameraComponent = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Camera access denied", err));

    return () => {
      if (videoRef.current)
        videoRef.current.srcObject
          ?.getTracks()
          .forEach((track) => track.stop());
    };
  }, []);

  return <video ref={videoRef} autoPlay playsInline />;
};

export default CameraComponent;
