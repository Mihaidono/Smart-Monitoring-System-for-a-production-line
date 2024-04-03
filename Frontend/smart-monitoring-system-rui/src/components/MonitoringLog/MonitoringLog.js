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
    <ButtonBase
      onClick={toggleVisivility}
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
          <WarningAmberOutlinedIcon
            sx={{
              fontSize: { xs: "32px", sm: "42px" },
            }}
          />
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
              Id: {logData.id}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </ButtonBase>
  );
}

export default MonitoringLog;
