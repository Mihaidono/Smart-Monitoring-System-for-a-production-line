import { Grid, Typography, ButtonBase, Collapse, Stack } from "@mui/material";
import "./MonitoringLog.css";
import React, { useState } from "react";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";

function MonitoringLog({ logData }) {
  const [detailsVisible, setDetailsVisible] = useState(false);

  const toggleVisivility = () => {
    setDetailsVisible(!detailsVisible);
  };

  const renderSeverityIcon = (severity) => {
    switch (severity) {
      case 1:
        return (
          <InfoOutlinedIcon
            sx={{
              fontSize: { xs: "32px", sm: "42px" },
            }}
          />
        );
      case 2:
        return (
          <WarningAmberOutlinedIcon
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
                {logData.timestamp}
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
          <Grid container justifyContent="center" alignItems="center">
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
                <Typography variant="body2">{logData.id}</Typography>
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
                <Typography variant="body2">{logData.timestamp}</Typography>
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
                <Typography variant="body2">to add severity</Typography>
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
                <Typography variant="body2">to add module</Typography>
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
                <Typography variant="body2">to add routine</Typography>
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
                <Typography variant="body2">to add in tracking</Typography>
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
                <Typography variant="body2">to add aditional data</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
    </Stack>
  );
}

export default MonitoringLog;
