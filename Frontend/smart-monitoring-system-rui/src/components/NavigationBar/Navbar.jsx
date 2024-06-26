import React, { useState } from "react";
import { AvailablePages } from "../../config/enums/AvailablePages";
import { Stack, IconButton, Typography, Button, styled } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";

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
  const [activeButton, setActiveButton] = useState(
    JSON.parse(localStorage.getItem("activePage")) || AvailablePages.HOME
  );
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
        width: { xs: "100%", sm: expanded ? "12em" : "5em" },
        justifyContent: { xs: "space-evenly", sm: "flex-start" },
        top: { sm: "0" },
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
          aria-label="logs"
          onClick={() => handleNavbarButtonClick(AvailablePages.LOGS)}
          size="large"
          fullWidth
          className={activeButton === AvailablePages.LOGS ? "active" : ""}
        >
          <NewspaperIcon sx={{ fontSize: 32 }} />
          {expanded && <Typography variant="body">Logs</Typography>}
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
