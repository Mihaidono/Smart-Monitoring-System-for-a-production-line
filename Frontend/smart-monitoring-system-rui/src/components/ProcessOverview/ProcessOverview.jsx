import React, { useState, useEffect, useContext } from "react";
import { Stepper, Step, StepLabel, Snackbar, Alert } from "@mui/material";
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

  const [openPopup, setOpenPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupseverity, setPopupSeverity] = useState("info");
  const { lastMessage: deliveryInfoMessage } = useWebSocket(
    AvailableURLs.BACKEND_WS + "/ws_delivery_info"
  );

  const handlePopupClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenPopup(false);
  };

  const createPopupAlert = (displayMessage, alertSeverity) => {
    setOpenPopup(true);
    setPopupMessage(displayMessage);
    setPopupSeverity(alertSeverity);
  };

  useEffect(() => {
    if (deliveryInfoMessage && deliveryInfoMessage.data) {
      try {
        const data = JSON.parse(deliveryInfoMessage.data);
        if (processStarted) {
          console.log(data.current_routine);
          if (
            activeStep === null &&
            data.tracking_workpiece !== trackingStarted
          ) {
            setTrackingStarted(data.tracking_workpiece);
          }

          if (
            data.current_routine === MonitoringRoutines.DELIVERY_SUCCESSFUL &&
            activeStep === 3
          ) {
            setActiveStep(4);
            createPopupAlert("Successfuly completed delivery!", "success");
            setTimeout(() => {
              setActiveStep(null);
            }, 3000);
          }

          if (data.current_routine === MonitoringRoutines.TIMED_OUT) {
            setFailedStepIndex(activeStep);
            createPopupAlert(
              `Timed out at ${processSteps[activeStep]} module `,
              "error"
            );
            setTimeout(() => {
              setActiveStep(null);
              setFailedStepIndex(null);
            }, 3000);
          }
        } else {
          setActiveStep(null);
          setFailedStepIndex(null);
        }
      } catch (error) {}
    }
  }, [processStarted, activeStep, trackingStarted, deliveryInfoMessage]);

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
        width: "100%",
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
      <Snackbar
        open={openPopup}
        autoHideDuration={5000}
        onClose={handlePopupClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={popupseverity} variant="filled" sx={{ width: "100%" }}>
          {popupMessage}
        </Alert>
      </Snackbar>
    </Stepper>
  );
}

export default ProcessOverview;
