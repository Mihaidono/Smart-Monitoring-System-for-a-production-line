import React, { useState } from "react";
import { Grid, Stack } from "@mui/material";
import "./App.css";
import CameraControl from "./components/CameraControl/CameraControl";
import Navbar from "./components/NavigationBar/Navbar";
import WarehouseDisplay from "./components/Warehouse/WarehouseDisplay";
import ProcessOverview from "./components/ProcessOverview/ProcessOverview";
import { AvailablePages } from "./config/enums/AvailablePages";
import { ProcessProvider } from "./contexts/ProcessContext";


function SettingsMenu() {
  return (
    <Grid container rowSpacing={1}>
      <Grid item xs={4} sm={6} md={6} lg={4}>
        <p>Settings works</p>
      </Grid>
    </Grid>
  );
}

function HomePageMenu() {
  return (
    <ProcessProvider>
      <Grid
        container
        rowSpacing={{ xs: 2 }}
        justifyContent="center"
        padding="20px"
        paddingTop="30px"
        paddingBottom="30px"
      >
        <Grid
          item
          xs={12}
          lg={6}
          padding="10px"
          height={{ xs: "fit-content", lg: "400px" }}
        >
          <CameraControl />
        </Grid>
        <Grid
          item
          xs={12}
          lg={6}
          padding="10px"
          height={{ xs: "fit-content", lg: "400px" }}
        >
          <WarehouseDisplay />
        </Grid>
        <Grid item xs={12} padding="10px">
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
      case AvailablePages.SETTINGS:
        return <SettingsMenu />;
      default:
        return null;
    }
  };
  return (
    <Stack direction={{ xs: "column", sm: "row" }} rowSpacing={2}>
      <Navbar setActivePage={setCurrentPage} />
      {renderActivePage()}
    </Stack>
  );
}
