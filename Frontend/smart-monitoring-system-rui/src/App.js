import React, { useState } from "react";
import { Grid, Stack } from "@mui/material";
import "./App.css";
import CameraControl from "./components/CameraControl/CameraControl";
import Navbar from "./components/NavigationBar/Navbar";
import WarehouseDisplay from "./components/Warehouse/WarehouseDisplay";
import ProcessOverview from "./components/ProcessOverview/ProcessOverview";
import { AvailablePages } from "./config/enums/AvailablePages";
import { ProcessProvider } from "./contexts/ProcessContext";
import MonitoringLog from "./components/MonitoringLog/MonitoringLog";

function LogsMenu() {
  return (
    <Grid
      container
      rowSpacing={1}
      padding="20px"
      paddingTop="30px"
      paddingBottom="30px"
      height="fit-content"
    >
      {Array.from(Array(5)).map(() => {
        return (
          <Grid item container justifyContent="center" xs={12}>
            <MonitoringLog />
          </Grid>
        );
      })}
    </Grid>
  );
}

function HomePageMenu() {
  return (
    <ProcessProvider>
      <Grid
        container
        rowSpacing={2}
        justifyContent="center"
        padding="20px"
        paddingTop="30px"
        paddingBottom="30px"
      >
        <Grid
          item
          container
          xs={12}
          lg={6}
          padding="10px"
          height={{ xs: "fit-content", lg: "500px" }}
        >
          <CameraControl />
        </Grid>
        <Grid
          item
          container
          xs={12}
          lg={6}
          padding="10px"
          height={{ xs: "fit-content", lg: "500px" }}
        >
          <WarehouseDisplay />
        </Grid>
        <Grid
          container
          item
          xs={12}
          padding="10px"
          height={{ xs: "fit-content" }}
        >
          <ProcessOverview />
        </Grid>
      </Grid>
    </ProcessProvider>
  );
}

export default function App() {
  const [currentActivePage, setCurrentPage] = useState(AvailablePages.HOME);

  const renderActivePage = () => {
    switch (currentActivePage) {
      case AvailablePages.HOME:
        return <HomePageMenu />;
      case AvailablePages.LOGS:
        return <LogsMenu />;
      default:
        return null;
    }
  };
  return (
    <Stack direction={{ xs: "column", sm: "row" }}>
      <Navbar setActivePage={setCurrentPage} />
      {renderActivePage()}
    </Stack>
  );
}
