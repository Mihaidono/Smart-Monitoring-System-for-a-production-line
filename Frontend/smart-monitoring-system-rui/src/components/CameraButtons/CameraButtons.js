import "./CameraButtons.css";
import axios from "axios";
import React, { useState } from "react";
import {
  faHome,
  faArrowUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CameraControlDTO } from "../../models/CameraControl";

const baseUrl = `http://${process.env.REACT_APP_BACKEND_API_BASE_URL}:${process.env.REACT_APP_BACKEND_API_PORT}`;
const CameraDirections = {
  LEFT: "relmove_left",
  RIGHT: "relmove_right",
  UP: "relmove_up",
  DOWN: "relmove_down",
  MAX_RIGHT: "end_pan",
  MAX_LEFT: "start_pan",
  HOME: "home",
};

function CameraButtons() {
  const [cameraMovementDegrees, setCameraMovementDegrees] = useState(2);

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

  return (
    <div className="camera-buttons-container">
      <div className="main-movement-buttons">
        <button
          id="movement-up-button"
          className="smui-button"
          title="Move camera up"
          onClick={() =>
            moveCameraButtonHandle(cameraMovementDegrees, CameraDirections.UP)
          }
        >
          <FontAwesomeIcon icon={faArrowUp} size="2x" />
        </button>
        <button
          id="movement-down-button"
          className="smui-button"
          title="Move camera down"
          onClick={() =>
            moveCameraButtonHandle(cameraMovementDegrees, CameraDirections.DOWN)
          }
        >
          <FontAwesomeIcon icon={faArrowDown} size="2x" />
        </button>
        <button
          id="movement-left-button"
          className="smui-button"
          title="Move camera left"
          onClick={() =>
            moveCameraButtonHandle(cameraMovementDegrees, CameraDirections.LEFT)
          }
        >
          <FontAwesomeIcon icon={faArrowLeft} size="2x" />
        </button>
        <button
          id="movement-right-button"
          className="smui-button"
          title="Move camera right"
          onClick={() =>
            moveCameraButtonHandle(
              cameraMovementDegrees,
              CameraDirections.RIGHT
            )
          }
        >
          <FontAwesomeIcon icon={faArrowRight} size="2x" />
        </button>
        <select
          value={cameraMovementDegrees}
          onChange={degreesChangedHandle}
          className="smui-button"
          id="degrees-selection"
        >
          <option value={2}>2</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>
      <div className="secondary-movement-buttons">
        <button
          className="smui-button"
          title="Move camera to maximum range left"
          onClick={() =>
            moveCameraButtonHandle(
              cameraMovementDegrees,
              CameraDirections.MAX_LEFT
            )
          }
        >
          <FontAwesomeIcon icon={faAngleDoubleLeft} size="2x" />
        </button>
        <button
          className="smui-button"
          title="Move camera to the home position"
          onClick={() =>
            moveCameraButtonHandle(cameraMovementDegrees, CameraDirections.HOME)
          }
        >
          <FontAwesomeIcon icon={faHome} size="2x" />
        </button>
        <button
          className="smui-button"
          title="Move camera to maximum range right"
          onClick={() =>
            moveCameraButtonHandle(
              cameraMovementDegrees,
              CameraDirections.MAX_RIGHT
            )
          }
        >
          <FontAwesomeIcon icon={faAngleDoubleRight} size="2x" />
        </button>
      </div>
    </div>
  );
}

export default CameraButtons;
