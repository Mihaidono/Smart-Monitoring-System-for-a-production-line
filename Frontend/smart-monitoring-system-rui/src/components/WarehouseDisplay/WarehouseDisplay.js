import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./WarehouseDisplay.css";
import { WarehouseContainerDTO } from "../../models/WarehouseContainer";

const baseUrl = `http://${process.env.REACT_APP_BACKEND_API_BASE_URL}:${process.env.REACT_APP_BACKEND_API_PORT}`;

function WarehouseDisplay() {
  const [warehouseStock, setWarehouseStock] = useState([]);
  const sentError = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/get_warehouse_inventory`);

        const containersData = [];
        response.data.containers.forEach((element) => {
          const innerList = element.map((container) => {
            return new WarehouseContainerDTO(
              container.coordinates,
              container.color,
              container.type
            );
          });

          containersData.push(innerList);
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

    const interval = setInterval(fetchData, 1000);

    return () => clearInterval(interval);
  }, [warehouseStock]);

  return (
    <div className="warehouse-display">
      <p>Hello</p>
    </div>
  );
}

export default WarehouseDisplay;
