import "./CameraControl.css";
import CameraFeed from "../CameraFeed/CameraFeed";
import CameraButtons from "../CameraButtons/CameraButtons";

function CameraControl() {
  return (
    <div className="camera-control">
      <h1 className="camera-control-label">Camera Control</h1>
      <CameraFeed />
      <CameraButtons />
    </div>
  );
}

export default CameraControl;
