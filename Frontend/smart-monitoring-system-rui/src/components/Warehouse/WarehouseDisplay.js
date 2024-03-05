import "./WarehouseDisplay.css";
import { Button, Grid, Skeleton, Typography, Stack } from "@mui/material";
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
      rowSpacing={1}
      className="warehouse-display-container"
      padding="10px"
      justifyContent="center"
      alignItems="center"
    >
      <Typography gutterBottom variant="h5" color="var(--mainColor)">
        Warehouse
      </Typography>
      <Grid container width="80%" rowSpacing={2}>
        {warehouseStock.length !== 0
          ? warehouseStock.map((row) =>
              row.map((element, index) => (
                <Grid
                  key={index}
                  xs={4}
                  item
                  container
                  padding="15px"
                  alignContent="center"
                  justifyContent="center"
                >
                  <Button
                    key={index}
                    sx={{
                      color: element.color,
                      backgroundColor: "var(--mainColor)",
                      width: "100%",
                      height: "100%",
                    }}
                    disabled={element.color === null}
                  >
                    {element.color ? (
                      <FontAwesomeIcon
                        icon={
                          element.type.toLowerCase().includes("empty")
                            ? faBoxOpen
                            : faHockeyPuck
                        }
                        style={{ fontSize: "2rem" }}
                      />
                    ) : (
                      <DoDisturbIcon style={{ fontSize: "2rem" }} />
                    )}
                  </Button>
                </Grid>
              ))
            )
          : Array.from(Array(9)).map((_, index) => (
              <Grid
                key={index}
                xs={4}
                item
                container
                padding="2px"
                alignContent="center"
                justifyContent="center"
              >
                <Skeleton
                  variant="rectangular"
                  animation="pulse"
                  sx={{
                    width: "70px",
                    height: "70px",
                    backgroundColor: "#f3f2f2",
                  }}
                />
              </Grid>
            ))}
      </Grid>
    </Stack>
  );
}

export default WarehouseDisplay;
