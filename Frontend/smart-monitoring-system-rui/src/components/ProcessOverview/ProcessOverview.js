import React, { useState, useEffect, useContext } from "react";
import { Stepper, Step, StepLabel } from "@mui/material";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import ForkRightOutlinedIcon from "@mui/icons-material/ForkRightOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { styled } from "@mui/material/styles";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import useWebSocket from "react-use-websocket";
import { AvailableURLs } from "../../config/enums/AvailableURLs";
import { ProcessContext } from "../../contexts/ProcessContext";
import { MonitoringRoutines } from "../../config/enums/MonitoringRoutines";

const processSteps = [
  "High-Bay Warehouse",
  "Processing Station",
  "Sorting Line",
  "Delivery",
];

const ProcessStepsConnector = styled(StepConnector)(
  ({ processStarted, failedStepIndex }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundColor:
          failedStepIndex !== null
            ? "var(--warningStateColor)"
            : processStarted
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
    [`& .${stepConnectorClasses.line}`]: {
      height: 3,
      border: 0,
      backgroundColor: processStarted
        ? "var(--defaultStateColor)"
        : "var(--mainColor)",
      borderRadius: 1,
    },
  })
);

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
  const [failedStepIndex, setFailedStepIndex] = useState(null);

  const [trackingStarted, setTrackingStarted] = useState(null);
  const { processStarted } = useContext(ProcessContext);
  const { lastMessage: deliveryInfoMessage } = useWebSocket(
    AvailableURLs.BACKEND_WS + "/ws_delivery_info"
  );

  useEffect(() => {
    if (deliveryInfoMessage && deliveryInfoMessage.data) {
      try {
        const data = JSON.parse(deliveryInfoMessage.data);
        if (processStarted) {
          if (activeStep === null || activeStep === 4) {
            setTrackingStarted(data.tracking_workpiece);
          }

          if (data.current_routine === MonitoringRoutines.DELIVERY_SUCCESSFUL) {
            setActiveStep(4);
          }

          if (data.current_routine === MonitoringRoutines.TIMED_OUT) {
            setFailedStepIndex(activeStep);
          }
        }
      } catch (error) {}
    }
  }, [processStarted, activeStep, deliveryInfoMessage]);

  useEffect(() => {
    if (deliveryInfoMessage && deliveryInfoMessage.data) {
      try {
        const data = JSON.parse(deliveryInfoMessage.data);
        if (trackingStarted) {
          switch (data.current_module) {
            case "WAREHOUSE":
              setActiveStep(0);
              break;
            case "PROCESSING_STATION":
              setActiveStep(1);
              break;
            case "SORTING_LINE":
              setActiveStep(2);
              break;
            case "SHIPPING":
              setActiveStep(3);
              break;
            default:
              break;
          }
        }
      } catch (error) {}
    }
  }, [trackingStarted, activeStep, deliveryInfoMessage]);

  return (
    <Stepper
      alternativeLabel
      activeStep={activeStep}
      connector={
        <ProcessStepsConnector
          processStarted={trackingStarted}
          failedStepIndex={failedStepIndex}
        />
      }
      sx={{
        backgroundColor: "var(--primaryColor)",
        padding: { xs: "0px", sm: "20px" },
        paddingTop: { xs: "35px" },
        paddingBottom: { xs: "30px", sm: "20px" },
        borderRadius: "5px",
      }}
    >
      {processSteps.map((label, index) => (
        <Step key={label}>
          <StepLabel
            StepIconComponent={(props) => (
              <ProcessStepIcon
                {...props}
                processStarted={trackingStarted}
                failed={index === failedStepIndex}
                completed={index <= activeStep - 1}
              />
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
