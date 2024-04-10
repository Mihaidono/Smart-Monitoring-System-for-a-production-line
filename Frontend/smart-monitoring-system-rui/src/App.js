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

function LogsMenu() {
  const [displayedLogs, setDisplayedLogs] = useState([]);

  const [searchQuery, setSearchQuery] = useState({});
  const [textFieldValue, setTextFieldValue] = useState("");
  const [textFieldDisabled, setTextFieldDisabled] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [logPages, setLogPages] = useState(1);
  const [paginationDisabled, setPaginationDisabled] = useState(false);
  const logsPerPage = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleTextFieldChange = (event) => {
    setTextFieldValue(event.target.value);
  };

  const handleSearchClick = async () => {
    setTextFieldDisabled(true);
    try {
      const updatedSearchQuery = { ...searchQuery, message: textFieldValue };
      const response = await axios.get(
        `${AvailableURLs.BACKEND_HTTP}/logger/get_logs`,
        updatedSearchQuery
      );
      setSearchQuery(updatedSearchQuery);
      setDisplayedLogs(response.data.logs);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setTextFieldDisabled(false);
    }
  };

  const handlePageChange = async (event, page) => {
    setCurrentPage(page);
    setPaginationDisabled(true);
    try {
      const response = await axios.get(
        `${AvailableURLs.BACKEND_HTTP}/logger/get_logs`,
        searchQuery
      );

      setDisplayedLogs(response.data.logs);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setPaginationDisabled(false);
    }
  };

  useEffect(() => {
    const fetchLogPageCount = async () => {
      try {
        const response = await axios.get(
          `${AvailableURLs.BACKEND_HTTP}/logger/get_total_log_count`,
          searchQuery
        );
        setLogPages(
          Math.ceil(parseInt(response.data.logs_count) / logsPerPage)
        );
      } catch (error) {}
    };

    fetchLogPageCount();
  }, [searchQuery]);

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
            onClick={handleOpenModal}
            sx={{
              justifyContent: "center",
              alignContent: "center",
              color: "var(--mainColor)",
              "&:hover": {
                color: "var(--mainColorToggled)",
              },
            }}
          >
            <Tooltip title="Filter options" enterDelay={200} arrow>
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
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          aria-labelledby="Filter"
          aria-describedby="Filter Log Messages List"
        >
          <Box
            sx={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "30%",
              height: "30%",
              backgroundColor: "#fff",
              border: "2px solid var(--mainColorToggled)",
              padding: "20px",
            }}
          >
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Text in a modal
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
            </Typography>
          </Box>
        </Modal>
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
