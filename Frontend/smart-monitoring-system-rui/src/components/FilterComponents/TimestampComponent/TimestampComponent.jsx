import React from "react";
import { Box } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DateTime } from "luxon";

function TimestampComponent({
  lowerBoundaryValue,
  setLowerBoundaryValue,
  upperBoundaryValue,
  setUpperBoundaryValue,
}) {
  const formatDateTimeToString = (dateTime) => {
    if (dateTime) {
      return dateTime.toISO();
    }
    return "";
  };

  const parseStringToDateTime = (dateTimeString) => {
    if (dateTimeString) {
      return DateTime.fromISO(dateTimeString);
    }
    return null;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <Box
        sx={{
          paddingTop: "10px",
          paddingBottom: "10px",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <DateTimePicker
          label="From"
          disableFuture
          value={parseStringToDateTime(lowerBoundaryValue)}
          onChange={(date) =>
            setLowerBoundaryValue(formatDateTimeToString(date))
          }
          slotProps={{ textField: { variant: "outlined" } }}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#fff",
              "& fieldset": {
                borderColor: "#fff",
              },
              "&:hover fieldset": {
                borderColor: "var(--secondaryColor)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "var(--secondaryColor)",
              },
            },
            "& .MuiFormLabel-root": {
              color: "#fff",
              "&.Mui-focused fieldset": {
                color: "#fff",
              },
            },
            "& .MuiIconButton-root": {
              color: "#fff",
            },
          }}
        />
      </Box>
      <Box
        sx={{
          paddingTop: "10px",
          paddingBottom: "10px",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <DateTimePicker
          label="To"
          disableFuture
          value={parseStringToDateTime(upperBoundaryValue)}
          onChange={(date) =>
            setUpperBoundaryValue(formatDateTimeToString(date))
          }
          slotProps={{ textField: { variant: "outlined" } }}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#fff",
              "& fieldset": {
                borderColor: "#fff",
              },
              "&:hover fieldset": {
                borderColor: "var(--secondaryColor)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "var(--secondaryColor)",
              },
            },
            "& .MuiFormLabel-root": {
              color: "#fff",
              "&.Mui-focused fieldset": {
                color: "#fff",
              },
            },
            "& .MuiIconButton-root": {
              color: "#fff",
            },
          }}
        />
      </Box>
    </LocalizationProvider>
  );
}

export default TimestampComponent;
