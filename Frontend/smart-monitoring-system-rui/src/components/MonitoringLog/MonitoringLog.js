import { Grid, Typography, ButtonBase } from "@mui/material";
import "./MonitoringLog.css";
import React, { useState } from "react";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

function MonitoringLog({ logData }) {
  const [detailsVisible, setDetailsVisible] = useState(false);

  const toggleVisivility = () => {
    setDetailsVisible(!detailsVisible);
  };

  return (
    <ButtonBase onClick={toggleVisivility} sx={{ width: "100%" }}>
      <Grid
        container
        sx={{
          border: "2px solid var(--mainColor)",
          borderRadius: 5,
          padding: "5px",
        }}
      >
        <Grid
          item
          container
          xs={12}
          sx={{
            justifyContent: { xs: "flex-end", sm: "flex-start" },
            width: { xs: "100%", sm: "200px" },
          }}
        >
          <Typography
            noWrap
            variant="body2"
            sx={{
              paddingLeft: { xs: "0px", sm: "40px" },
              paddingRight: { xs: "10px", sm: "0px" },
              color: "var(--secondaryColor)",
            }}
          >
            Timestamp: {logData.timestamp}
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
            <WarningAmberOutlinedIcon
              sx={{
                fontSize: "42px",
                paddingLeft: "15px",
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
              width: { xs: "100%", sm: "200px" },
            }}
          >
            <Typography
              noWrap
              style={{
                paddingLeft: "10px",
                paddingRight: "10px",
              }}
            >
              {logData.message}
            </Typography>
          </Grid>
          <Grid
            item
            container
            xs={12}
            sm={3}
            sx={{
              justifyContent: "flex-end",
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
              Id: {logData.id}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </ButtonBase>
  );
}

export default MonitoringLog;
