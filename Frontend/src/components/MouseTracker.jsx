import { useEffect, useRef } from "react";
import axios from "axios";

export default function MouseTracker() {
  const movementBuffer = useRef([]);
  const sessionStart = useRef(Date.now());

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Capture every 60 seconds
    const trackingInterval = setInterval(() => {
      const time_ms = Date.now() - sessionStart.current;
      movementBuffer.current.push({ time_ms, x: lastX, y: lastY });
    }, 60000);

    // Send every 60 seconds to Flask backend
    const uploadInterval = setInterval(async () => {
      if (movementBuffer.current.length > 0) {
        const dataToSend = [...movementBuffer.current];
        movementBuffer.current = [];

        try {
          const res = await axios.post(
            "http://localhost:5001/analyze-mouse",
            dataToSend,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          const { anomaly_score, is_anomaly } = res.data;
          console.log("Anomaly Score:", anomaly_score);
          if (is_anomaly) {
            console.warn("⚠ Suspicious cursor behavior detected!");
          }
        } catch (err) {
          console.error("Error analyzing mouse movement:", err);
        }
      }
    }, 60000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(trackingInterval);
      clearInterval(uploadInterval);
    };
  }, []);

  return null;
}
