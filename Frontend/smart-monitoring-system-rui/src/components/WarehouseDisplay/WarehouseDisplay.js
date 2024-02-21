import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./WarehouseDisplay.css";
import { WarehouseContainerDTO } from "../../models/WarehouseContainer";

const baseUrl = `${process.env.BACKEND_API_BASE_URL}:${process.env.BACKEND_API_PORT}`;

function WarehouseDisplay() {
  const [warehouseStock, setWarehouseStock] = useState([]);
  const sentError = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/get_warehouse_inventory`);
        const containersData = response.data.containers.map((container) => {
          return new WarehouseContainerDTO(
            container.coordinates,
            container.color,
            container.type
          );
        });
        setWarehouseStock(containersData);
        sentError.current = false;
      } catch (error) {
        if (!sentError.current) {
          console.error("Error fetching warehouse inventory:", error);
          sentError.current = true;
        }
      }
    };

    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="warehouse-display">
      {warehouseStock.map((container) => (
        <div className="warehouse-item">{container.coordinates}</div>
      ))}
    </div>
  );
}

export default WarehouseDisplay;
