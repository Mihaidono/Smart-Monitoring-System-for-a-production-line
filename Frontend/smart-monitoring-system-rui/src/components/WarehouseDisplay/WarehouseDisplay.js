import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./WarehouseDisplay.css";
import { WarehouseContainerDTO } from "../../models/WarehouseContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHockeyPuck } from "@fortawesome/free-solid-svg-icons";

const baseUrl = `http://${process.env.REACT_APP_BACKEND_API_BASE_URL}:${process.env.REACT_APP_BACKEND_API_PORT}`;

function WarehouseDisplay() {
  //const [warehouseStock, setWarehouseStock] = useState([]);
  //const sentError = useRef(false);
  const warehouseStock = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get(`${baseUrl}/get_warehouse_inventory`);

  //       const containersData = [];
  //       response.data.containers.forEach((element) => {
  //         const innerList = element.map((container) => {
  //           return new WarehouseContainerDTO(
  //             container.coordinates,
  //             container.color,
  //             container.type
  //           );
  //         });

  //         containersData.push(innerList);
  //       });
  //       setWarehouseStock(containersData);
  //       sentError.current = false;
  //     } catch (error) {
  //       if (!sentError.current) {
  //         console.error("Error fetching warehouse inventory:", error);
  //         sentError.current = true;
  //       }
  //     }
  //   };

  //   const interval = setInterval(fetchData, 1000);

  //   return () => clearInterval(interval);
  // }, [warehouseStock]);

  return (
    <div className="warehouse-display">
      {warehouseStock.map((row, rowIndex) =>
        row.map((element, columnIndex) => (
          <div className={`grid-item row-${rowIndex}-col-${columnIndex}`}>
            <FontAwesomeIcon
              className="warehouse-container-icon"
              icon={faHockeyPuck} size="5x"
            />
            <p className="warehouse-container-coordinates-label">{element}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default WarehouseDisplay;
