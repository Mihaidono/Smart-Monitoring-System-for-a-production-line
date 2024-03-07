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

const ProcessStepsConnector = styled(StepConnector)(({ processStarted }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: processStarted
        ? "var(--pendingStateColor)"
        : "var(--mainColor)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: processStarted
        ? "var(--successStateColor)"
        : "var(--mainColor)",
    },
  },
  [`&.${stepConnectorClasses.failed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: processStarted
        ? "var(--warningStateColor)"
        : "var(--mainColor)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: processStarted
      ? "var(--defaultStateColor)"
      : "var(--mainColor)",
    borderRadius: 1,
  },
}));

const ProcessStepIconRoot = styled("div")(({ ownerState, processStarted }) => ({
  backgroundColor: processStarted
    ? "var(--mainColor)"
    : "var(--defaultStateColor)",
  zIndex: 1,
  color: "#fff",
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...(ownerState.active && {
    backgroundColor: processStarted
      ? "var(--pendingStateColor)"
      : "var(--defaultStateColor)",
    borderColor: "var(--secondaryColor)",
    boxShadow: processStarted
      ? "0 4px 10px 0 rgba(0,0,0,.25)"
      : "var(--defaultStateColor)",
  }),
  ...(ownerState.completed && {
    backgroundColor: processStarted
      ? "var(--successStateColor)"
      : "var(--defaultStateColor)",
  }),
  ...(ownerState.failed && {
    backgroundColor: processStarted
      ? "var(--warningStateColor)"
      : "var(--defaultStateColor)",
  }),
}));

function ProcessStepIcon(props) {
  const { active, completed, failed, className, processStarted } = props;

  const icons = {
    1: <WarehouseOutlinedIcon />,
    2: <FactoryOutlinedIcon />,
    3: <ForkRightOutlinedIcon />,
    4: <LocalShippingOutlinedIcon />,
  };

  return (
    <ProcessStepIconRoot
      ownerState={{ completed, active, failed }}
      processStarted={processStarted}
      className={className}
    >
      {icons[String(props.icon)]}
    </ProcessStepIconRoot>
  );
}

function ProcessOverview() {
  const [activeStep, setActiveStep] = useState(2);
  const [processStarted, setProcessStarted] = useState(true);

  return (
    <Stepper
      alternativeLabel
      activeStep={activeStep}
      connector={<ProcessStepsConnector processStarted={processStarted} />}
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
            StepIconComponent={ProcessStepIcon}
            processStarted={processStarted}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

export default ProcessOverview;
