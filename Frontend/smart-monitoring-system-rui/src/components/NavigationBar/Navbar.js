import React, { useState } from "react";
import { AvailablePages } from "../../config/enum/AvailablePages";
import { Stack, IconButton, Typography, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import { styled } from "@mui/material/styles";

import "./Navbar.css";

const NavbarButton = styled(Button)(() => ({
  color: "#fff",
  paddingTop: "15px",
  paddingBottom: "15px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",

  "&:hover": {
    backgroundColor: "var(--secondaryColor)",
  },
  "&.active": {
    backgroundColor: "var(--mainColorToggled)",
  },

  "& .MuiSvgIcon-root": {
    marginBottom: "4px",
  },

  "& .MuiTypography-root": {
    marginTop: "4px",
  },
}));

function Navbar({ setActivePage }) {
  const [expanded, setExpanded] = useState(false);
  const [activeButton, setActiveButton] = useState(AvailablePages.HOME);

  const toggleNavbar = () => {
    setExpanded(!expanded);
  };

  const handleNavbarButtonClick = (page) => {
    setActivePage(page);
    setActiveButton(page);
  };

  return (
    <Stack
      direction={{ xs: "row", sm: "column" }}
      className="navbar"
      sx={{
        height: { xs: "100%", sm: "100vh" },
        width: { xs: "100%", sm: expanded ? "12em" : "6em" },
        justifyContent: { xs: "space-evenly", sm: "flex-start" },
      }}
    >
      <div className="navbar-button-container">
        <NavbarButton
          aria-label="home"
          onClick={() => handleNavbarButtonClick(AvailablePages.HOME)}
          size="large"
          fullWidth
          className={activeButton === AvailablePages.HOME ? "active" : ""}
        >
          <HomeIcon sx={{ fontSize: 32 }} />
          {expanded && <Typography variant="body">Home</Typography>}
        </NavbarButton>
      </div>
      <div className="navbar-button-container">
        <NavbarButton
          aria-label="settings"
          onClick={() => handleNavbarButtonClick(AvailablePages.SETTINGS)}
          size="large"
          fullWidth
          className={activeButton === AvailablePages.SETTINGS ? "active" : ""}
        >
          <SettingsIcon sx={{ fontSize: 32 }} />
          {expanded && <Typography variant="body">Settings</Typography>}
        </NavbarButton>
      </div>
      {expanded ? (
        <div className="navbar-button-container">
          <IconButton
            aria-label="shrink"
            onClick={toggleNavbar}
            size="large"
            sx={{
              display: { xs: "none", sm: "flex" },
              color: "#fff",
            }}
          >
            <ArrowCircleLeftIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </div>
      ) : (
        <div className="navbar-button-container">
          <IconButton
            aria-label="expand"
            onClick={toggleNavbar}
            size="large"
            sx={{
              display: { xs: "none", sm: "flex" },
              color: "#fff",
            }}
          >
            <ArrowCircleRightIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </div>
      )}
    </Stack>
  );
}

export default Navbar;
