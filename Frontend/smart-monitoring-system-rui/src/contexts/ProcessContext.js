import React, { createContext, useState, useEffect, useRef } from "react";
import useWebSocket from "react-use-websocket";
import { AvailableURLs } from "../config/enums/AvailableURLs";

export const ProcessContext = createContext();

export const ProcessProvider = ({ children }) => {
  const [processStarted, setProcessStarted] = useState(false);
  const prevProcessStarted = useRef(processStarted);

  const { sendJsonMessage: sendProcessStartedMessage } = useWebSocket(
    AvailableURLs.BACKEND_WS + "/ws_process_state"
  );

  useEffect(() => {
    if (prevProcessStarted.current !== processStarted) {
      const sendStateToBackend = async () => {
        const data = {
          process_started: processStarted,
        };
        sendProcessStartedMessage(data);
      };

      sendStateToBackend();
      prevProcessStarted.current = processStarted;
    }
  }, [processStarted, sendProcessStartedMessage]);

  const updateProcessStarted = (newValue) => {
    setProcessStarted(newValue);
  };

  return (
    <ProcessContext.Provider value={{ processStarted, updateProcessStarted }}>
      {children}
    </ProcessContext.Provider>
  );
};
