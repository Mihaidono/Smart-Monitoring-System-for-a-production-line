import React from "react";
import FactoryIcon from "@mui/icons-material/Factory";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import "./ProcessOverview.css";

function ProcessOverview() {
  const icons = [
    { icon: <FactoryIcon />, label: "Warehouse" },
    { icon: <PrecisionManufacturingIcon />, label: "Processing Station" },
    { icon: <CallSplitIcon />, label: "Sorting Line" },
    { icon: <LocalShippingIcon />, label: "Delivery" },
  ];

  return (
    <div>
      {icons.map((element) => {
        return (
          <div>
            {element.icon}
            {element.label}
          </div>
        );
      })}
    </div>
  );
}
export default ProcessOverview;
