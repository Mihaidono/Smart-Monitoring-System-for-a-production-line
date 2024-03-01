import React, { useState } from "react";
import { Grid, Stack } from "@mui/material";
import "./App.css";
import CameraControl from "./components/CameraControl/CameraControl";
import Navbar from "./components/NavigationBar/Navbar";
import { AvailablePages } from "./config/enums/AvailablePages";

function SettingsMenu() {
  return (
    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      <Grid item xs={4} sm={6} md={6} lg={4}>
        <p>Settings works</p>
      </Grid>
    </Grid>
  );
}

function HomePageMenu() {
  return (
    <Grid
      container
      rowSpacing={{ xs: 2, sm: 3 }}
      columnSpacing={{ xs: 0.5, sm: 2 }}
    >
      <Grid item xs={12} sm={6}>
        <CameraControl />
      </Grid>
    </Grid>
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
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 1, sm: 2 }}
      sx={{ backgroundColor: "var(--primaryColor)" }}
    >
      <Navbar setActivePage={setCurrentPage} />
      {renderActivePage()}
    </Stack>
  );
}
