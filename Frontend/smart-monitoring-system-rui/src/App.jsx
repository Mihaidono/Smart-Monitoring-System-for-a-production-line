import React, { useState, useEffect } from "react";
import {
  Grid,
  Stack,
  TextField,
  Box,
  Modal,
  Typography,
  Pagination,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import "./App.css";
import CameraControl from "./components/CameraControl/CameraControl";
import Navbar from "./components/NavigationBar/Navbar";
import WarehouseDisplay from "./components/Warehouse/WarehouseDisplay";
import ProcessOverview from "./components/ProcessOverview/ProcessOverview";
import { AvailablePages } from "./config/enums/AvailablePages";
import { ProcessProvider } from "./contexts/ProcessContext";
import MonitoringLog from "./components/MonitoringLog/MonitoringLog";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { AvailableURLs } from "./config/enums/AvailableURLs";
import axios from "axios";
import { MonitoringLogQuery } from "./models/MonitoringLogQuery";
import FilterModel from "./components/FilterModal/FilterModal";

const filterList = [
  "Id",
  "Severity",
  "In Tracking",
  "Routine",
  "Module",
  "Timeframe",
];

function LogsMenu() {
  const [displayedLogs, setDisplayedLogs] = useState([]);

  const [searchQuery, setSearchQuery] = useState(new MonitoringLogQuery());
  const [textFieldValue, setTextFieldValue] = useState("");
  const [textFieldDisabled, setTextFieldDisabled] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [logPages, setLogPages] = useState(1);
  const [paginationDisabled, setPaginationDisabled] = useState(false);
  const logsPerPage = 8;

  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const handleFilterOpenModal = () => setFilterModalOpen(true);
  const handleFilterCloseModal = () => setFilterModalOpen(false);

  const handleTextFieldChange = (event) => {
    setTextFieldValue(event.target.value);
  };

  const handleFilterChipClick = (key, value) => {
    const updatedSearchQuery = { ...searchQuery, [filterList[key]]: value };
    console.log([filterList[key]], key, value);
    console.log(updatedSearchQuery);
    setSearchQuery(updatedSearchQuery);
  };

  const handlePageChange = async (event, page) => {
    setPaginationDisabled(true);
    try {
      setCurrentPage(page);
      const updatedQuery = {
        ...searchQuery,
        limitation: logsPerPage,
        current_page: page,
      };
      const response = await axios.get(
        `${AvailableURLs.BACKEND_HTTP}/logger/get_logs`,
        { params: updatedQuery }
      );

      setDisplayedLogs(response.data.logs);
    } catch (error) {
    } finally {
      setPaginationDisabled(false);
    }
  };

  const handleSearchClick = async () => {
    setTextFieldDisabled(true);
    try {
      const updatedQuery = { ...searchQuery, message: textFieldValue };
      const response = await axios.get(
        `${AvailableURLs.BACKEND_HTTP}/logger/get_logs`,
        {
          params: updatedQuery,
        }
      );
      setDisplayedLogs(response.data.logs);
      setSearchQuery(updatedQuery);
    } catch (error) {
      console.error(error);
    } finally {
      setTextFieldDisabled(false);
    }
  };

  const handleEnterKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearchClick();
    }
  };

  useEffect(() => {
    const fetchLogPageCount = async () => {
      try {
        const response = await axios.get(
          `${AvailableURLs.BACKEND_HTTP}/logger/get_total_log_count`,
          { params: searchQuery }
        );
        setLogPages(
          Math.ceil(parseInt(response.data.logs_count) / logsPerPage)
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchLogPageCount();
  }, [searchQuery]);

  useEffect(() => {
    const initQuery = {
      limitation: logsPerPage,
      current_page: 1,
    };

    const initLogs = async () => {
      setTextFieldDisabled(true);
      try {
        const response = await axios.get(
          `${AvailableURLs.BACKEND_HTTP}/logger/get_logs`,
          {
            params: initQuery,
          }
        );
        setDisplayedLogs(response.data.logs);
      } catch (error) {
        console.error(error);
      } finally {
        setTextFieldDisabled(false);
      }
    };

    initLogs();
    setSearchQuery(initQuery);
  }, []);

  return (
    <Grid
      container
      rowSpacing={1}
      padding="20px"
      paddingTop="30px"
      paddingBottom="30px"
      height="fit-content"
    >
      <Grid
        item
        container
        sx={{
          justifyContent: "center",
          alignContent: "center",
          paddingBottom: "10px",
        }}
      >
        <Grid
          item
          container
          xs={1}
          sx={{
            justifyContent: "center",
            alignContent: "flex-end",
          }}
        >
          <IconButton
            onClick={handleFilterOpenModal}
            sx={{
              justifyContent: "center",
              alignContent: "center",
              color: "var(--mainColor)",
              "&:hover": {
                color: "var(--mainColorToggled)",
              },
            }}
          >
            <Tooltip title="Filter options" enterDelay={500} arrow>
              <FilterListOutlinedIcon />
            </Tooltip>
          </IconButton>
        </Grid>
        <Grid item container xs={9} sm={8} sx={{ alignContent: "center" }}>
          <TextField
            disabled={textFieldDisabled}
            label="Search by message"
            id="search-by-message-input"
            placeholder="ex: Workpiece in processing ..."
            variant="standard"
            autoComplete="off"
            autoCapitalize="off"
            fullWidth
            onKeyUp={handleEnterKeyPress}
            value={textFieldValue}
            onChange={handleTextFieldChange}
            InputLabelProps={{
              style: {
                color: "var(--mainColor)",
              },
            }}
            sx={{
              paddingBottom: "5px",
              "& .MuiInput-underline:after": {
                borderBottomColor: "var(--secondaryColor)",
              },
              "& .MuiInput-underline:before": {
                borderBottomColor: "var(--mainColor)",
              },
              "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                borderBottomColor: "var(--mainColorToggled)",
              },
            }}
          />
        </Grid>
        <Grid
          xs={1}
          item
          container
          sx={{
            justifyContent: "flex-start",
            alignContent: "flex-end",
          }}
        >
          <IconButton
            onClick={handleSearchClick}
            sx={{
              justifyContent: "center",
              alignContent: "center",
              color: "var(--mainColor)",
              "&:hover": {
                color: "var(--mainColorToggled)",
              },
            }}
          >
            <SearchIcon />
          </IconButton>
        </Grid>
        <FilterModel
          onClose={handleFilterCloseModal}
          open={filterModalOpen}
          filterList={filterList}
        />
      </Grid>

      {displayedLogs.map((log, index) => {
        return (
          <Grid
            item
            container
            justifyContent="center"
            xs={12}
            padding="5px"
            key={index}
          >
            <MonitoringLog logData={log} />
          </Grid>
        );
      })}
      <Grid
        item
        container
        sx={{
          justifyContent: "center",
          justifyItems: "center",
        }}
      >
        <Pagination
          count={logPages}
          page={currentPage}
          onChange={handlePageChange}
          disabled={paginationDisabled}
          variant="outlined"
        />
      </Grid>
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
  const [currentActivePage, setCurrentPage] = useState(
    JSON.parse(localStorage.getItem("activePage")) || AvailablePages.HOME
  );

  useEffect(() => {
    localStorage.setItem("activePage", currentActivePage);
  }, [currentActivePage]);

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
