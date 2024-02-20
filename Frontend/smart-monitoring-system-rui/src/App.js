import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faCog,
  faArrowAltCircleLeft,
  faArrowAltCircleRight,
  faArrowUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";
import "./App.css";
import axios from "axios";

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
    <div className={`navbar ${expanded ? "expanded" : ""}`}>
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
    </div>
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
  var warehouseStock = ["Puck1", "Puck2", "Puck3"];
  const [cameraFeedSource, setCameraFeedSource] = useState(null);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await axios.get(
          "http://your-backend-url/your-video-endpoint"
        );
        setCameraFeedSource(response.data);
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };

    fetchVideoData();

    const intervalId = setInterval(fetchVideoData, 200);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="home-main-container">
      <div className="camera-buttons-container">
        <div className="main-movement-buttons">
          <button
            id="movement-up-button"
            className="smui-button"
            title="Move camera up"
          >
            <FontAwesomeIcon icon={faArrowUp} size="2x" />
          </button>
          <button
            id="movement-down-button"
            className="smui-button"
            title="Move camera down"
          >
            <FontAwesomeIcon icon={faArrowDown} size="2x" />
          </button>
          <button
            id="movement-left-button"
            className="smui-button"
            title="Move camera left"
          >
            <FontAwesomeIcon icon={faArrowLeft} size="2x" />
          </button>
          <button
            id="movement-right-button"
            className="smui-button"
            title="Move camera right"
          >
            <FontAwesomeIcon icon={faArrowRight} size="2x" />
          </button>
        </div>
        <div className="secondary-movement-buttons">
          <button
            className="smui-button"
            title="Move camera to maximum range left"
          >
            <FontAwesomeIcon icon={faAngleDoubleLeft} size="2x" />
          </button>
          <button
            className="smui-button"
            title="Move camera to the home position"
          >
            <FontAwesomeIcon icon={faHome} size="2x" />
          </button>
          <button
            className="smui-button"
            title="Move camera to maximum range right"
          >
            <FontAwesomeIcon icon={faAngleDoubleRight} size="2x" />
          </button>
        </div>
      </div>
      <div className="image-display-container">
        <img alt="Camera Feed" src={cameraFeedSource} />
      </div>
      <div className="process-overview-container">
        <p>nimic</p>
      </div>
      <div className="warehouse-display">
        {warehouseStock.map((element) => (
          <div className="warehouse-item">{element}</div> // de adaugat improvementuri + cum arata obiectele + styling
        ))}
      </div>
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
