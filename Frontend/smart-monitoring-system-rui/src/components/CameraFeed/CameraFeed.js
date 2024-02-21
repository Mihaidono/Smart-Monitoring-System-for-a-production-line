import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./CameraFeed.css";

const baseUrl = `${process.env.BACKEND_API_BASE_URL}:${process.env.BACKEND_API_PORT}`;

function CameraFeed() {
  const [cameraFeedSource, setCameraFeedSource] = useState(null);
  const sentError = useRef(false);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/get_image`);
        setCameraFeedSource(response.data.data);
        sentError.current = false;
      } catch (error) {
        if (!sentError.current) {
          console.error("Error fetching video data:", error);
          sentError.current = true;
        }
      }
    };

    fetchVideoData();

    const intervalId = setInterval(fetchVideoData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="image-display-container">
      <img alt="Camera Feed" src={cameraFeedSource} />
    </div>
  );
}

export default CameraFeed;
