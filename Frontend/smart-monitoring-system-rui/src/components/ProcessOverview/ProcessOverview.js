import React, { useState, useEffect } from "react";
import { Stepper, Step, StepLabel } from "@mui/material";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import ForkRightOutlinedIcon from "@mui/icons-material/ForkRightOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { styled } from "@mui/material/styles";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { ProcessingStates } from "../../config/enums/ProcessingStates";
import useWebSocket from "react-use-websocket";
import { AvailableURLs } from "../../config/enums/AvailableURLs";

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
    processStarted && {
      backgroundColor: "var(--pendingStateColor)",
      boxShadow: processStarted
        ? "0 4px 10px 0 rgba(0,0,0,.25)"
        : "var(--mainColor)",
    }),
  ...(ownerState.completed &&
    processStarted && {
      backgroundColor: "var(--successStateColor)",
    }),
  ...(ownerState.failed &&
    processStarted && {
      backgroundColor: "var(--warningStateColor)",
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
  const [activeStep, setActiveStep] = useState(null);
  const [processStarted, setProcessStarted] = useState(false);
  const { lastMessage: activeStepMessage } = useWebSocket(
    AvailableURLs.BACKEND_WS + "/ws_get_current_module"
  );
  const {
    lastMessage: processStartedMessage,
    sendJsonMessage: sendProcessStartedMessage,
  } = useWebSocket(AvailableURLs.BACKEND_WS + "/ws_process_state");

  useEffect(() => {
    const sendStateToBackend = async () => {
      const data = {
        process_started: processStarted,
      };
      sendProcessStartedMessage(data);
    };

    sendStateToBackend();
    if (processStartedMessage && processStartedMessage.data) {
      try {
        const data = JSON.parse(processStartedMessage.data);
        setProcessStarted(data.process_started);
      } catch (error) {
        console.log("Invalid JSON Format in Process State!");
      }
    }
  }, [processStarted, processStartedMessage, sendProcessStartedMessage]);

  useEffect(() => {
    if (activeStepMessage && activeStepMessage.data) {
      try {
        const data = JSON.parse(activeStepMessage.data);
        if (processStarted) {
          switch (data.current_module) {
            case ProcessingStates.WAREHOUSE:
              setActiveStep(0);
              break;
            case ProcessingStates.PROCESSING_STATION:
              setActiveStep(1);
              break;
            case ProcessingStates.SORTING_LINE:
              setActiveStep(2);
              break;
            case ProcessingStates.SHIPPING:
              setActiveStep(3);
              break;
            default:
              console.log("Unknown Processing Module");
              break;
          }
        }
      } catch (error) {
        console.log("Invalid JSON Format in Active Step!");
      }
    }
  }, [processStarted, activeStepMessage]);

  return (
    <Stepper
      alternativeLabel
      activeStep={activeStep}
      connector={<ProcessStepsConnector processStarted={processStarted} />}
      sx={{
        backgroundColor: "var(--primaryColor)",
        padding: { xs: "0px", sm: "20px" },
        paddingTop: { xs: "35px" },
        paddingBottom: { xs: "30px", sm: "20px" },
        borderRadius: "5px",
      }}
    >
      {processSteps.map((label) => (
        <Step key={label}>
          <StepLabel
            StepIconComponent={(props) => (
              <ProcessStepIcon {...props} processStarted={processStarted} />
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
