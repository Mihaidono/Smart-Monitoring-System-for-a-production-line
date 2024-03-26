import "./WarehouseDisplay.css";
import {
  Grid,
  Skeleton,
  Typography,
  Stack,
  Box,
  Button,
  styled,
} from "@mui/material";
import { AvailableURLs } from "../../config/enums/AvailableURLs";
import { WarehouseContainerDTO } from "../../models/WarehouseContainer";
import React, { useState, useEffect } from "react";
import { faBoxOpen, faHockeyPuck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import useWebSocket from "react-use-websocket";
import axios from "axios";

const WarehouseButton = styled(Button)(() => ({
  color: "#fff",
  backgroundColor: "var(--mainColor)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "70%",
  height: "40px",

  "&:hover": {
    backgroundColor: "var(--secondaryColor)",
  },
}));

function WarehouseDisplay() {
  const [warehouseStock, setWarehouseStock] = useState([]);
  const { lastMessage } = useWebSocket(
    AvailableURLs.BACKEND_WS + "/ws_get_warehouse_inventory"
  );

  useEffect(() => {
    if (lastMessage && lastMessage.data) {
      try {
        const data = JSON.parse(lastMessage.data);
        const transposedData = data.containers[0].map((_, colIndex) =>
          data.containers.map((row) => row[colIndex])
        );
        const containersData = transposedData.map((row) =>
          row.map((element) => {
            return new WarehouseContainerDTO(
              element.coordinates,
              element.color,
              element.type
            );
          })
        );
        setWarehouseStock(containersData);
      } catch (error) {}
    }
  }, [lastMessage]);

  const handleWorkpieceOrder = async (color) => {
    try {
      await axios.get(
        `${AvailableURLs.BACKEND_HTTP}/order_workpiece?color=${color}`
      );
    } catch (error) {}
  };

  return (
    <Stack
      container
      className="warehouse-display-container"
      justifyContent="center"
      alignItems="center"
      height="100%"
      padding={{ xs: "20px", lg: "0px" }}
    >
      <Typography gutterBottom variant="h5" color="var(--mainColor)">
        Warehouse
      </Typography>
      <Grid container width={{ xs: "100%", sm: "90%" }}>
        {warehouseStock.length !== 0
          ? warehouseStock.map((row) =>
              row.map((element, index) => (
                <Grid
                  key={index}
                  xs={4}
                  item
                  container
                  alignContent="center"
                  justifyContent="center"
                >
                  <Box
                    sx={{
                      width: { xs: "85px", sm: "100px" },
                      height: "100px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "10px",
                      backgroundColor: "var(--mainColor)",
                      color: element.color,
                      position: "relative",
                    }}
                  >
                    {element.color ? (
                      <FontAwesomeIcon
                        icon={
                          element.type.toLowerCase().includes("empty")
                            ? faBoxOpen
                            : faHockeyPuck
                        }
                        style={{
                          fontSize: "3rem",
                          position: "relative",
                          zIndex: 1,
                        }}
                      />
                    ) : (
                      <DoDisturbIcon
                        style={{
                          fontSize: "3rem",
                          position: "relative",
                          zIndex: 1,
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        position: "absolute",
                        top: "40%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "103%",
                        height: "82%",
                        backgroundColor: "var(--primaryColor)",
                        zIndex: 0,
                      }}
                    />
                  </Box>
                </Grid>
              ))
            )
          : Array.from(Array(9)).map((_, index) => (
              <Grid
                key={index}
                xs={4}
                item
                container
                alignContent="center"
                justifyContent="center"
              >
                <Box
                  sx={{
                    width: { xs: "85px", sm: "100px" },
                    height: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "10px",
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    sx={{
                      width: "80%",
                      height: "80%",
                      backgroundColor: "#f3f2f2",
                      borderRadius: "10px",
                    }}
                  />
                </Box>
              </Grid>
            ))}
      </Grid>
      <Grid
        container
        padding="40px"
        justifyContent="space-evenly"
        alignItems="center"
      >
        <Grid xs={4} item container justifyContent="center">
          <WarehouseButton onClick={() => handleWorkpieceOrder("BLUE")}>
            BLUE
          </WarehouseButton>
        </Grid>
        <Grid xs={4} item container justifyContent="center">
          <WarehouseButton onClick={() => handleWorkpieceOrder("WHITE")}>
            WHITE
          </WarehouseButton>
        </Grid>
        <Grid xs={4} item container justifyContent="center">
          <WarehouseButton onClick={() => handleWorkpieceOrder("RED")}>
            RED
          </WarehouseButton>
        </Grid>
      </Grid>
    </Stack>
  );
}

export default WarehouseDisplay;
