import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faCog,
  faArrowAltCircleLeft,
  faArrowAltCircleRight,
} from "@fortawesome/free-solid-svg-icons";
import "./App.css";
import CameraButtons from "./components/CameraButtons/CameraButtons";
import ProcessOverview from "./components/ProcessOverview/ProcessOverview";
import CameraFeed from "./components/CameraFeed/CameraFeed";
import WarehouseDisplay from "./components/WarehouseDisplay/WarehouseDisplay";

const AvailablePages = {
  HOME: 1,
  SETTINGS: 2,
};

function NavigationSideMenu({ setActivePage }) {
  const [expanded, setExpanded] = useState(false);

  const toggleNavbar = () => {
    setExpanded(!expanded);
  };

  const goToHomePage = () => {
    setActivePage(AvailablePages.HOME);
  };

  const goToSettingsPage = () => {
    setActivePage(AvailablePages.SETTINGS);
  };

  return (
    <ul className={`navbar ${expanded ? "expanded" : ""}`}>
      <li>
        <button onClick={goToHomePage}>
          <div className="side-menu-button-content">
            <FontAwesomeIcon icon={faHome} size="2x" />
            <p>{expanded ? "Home" : ""}</p>
          </div>
        </button>
      </li>
      <li>
        <button onClick={goToSettingsPage}>
          <div className="side-menu-button-content">
            <FontAwesomeIcon icon={faCog} size="2x" />
            <p>{expanded ? "Settings" : ""}</p>
          </div>
        </button>
      </li>
      <li>
        <button onClick={toggleNavbar}>
          {expanded ? (
            <FontAwesomeIcon icon={faArrowAltCircleLeft} size="2x" />
          ) : (
            <FontAwesomeIcon icon={faArrowAltCircleRight} size="2x" />
          )}
        </button>
      </li>
    </ul>
  );
}

function SettingsMenu() {
  return (
    <div className="settings-main-container">
      <p>Settings works!</p>
    </div>
  );
}

function HomePageMenu() {
  return (
    <div className="home-main-container">
      <div className="camera-control">
        <h1 className="camera-control-label">Camera Control</h1>
        <CameraFeed />
        <CameraButtons />
      </div>
      <WarehouseDisplay />
      <ProcessOverview />
    </div>
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
    <div className="base-container">
      <NavigationSideMenu setActivePage={setCurrentPage} />
      {renderActivePage()}
    </div>
  );
}
