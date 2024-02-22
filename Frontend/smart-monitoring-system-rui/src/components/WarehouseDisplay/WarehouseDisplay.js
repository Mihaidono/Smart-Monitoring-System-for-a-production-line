import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./WarehouseDisplay.css";
import { WarehouseContainerDTO } from "../../models/WarehouseContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHockeyPuck } from "@fortawesome/free-solid-svg-icons";

const baseUrl = `http://${process.env.REACT_APP_BACKEND_API_BASE_URL}:${process.env.REACT_APP_BACKEND_API_PORT}`;

function WarehouseDisplay() {
  const [warehouseStock, setWarehouseStock] = useState([]);
  const sentError = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/get_warehouse_inventory`);

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
        sentError.current = false;
      } catch (error) {
        if (!sentError.current) {
          console.error("Error fetching warehouse inventory:", error);
          sentError.current = true;
        }
      }
    };

    const interval = setInterval(fetchData, 1000);

    return () => clearInterval(interval);
  }, [warehouseStock]);

  return (
    <div className="warehouse-display">
      <h2 className="warehouse-display-label">High-Bay Warehouse</h2>
      <div className="warehouse-grid">
        {warehouseStock.map((row) =>
          row.map((element) => (
            <div className="warehouse-container">
              <FontAwesomeIcon
                className="warehouse-container-icon"
                icon={faHockeyPuck}
                size="4x"
                style={{ color: element.color }}
              />
              <p className="warehouse-container-coordinates-label">
                {element.coordinates &&
                element.coordinates[0] !== undefined &&
                element.coordinates[1] !== undefined
                  ? `x: ${element.coordinates[0].toFixed(0)},
                   y: ${element.coordinates[1].toFixed(0)}`
                  : "Missing"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default WarehouseDisplay;
