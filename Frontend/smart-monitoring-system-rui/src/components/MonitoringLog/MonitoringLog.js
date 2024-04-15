import { Grid, Typography, ButtonBase, Collapse, Stack } from "@mui/material";
import "./MonitoringLog.css";
import React, { useState } from "react";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { MonitoringModules } from "../../config/enums/MonitoringModules";
import { MonitoringRoutines } from "../../config/enums/MonitoringRoutines";

function MonitoringLog({ logData }) {
  const [detailsVisible, setDetailsVisible] = useState(false);

  const toggleVisivility = () => {
    setDetailsVisible(!detailsVisible);
  };

  const renderFormatedTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const renderSeverityIcon = (severity) => {
    switch (severity) {
      case 1:
        return (
          <WarningAmberOutlinedIcon
            sx={{
              fontSize: { xs: "32px", sm: "42px" },
            }}
          />
        );
      case 2:
        return (
          <InfoOutlinedIcon
            sx={{
              fontSize: { xs: "32px", sm: "42px" },
            }}
          />
        );
      case 3:
        return (
          <CheckCircleOutlinedIcon
            sx={{
              fontSize: { xs: "32px", sm: "42px" },
            }}
          />
        );
      default:
        return (
          <QuestionMarkIcon
            sx={{
              fontSize: { xs: "32px", sm: "42px" },
            }}
          />
        );
    }
  };

  const renderSeverityText = (severity) => {
    switch (severity) {
      case 1:
        return "Warning";
      case 2:
        return "Information";
      case 3:
        return "Success";
      default:
        return "Unknown";
    }
  };

  const renderModuleText = (module) => {
    switch (module.toString()) {
      case MonitoringModules.HOME.toString():
        return "Home";
      case MonitoringModules.PROCESSING_STATION.toString():
        return "Processing Station";
      case MonitoringModules.SHIPPING.toString():
        return "Shipping";
      case MonitoringModules.SORTING_LINE.toString():
        return "Sorting Line";
      case MonitoringModules.WAREHOUSE.toString():
        return "Warehouse";
      default:
        return "Unknown";
    }
  };

  const renderRoutineText = (routine) => {
    switch (routine) {
      case MonitoringRoutines.IDLE:
        return "Idle";
      case MonitoringRoutines.INITIALIZING:
        return "Initializing";
      case MonitoringRoutines.SURVEYING_BAY:
        return "Surveying the High-Bay Warehouse";
      case MonitoringRoutines.SURVEYING_DELIVERY_PROCESS:
        return "Surveying the Delivery Process";
      case MonitoringRoutines.DELIVERY_SUCCESSFUL:
        return "Successful Delivery";
      case MonitoringRoutines.CONFIRM_DELIVERY_STATUS:
        return "Successful Delivery Confirmation";
      case MonitoringRoutines.TIMED_OUT:
        return "Timed out";
      default:
        return "Unknown";
    }
  };

  function formatStorageData(storageData) {
    let result = "";
    for (const group of storageData) {
      for (const item of group) {
        if (item.coordinates) {
          result += `(${
            item.color
          } Storage at coordinates [${item.coordinates.join(", ")}]) `;
        }
      }
    }
    return result.trim();
  }

  return (
    <Stack
      sx={{
        width: "100%",
      }}
    >
      <ButtonBase
        onClick={toggleVisivility}
        disableRipple
        sx={{
          width: "100%",
          border: "2px solid var(--mainColor)",
          borderRadius: 5,
        }}
      >
        <Grid
          container
          sx={{
            padding: "10px",
          }}
        >
          <Grid
            xs={1}
            item
            container
            sx={{
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            {renderSeverityIcon(logData.severity)}
          </Grid>
          <Grid item container xs={11}>
            <Grid
              item
              container
              xs={6}
              md={3}
              lg={3}
              sx={{
                justifyContent: { xs: "flex-start" },
                alignContent: "center",
                width: { xs: "100%", sm: "200px" },
              }}
            >
              <Typography
                noWrap
                variant="body2"
                sx={{
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  color: "var(--secondaryColor)",
                }}
              >
                {renderFormatedTimestamp(logData.timestamp)}
              </Typography>
            </Grid>
            <Grid
              item
              container
              xs={12}
              md={5}
              lg={6}
              order={{ xs: 3, md: 2 }}
              sx={{
                justifyContent: "center",
                alignContent: "center",
                width: { xs: "100%", sm: "200px" },
              }}
            >
              <Typography
                noWrap
                sx={{
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  color: "var(--mainColor)",
                }}
              >
                {logData.message}
              </Typography>
            </Grid>
            <Grid
              item
              container
              xs={6}
              md={4}
              lg={3}
              order={{ xs: 2, md: 3 }}
              sx={{
                justifyContent: { xs: "flex-start", md: "center" },
                alignContent: "center",
                color: "var(--defaultStateColor)",
                width: { xs: "100%", sm: "200px" },
              }}
            >
              <Typography
                noWrap
                sx={{
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
                variant="body2"
              >
                Id: {logData._id}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </ButtonBase>
      <Grid container justifyContent="center" alignItems="center">
        <Collapse
          in={detailsVisible}
          sx={{
            width: { xs: "90%", md: "95%" },
            justifyContent: "center",
            borderLeft: "2px solid var(--mainColor)",
            borderRight: "2px solid var(--mainColor)",
            borderBottom: "2px solid var(--mainColor)",
            borderBottomLeftRadius: 5,
            borderBottomRightRadius: 5,
          }}
        >
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            padding="10px"
          >
            <Grid xs={12} container item>
              <Grid
                xs={12}
                sm={4}
                md={2}
                item
                container
                sx={{
                  padding: "5px",
                  paddingLeft: "15px",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography variant="subtitle2">Object Id:</Typography>
              </Grid>
              <Grid
                xs={12}
                sm={8}
                md={10}
                item
                container
                sx={{
                  padding: "5px",
                  paddingLeft: "15px",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography variant="body2">{logData._id}</Typography>
              </Grid>
            </Grid>
            <Grid xs={12} container item>
              <Grid
                xs={12}
                sm={4}
                md={2}
                item
                container
                sx={{
                  padding: "5px",
                  paddingLeft: "15px",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography variant="subtitle2">Timestamp:</Typography>
              </Grid>
              <Grid
                xs={12}
                sm={8}
                md={10}
                item
                container
                sx={{
                  padding: "5px",
                  paddingLeft: "15px",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography variant="body2">
                  {renderFormatedTimestamp(logData.timestamp)}
                </Typography>
              </Grid>
            </Grid>
            <Grid xs={12} container item>
              <Grid
                xs={12}
                sm={4}
                md={2}
                item
                container
                sx={{
                  padding: "5px",
                  paddingLeft: "15px",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography variant="subtitle2">Severity:</Typography>
              </Grid>
              <Grid
                xs={12}
                sm={8}
                md={10}
                item
                container
                sx={{
                  padding: "5px",
                  paddingLeft: "15px",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography variant="body2">
                  {renderSeverityText(logData.severity)}
                </Typography>
              </Grid>
            </Grid>
            <Grid xs={12} container item>
              <Grid
                xs={12}
                sm={4}
                md={2}
                item
                container
                sx={{
                  padding: "5px",
                  paddingLeft: "15px",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography variant="subtitle2">Module:</Typography>
              </Grid>
              <Grid
                xs={12}
                sm={8}
                md={10}
                item
                container
                sx={{
                  padding: "5px",
                  paddingLeft: "15px",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography variant="body2">
                  {renderModuleText(logData.current_module)}
                </Typography>
              </Grid>
            </Grid>
            <Grid xs={12} container item>
              <Grid
                xs={12}
                sm={4}
                md={2}
                item
                container
                sx={{
                  padding: "5px",
                  paddingLeft: "15px",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography variant="subtitle2">Routine:</Typography>
              </Grid>
              <Grid
                xs={12}
                sm={8}
                md={10}
                item
                container
                sx={{
                  padding: "5px",
                  paddingLeft: "15px",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography variant="body2">
                  {renderRoutineText(logData.current_routine)}
                </Typography>
              </Grid>
            </Grid>
            <Grid xs={12} container item>
              <Grid
                xs={12}
                sm={4}
                md={2}
                item
                container
                sx={{
                  padding: "5px",
                  paddingLeft: "15px",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography variant="subtitle2">In tracking:</Typography>
              </Grid>
              <Grid
                xs={12}
                sm={8}
                md={10}
                item
                container
                sx={{
                  padding: "5px",
                  paddingLeft: "15px",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography variant="body2">
                  {logData.while_tracking === true ? "True" : "False"}
                </Typography>
              </Grid>
            </Grid>
            <Grid xs={12} container item>
              <Grid
                xs={12}
                sm={4}
                md={2}
                item
                container
                sx={{
                  padding: "5px",
                  paddingLeft: "15px",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography variant="subtitle2">Message:</Typography>
              </Grid>
              <Grid
                xs={12}
                sm={8}
                md={10}
                item
                container
                sx={{
                  padding: "5px",
                  paddingLeft: "15px",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    overflowWrap: "normal",
                    textAlign: { xs: "center", sm: "start" },
                  }}
                >
                  {logData.message}
                </Typography>
              </Grid>
            </Grid>
            <Grid xs={12} container item>
              <Grid
                xs={12}
                sm={4}
                md={2}
                item
                container
                sx={{
                  padding: "5px",
                  paddingLeft: "15px",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography variant="subtitle2">Additional Data:</Typography>
              </Grid>
              <Grid
                xs={12}
                sm={8}
                md={10}
                item
                container
                sx={{
                  padding: "5px",
                  paddingLeft: "15px",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography variant="body2">
                  {logData.additional_data
                    ? formatStorageData(logData.additional_data)
                    : "None"}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
    </Stack>
  );
}

export default MonitoringLog;
