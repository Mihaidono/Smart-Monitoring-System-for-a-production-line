import "./CameraButtons.css";
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

function CameraButtons() {
  return (
    <div className="camera-buttons-container">
      <div className="main-movement-buttons">
        <button
          id="movement-up-button"
          className="smui-button"
          title="Move camera up"
        >
          <FontAwesomeIcon icon={faArrowUp} size="2x" />
        </button>
        <button
          id="movement-down-button"
          className="smui-button"
          title="Move camera down"
        >
          <FontAwesomeIcon icon={faArrowDown} size="2x" />
        </button>
        <button
          id="movement-left-button"
          className="smui-button"
          title="Move camera left"
        >
          <FontAwesomeIcon icon={faArrowLeft} size="2x" />
        </button>
        <button
          id="movement-right-button"
          className="smui-button"
          title="Move camera right"
        >
          <FontAwesomeIcon icon={faArrowRight} size="2x" />
        </button>
      </div>
      <div className="secondary-movement-buttons">
        <button
          className="smui-button"
          title="Move camera to maximum range left"
        >
          <FontAwesomeIcon icon={faAngleDoubleLeft} size="2x" />
        </button>
        <button
          className="smui-button"
          title="Move camera to the home position"
        >
          <FontAwesomeIcon icon={faHome} size="2x" />
        </button>
        <button
          className="smui-button"
          title="Move camera to maximum range right"
        >
          <FontAwesomeIcon icon={faAngleDoubleRight} size="2x" />
        </button>
      </div>
    </div>
  );
}

export default CameraButtons;
