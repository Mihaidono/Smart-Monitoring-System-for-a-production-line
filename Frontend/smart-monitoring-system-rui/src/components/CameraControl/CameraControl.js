import "./CameraControl.css";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { CameraControlDTO } from "../../models/CameraControl";
import { CameraDirections } from "../../config/enums/CameraDirections";
import { HomeOutlinedIcon } from "@mui/icons-material";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowLeftOutlinedIcon from "@mui/icons-material/KeyboardArrowLeftOutlined";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";

import { Grid, Switch, Typography } from "@mui/material";

const baseUrl = `http://${process.env.REACT_APP_BACKEND_API_BASE_URL}:${process.env.REACT_APP_BACKEND_API_PORT}`;

function CameraControl() {
  const [cameraFeedSource, setCameraFeedSource] = useState(null);
  const [cameraMovementDegrees, setCameraMovementDegrees] = useState(2);
  const [isProcessAutomated, setIsProcessAutomated] = useState(false);

  const sentError = useRef(false);

  const handleAutomatedProcessToggle = () => {
    setIsProcessAutomated(!isProcessAutomated);
  };
  const moveCameraButtonHandle = async (degrees, direction) => {
    try {
      const response = await axios.post(
        `${baseUrl}/move_camera`,
        new CameraControlDTO(degrees, direction)
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const degreesChangedHandle = (event) => {
    setCameraMovementDegrees(parseInt(event.target.value, 10));
  };

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

    const interval = setInterval(fetchVideoData, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      <Grid item xs={4}>
        <div>
          <Switch
            checked={isProcessAutomated}
            onChange={handleAutomatedProcessToggle}
          />
          <Typography variant="subtitled1" gutterBottom>
            {isProcessAutomated ? "Automated" : "Manual"}
          </Typography>
        </div>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="caption">Camera Control</Typography>
      </Grid>
      <Grid item xs={6}>
        <p></p>
      </Grid>
      <Grid item xs={6}>
        <p></p>
      </Grid>
    </Grid>
  );
}
export default CameraControl;
