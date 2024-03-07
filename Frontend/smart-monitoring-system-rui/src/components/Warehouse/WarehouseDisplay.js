import "./WarehouseDisplay.css";
import { Grid, Skeleton, Typography, Stack, Box } from "@mui/material";
import { AvailableURLs } from "../../config/enums/AvailableURLs";
import { WarehouseContainerDTO } from "../../models/WarehouseContainer";
import React, { useState, useEffect } from "react";
import { faBoxOpen, faHockeyPuck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import axios from "axios";

function WarehouseDisplay() {
  const [warehouseStock, setWarehouseStock] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${AvailableURLs.BACKEND}/get_warehouse_inventory`
        );

        const containersData = [];
        for (let i = 0; i < response.data.containers[0].length; i++) {
          const innerList = response.data.containers.map((element) => {
            return new WarehouseContainerDTO(
              element[i].coordinates,
              element[i].color,
              element[i].type
            );
          });
          containersData.push(innerList);
        }
        setWarehouseStock(containersData);
      } catch (error) {
        console.error("Error fetching warehouse inventory:", error.message);
        setWarehouseStock([]);
      }
    };

    const interval = setInterval(fetchData, 1000);

    return () => clearInterval(interval);
  }, [warehouseStock]);

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
    </Stack>
  );
}

export default WarehouseDisplay;
