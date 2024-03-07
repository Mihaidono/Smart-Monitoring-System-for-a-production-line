import React, { useState } from "react";
import { Stepper, Step, StepLabel } from "@mui/material";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import ForkRightOutlinedIcon from "@mui/icons-material/ForkRightOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { styled } from "@mui/material/styles";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";

const processSteps = [
  "High-Bay Warehouse",
  "Processing Station",
  "Sorting Line",
  "Delivery",
];

const ProcessStepsConnector = styled(StepConnector)(({ deliveryProcessStarted }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: deliveryProcessStarted
        ? "var(--pendingStateColor)"
        : "var(--mainColor)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: deliveryProcessStarted
        ? "var(--successStateColor)"
        : "var(--mainColor)",
    },
  },
  [`&.${stepConnectorClasses.failed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: deliveryProcessStarted
        ? "var(--warningStateColor)"
        : "var(--mainColor)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: deliveryProcessStarted
      ? "var(--defaultStateColor)"
      : "var(--mainColor)",
    borderRadius: 1,
  },
}));

const ProcessStepIconRoot = styled("div")(({ ownerState, deliveryProcessStarted }) => ({
  backgroundColor: deliveryProcessStarted
    ? "var(--defaultStateColor)"
    : "var(--mainColor)",
  zIndex: 1,
  color: "#fff",
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...(ownerState.active &&
    deliveryProcessStarted && {
      backgroundColor: "var(--pendingStateColor)",
      boxShadow: deliveryProcessStarted
        ? "0 4px 10px 0 rgba(0,0,0,.25)"
        : "var(--mainColor)",
    }),
  ...(ownerState.completed &&
    deliveryProcessStarted && {
      backgroundColor: "var(--successStateColor)",
    }),
  ...(ownerState.failed &&
    deliveryProcessStarted && {
      backgroundColor: "var(--warningStateColor)",
    }),
}));

function ProcessStepIcon(props) {
  const { active, completed, failed, className, deliveryProcessStarted } = props;

  const icons = {
    1: <WarehouseOutlinedIcon />,
    2: <FactoryOutlinedIcon />,
    3: <ForkRightOutlinedIcon />,
    4: <LocalShippingOutlinedIcon />,
  };

  return (
    <ProcessStepIconRoot
      ownerState={{ completed, active, failed }}
      deliveryProcessStarted={deliveryProcessStarted}
      className={className}
    >
      {icons[String(props.icon)]}
    </ProcessStepIconRoot>
  );
}

function ProcessOverview() {
  const [activeStep, setActiveStep] = useState(2);
  const [deliveryProcessStarted, setDeliveryProcessStarted] = useState(false);

  return (
    <Stepper
      alternativeLabel
      activeStep={activeStep}
      connector={<ProcessStepsConnector deliveryProcessStarted={deliveryProcessStarted} />}
      sx={{
        backgroundColor: "var(--primaryColor)",
        padding: "20px",
        paddingTop: "30px",
        borderRadius: "5px",
      }}
    >
      {processSteps.map((label) => (
        <Step key={label}>
          <StepLabel
            StepIconComponent={(props) => (
              <ProcessStepIcon {...props} deliveryProcessStarted={deliveryProcessStarted} />
            )}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

export default ProcessOverview;
