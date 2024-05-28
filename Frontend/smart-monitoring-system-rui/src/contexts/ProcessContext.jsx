import React, { createContext, useState } from "react";
import { AvailableURLs } from "../config/enums/AvailableURLs";
import axios from "axios";

export const ProcessContext = createContext();

export const ProcessProvider = ({ children }) => {
  const [processStarted, setProcessStarted] = useState(
    JSON.parse(localStorage.getItem("processStarted")) || false
  );

  const updateProcessStarted = (newValue) => {
    setProcessStarted(newValue);
    localStorage.setItem("processStarted", JSON.stringify(newValue));
    const sendStateToBackend = async () => {
      try {
        await axios.post(`${AvailableURLs.BACKEND_HTTP}/set_process_state`, {
          new_state: newValue,
        });
      } catch (error) {}
    };

    sendStateToBackend();
  };

  return (
    <ProcessContext.Provider value={{ processStarted, updateProcessStarted }}>
      {children}
    </ProcessContext.Provider>
  );
};
