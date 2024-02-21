import React, { useState, useEffect, useRef } from "react";
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

const baseUrl = `${process.env.BACKEND_API_BASE_URL}:${process.env.BACKEND_API_PORT}`;

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

function CameraFeed() {
  const [cameraFeedSource, setCameraFeedSource] = useState(null);
  const sentError = useRef(false);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/get_image`);
        setCameraFeedSource(response.data.data);
        sentError.current = false;
      } catch (error) {
        if (!sentError.current) {
          console.error("Error fetching video data:", error);
          sentError.current = true;
        }
      }
    };

    fetchVideoData();

    const intervalId = setInterval(fetchVideoData, 500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="image-display-container">
      <img alt="Camera Feed" src={cameraFeedSource} />
    </div>
  );
}

function CameraButtons() {
  return (
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
  );
}

function WarehouseDisplay() {
  const [warehouseStock, setWarehouseStock] = useState([]);
  const sentError = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/get_warehouse_inventory`);
        setWarehouseStock(response.data.containers);
        sentError.current = false;
      } catch (error) {
        if (!sentError.current) {
          console.error("Error fetching warehouse inventory:", error);
          sentError.current = true;
        }
      }
    };

    const intervalId = setInterval(fetchData, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="warehouse-display">
      {warehouseStock.map((element) => (
        <div className="warehouse-item">{element}</div> // de adaugat improvementuri + cum arata obiectele + styling
      ))}
    </div>
  );
}

function ProcessOverview() {
  return (
    <div className="process-overview-container">
      <p>nimic</p>
    </div>
  );
}

function HomePageMenu() {
  return (
    <div className="home-main-container">
      <CameraButtons />
      <CameraFeed />
      <ProcessOverview />
      <WarehouseDisplay />
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
