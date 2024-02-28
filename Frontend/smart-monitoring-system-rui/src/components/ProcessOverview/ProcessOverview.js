import React, { useState, useEffect } from "react";
import FactoryIcon from "@mui/icons-material/Factory";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import "./ProcessOverview.css";
import axios from "axios";

function determineActiveStep(data) {}

function ProcessOverview() {
  const [activeStep, setActiveStep] = useState(0);

  const icons = [
    { icon: <WarehouseIcon />, label: "Warehouse" },
    { icon: <FactoryIcon />, label: "Processing Station" },
    { icon: <CallSplitIcon />, label: "Sorting Line" },
    { icon: <LocalShippingIcon />, label: "Delivery" },
    { icon: <PrecisionManufacturingIcon />, label: "Crane" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("your-endpoint");

        const data = response.data;
        const newActiveStep = determineActiveStep(data);

        setActiveStep(newActiveStep);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="process-overview-container">
      <h1 className="process-overview-label">Workpiece Overview</h1>
      <div className="circle"></div>
      <div className="overview-circular-container">
        {icons.map((step, index) => (
          <div id={`step-item-${index}`} className="overview-step-container">
            <div className="step-item-icon">{step.icon}</div>
            <p className="step-item-label">{step.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default ProcessOverview;
