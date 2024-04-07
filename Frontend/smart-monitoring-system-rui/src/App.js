import React, { useState, useRef } from "react";
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

function LogsMenu() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const textFieldValueRef = useRef("");

  const logsPerPage = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const filterLogsByMessage = (message) => {};

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
        <Grid item container xs={10} sm={9} sx={{ alignContent: "center" }}>
          <TextField
            onChange={filterLogsByMessage}
            label="Search by message"
            id="search-by-message-input"
            placeholder="Workpiece in processing ..."
            variant="standard"
            autoComplete="off"
            autoCapitalize="off"
            fullWidth
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

      {Array.from(Array(2)).map(() => {
        return (
          <Grid item container justifyContent="center" xs={12} padding="5px">
            <MonitoringLog
              logData={{
                timestamp: "2024-04-03T08:01:12+00:00",
                message:
                  "The workpiece has been processed processe dprocessed processed processedpro cessedproces sedprocessedproces sedprocessedprocessedpro cessedprocessedprocessedp rocesse dprocessedprocessed",
                id: "507f1f77bcf86cd799439011",
              }}
            />
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
        <Pagination count={10} variant="outlined" />
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
