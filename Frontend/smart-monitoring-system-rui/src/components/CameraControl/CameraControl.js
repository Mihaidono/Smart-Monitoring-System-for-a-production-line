import "./CameraControl.css";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { CameraControlDTO } from "../../models/CameraControl";
import { CameraDirections } from "../../config/enums/CameraDirections";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowLeftOutlinedIcon from "@mui/icons-material/KeyboardArrowLeftOutlined";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import KeyboardDoubleArrowLeftOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowLeftOutlined";
import KeyboardDoubleArrowRightOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowRightOutlined";

import {
  Button,
  Grid,
  Switch,
  Typography,
  styled,
  Select,
  MenuItem,
  Skeleton,
  Box,
} from "@mui/material";

const baseUrl = `http://${process.env.REACT_APP_BACKEND_API_BASE_URL}:${process.env.REACT_APP_BACKEND_API_PORT}`;

const CameraControlButton = styled(Button)(() => ({
  color: "#fff",
  backgroundColor: "var(--mainColor)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",

  width: "70px",
  height: "40px",

  "&:hover": {
    backgroundColor: "var(--secondaryColor)",
  },
}));

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
    <Grid
      container
      rowSpacing={1}
      columnSpacing={{ xs: 1 }}
      className="camera-control-container"
    >
      <Grid item xs={4}>
        <div className="automation-switch-container">
          <Switch
            checked={isProcessAutomated}
            onChange={handleAutomatedProcessToggle}
            sx={{
              "& .MuiSwitch-thumb": {
                backgroundColor: "var(--mainColor)",
              },
            }}
          />
          <Typography color="var(--mainColor)" variant="body2" gutterBottom>
            {isProcessAutomated ? "Automated" : "Manual"}
          </Typography>
        </div>
      </Grid>
      <Grid item xs={12} md={6} textAlign={{ xs: "center", md: "left" }}>
        <Typography variant="h5" color="var(--mainColor)">
          Camera Control
        </Typography>
      </Grid>
      <Grid
        item
        container
        rowSpacing={1}
        xs={12}
        md={6}
        sx={{ justifyContent: "center", alignItems: "center", padding: "15px" }}
      >
        <Grid
          container
          sx={{ justifyContent: "center", alignItems: "center" }}
          item
          xs={12}
        >
          <CameraControlButton>
            <KeyboardArrowUpOutlinedIcon />
          </CameraControlButton>
        </Grid>
        <Grid
          container
          justifyContent="flex-end"
          alignItems="center"
          item
          xs={4}
        >
          <CameraControlButton>
            <KeyboardArrowLeftOutlinedIcon />
          </CameraControlButton>
        </Grid>
        <Grid container justifyContent="center" alignItems="center" item xs={4}>
          <Select
            labelId="degrees-helper"
            id="degrees-helper"
            value={cameraMovementDegrees}
            label="Degrees"
            onChange={degreesChangedHandle}
            sx={{
              width: 70,
              height: 40,
              border: "2px solid var(--mainColor)",
              color: "var(--mainColor)",
            }}
            
          >
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
        </Grid>
        <Grid
          container
          justifyContent="flex-start"
          alignItems="center"
          item
          xs={4}
        >
          <CameraControlButton>
            <KeyboardArrowRightOutlinedIcon />
          </CameraControlButton>
        </Grid>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          textAlign="center"
          item
          xs={12}
        >
          <CameraControlButton>
            <KeyboardArrowDownOutlinedIcon />
          </CameraControlButton>
        </Grid>
        <Grid
          container
          justifyContent="flex-end"
          alignItems="center"
          item
          xs={4}
        >
          <CameraControlButton>
            <KeyboardDoubleArrowLeftOutlinedIcon />
          </CameraControlButton>
        </Grid>
        <Grid container justifyContent="center" alignItems="center" item xs={4}>
          <CameraControlButton>
            <HomeOutlinedIcon />
          </CameraControlButton>
        </Grid>
        <Grid
          container
          justifyContent="flex-start"
          alignItems="center"
          item
          xs={4}
        >
          <CameraControlButton>
            <KeyboardDoubleArrowRightOutlinedIcon />
          </CameraControlButton>
        </Grid>
      </Grid>
      <Grid item xs={12} md={6} padding="15px">
        <Box
          sx={{
            width: "100%",
            height: "100%",
            border: "2px solid var(--mainColor)", // Set your desired border styles
            borderRadius: 8, // Optional: Add border radius for rounded corners
            overflow: "hidden", // Ensure content within the box does not overflow
          }}
        >
          {cameraFeedSource ? (
            <img
              src={cameraFeedSource}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              alt="Camera Feed"
            />
          ) : (
            <Skeleton
              variant="rectangular"
              animation="wave"
              sx={{
                width: "100%",
                height: "100%",
                backgroundColor: "#f3f2f2",
              }}
            />
          )}
        </Box>
      </Grid>
    </Grid>
  );
}
export default CameraControl;
