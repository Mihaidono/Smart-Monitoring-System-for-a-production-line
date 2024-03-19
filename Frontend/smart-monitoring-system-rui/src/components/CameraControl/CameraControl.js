import "./CameraControl.css";
import React, { useState, useEffect, useContext } from "react";
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
import { AvailableURLs } from "../../config/enums/AvailableURLs";
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
import useWebSocket from "react-use-websocket";
import { ProcessContext } from "../../contexts/ProcessContext";

const CameraControlButton = styled(Button)(({ processStarted }) => ({
  color: processStarted ? "var(--defaultStateColor)" : "#fff",
  backgroundColor: processStarted
    ? "var(--mainColorToggled)"
    : "var(--mainColor)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "70px",
  height: "40px",

  "&:hover": {
    backgroundColor: processStarted
      ? "var(--mainColorToggled)"
      : "var(--secondaryColor)",
  },
  pointerEvents: processStarted ? "none" : "auto",
}));

function CameraControl() {
  const [cameraFeedSource, setCameraFeedSource] = useState(null);
  const [cameraMovementDegrees, setCameraMovementDegrees] = useState(2);
  const { processStarted, updateProcessStarted } = useContext(ProcessContext);

  const { lastMessage } = useWebSocket(
    AvailableURLs.BACKEND_WS + "/ws_get_image"
  );

  const handleAutomatedProcessToggle = () => {
    updateProcessStarted(!processStarted);
  };

  const degreesChangedHandle = (event) => {
    setCameraMovementDegrees(parseInt(event.target.value, 10));
  };

  const moveCameraButtonHandle = async (degrees, direction) => {
    try {
      await axios.post(
        `${AvailableURLs.BACKEND_HTTP}/move_camera`,
        new CameraControlDTO(degrees, direction)
      );
    } catch (error) {}
  };

  useEffect(() => {
    if (lastMessage && lastMessage.data) {
      try {
        const data = JSON.parse(lastMessage.data);
        setCameraFeedSource(data.data);
      } catch (error) {}
    }
  }, [lastMessage, setCameraFeedSource]);

  return (
    <Grid
      container
      className="camera-control-container"
      padding="10px"
      height="100%"
    >
      <Grid item xs={4}>
        <div className="automation-switch-container">
          <Switch
            checked={processStarted}
            onChange={handleAutomatedProcessToggle}
            sx={{
              "& .MuiSwitch-thumb": {
                backgroundColor: "var(--mainColor)",
              },
            }}
          />
          <Typography color="var(--mainColor)" variant="body2" gutterBottom>
            {processStarted ? "Automated" : "Manual"}
          </Typography>
        </div>
      </Grid>
      <Grid item container xs={12} md={4} justifyContent="center">
        <Typography variant="h5" color="var(--mainColor)">
          Camera Control
        </Typography>
      </Grid>
      <Grid item container sm={0} md={4} justifyContent="center"></Grid>
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
          <CameraControlButton
            processStarted={processStarted}
            onClick={() => {
              if (!processStarted) {
                moveCameraButtonHandle(
                  cameraMovementDegrees,
                  CameraDirections.UP
                );
              }
            }}
          >
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
          <CameraControlButton
            processStarted={processStarted}
            onClick={() => {
              if (!processStarted) {
                moveCameraButtonHandle(
                  cameraMovementDegrees,
                  CameraDirections.LEFT
                );
              }
            }}
          >
            <KeyboardArrowLeftOutlinedIcon />
          </CameraControlButton>
        </Grid>
        <Grid container justifyContent="center" alignItems="center" item xs={4}>
          <Select
            disabled={processStarted}
            id="degrees-helper"
            value={cameraMovementDegrees}
            label="Degrees"
            onChange={degreesChangedHandle}
            displayEmpty
            sx={{
              width: 70,
              height: 40,
              border: "2px solid var(--mainColor)",
              color: "var(--mainColor)",
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
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
          <CameraControlButton
            processStarted={processStarted}
            onClick={() => {
              if (!processStarted) {
                moveCameraButtonHandle(
                  cameraMovementDegrees,
                  CameraDirections.RIGHT
                );
              }
            }}
          >
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
          <CameraControlButton
            processStarted={processStarted}
            onClick={() => {
              if (!processStarted) {
                moveCameraButtonHandle(
                  cameraMovementDegrees,
                  CameraDirections.DOWN
                );
              }
            }}
          >
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
          <CameraControlButton
            processStarted={processStarted}
            onClick={() => {
              if (!processStarted) {
                moveCameraButtonHandle(
                  cameraMovementDegrees,
                  CameraDirections.MAX_LEFT
                );
              }
            }}
          >
            <KeyboardDoubleArrowLeftOutlinedIcon />
          </CameraControlButton>
        </Grid>
        <Grid container justifyContent="center" alignItems="center" item xs={4}>
          <CameraControlButton
            processStarted={processStarted}
            onClick={() => {
              if (!processStarted) {
                moveCameraButtonHandle(
                  cameraMovementDegrees,
                  CameraDirections.HOME
                );
              }
            }}
          >
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
          <CameraControlButton
            processStarted={processStarted}
            onClick={() => {
              if (!processStarted) {
                moveCameraButtonHandle(
                  cameraMovementDegrees,
                  CameraDirections.RIGHT
                );
              }
            }}
          >
            <KeyboardDoubleArrowRightOutlinedIcon />
          </CameraControlButton>
        </Grid>
      </Grid>
      <Grid
        item
        container
        xs={12}
        md={6}
        padding="15px"
        alignContent="center"
        justifyContent="center"
      >
        <Box
          sx={{
            width: "320px",
            height: "240px",
            border: "2px solid var(--mainColor)",
            borderRadius: 5,
            overflow: "hidden",
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
