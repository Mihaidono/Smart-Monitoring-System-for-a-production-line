import { Box, Grid, Typography } from "@mui/material";
import "./MonitoringLog.css";
import React, { useState } from "react";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

function MonitoringLog() {
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [logArray, setLogArray] = useState([]);
  const [currentLogBatch, setCurrentLogBatch] = useState(1);

  const handleClick = () => {
    setDetailsVisible(!detailsVisible);
  };

  return (
    <Grid
      container
      sx={{
        border: "2px solid var(--mainColor)",
        borderRadius: 5,
        padding: "5px",
        height: "110px",
      }}
    >
      <Grid
        item
        container
        xs={12}
        sx={{ justifyContent: { xs: "center", sm: "flex-start" } }}
      >
        <Typography
          variant="overline"
          sx={{
            paddingLeft: { xs: "0px", sm: "40px" },
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          2024-04-03T08:01:12+00:00
        </Typography>
      </Grid>
      <Grid item container xs={12}>
        <Grid
          item
          container
          xs={2}
          md={1}
          sx={{
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <WarningAmberIcon
            sx={{
              fontSize: { xs: 42, sm: 52 },
              paddingLeft: "5px",
              paddingRight: "5px",
            }}
          />
        </Grid>
        <Grid
          item
          container
          xs={10}
          sm={7}
          md={8}
          sx={{
            justifyContent: "flex-start",
            alignContent: "center",
          }}
        >
          <Typography
            noWrap={true}
            style={{
              paddingLeft: { xs: "0px", sm: "20px" },
              paddingRight: "20px",
            }}
          >
            The workpiece has been processed aaaaaaaaa has been processed
            aaaaaaaaa has been processed aaaaaaaaa
          </Typography>
        </Grid>
        <Grid
          item
          container
          xs={12}
          sm={3}
          sx={{
            justifyContent: { xs: "center", sm: "flex-end" },
            alignContent: "center",
            color: "var(--defaultStateColor)",
          }}
        >
          <Typography
            noWrap={true}
            sx={{
              paddingLeft: { xs: "0px", sm: "10px" },
              paddingRight: { xs: "0px", sm: "10px" },
            }}
            variant="body2"
          >
            507f1f77bcf86cd799439011
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default MonitoringLog;
