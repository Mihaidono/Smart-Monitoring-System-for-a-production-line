import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faWarehouse,
  faIndustry,
} from "@fortawesome/free-solid-svg-icons";
import "./ProcessOverview.css";

function ProcessOverview() {
  const processes = {
    1: <FontAwesomeIcon icon={faWarehouse} size="2x" />,
    2: <FontAwesomeIcon icon={faIndustry} size="2x" />,
    3: <FontAwesomeIcon icon={faTruck} size="2x" />,
  };
  return (
    <div className="process-overview-container">
      <div className="processes">
        {Object.keys(processes).map((processKey) => (
          <div className="process">{processes[processKey]}</div>
        ))}
      </div>
      <div className="progress-arrow"></div>
    </div>
  );
}

export default ProcessOverview;
