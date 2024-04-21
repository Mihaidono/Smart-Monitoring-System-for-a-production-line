import {
  Drawer,
  Stack,
  Button,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AccordionActions,
  Typography,
  Chip,
} from "@mui/material";
import React, { useState } from "react";
import IdComponent from "../FilterComponents/IdComponent/IdComponent";
import SeverityComponent from "../FilterComponents/SeverityComponent/SeverityComponent";
import TrackingComponent from "../FilterComponents/TrackingComponent/TrackingComponent";
import RoutineComponent from "../FilterComponents/RoutineComponent/RoutineComponent";
import ModuleComponent from "../FilterComponents/ModuleComponent/ModuleComponent";

const filterTypes = {
  ID: "Id",
  SEVERITY: "Severity",
  TRACKING: "In Tracking",
  ROUTINE: "Routine",
  MODULE: "Module",
  TIMEFRAME: "Timeframe",
};

function DrawerContent({ filterList }) {
  const [expandedPanel, setExpandedPanel] = useState(null);
  const [chipState, setChipState] = useState(
    Array.from({ length: filterList.length }).fill(false)
  );
  const [filtersTextMessages, setFiltersTextMessages] = useState(filterList);

  const [idValue, setIdValue] = useState("");
  const [severityValue, setSeverityValue] = useState("");
  const [trackingValue, setTrackingValue] = useState("");
  const [routineValue, setRoutineValue] = useState("");
  const [moduleValue, setModuleValue] = useState("");

  const handleFocusedFilterChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : null);
  };

  const handleChipRemove = (index) => {
    let updatedMessages = [...filtersTextMessages];
    updatedMessages[index] = filterList[index];
    setFiltersTextMessages(updatedMessages);

    let updatedState = [...chipState];
    updatedState[index] = false;
    setChipState(updatedState);
  };

  const renderFilterContent = (filterName) => {
    switch (filterName.split(":")[0]) {
      case filterTypes.ID:
        return <IdComponent stateValue={idValue} setStateValue={setIdValue} />;
      case filterTypes.SEVERITY:
        return (
          <SeverityComponent
            stateValue={severityValue}
            setStateValue={setSeverityValue}
          />
        );
      case filterTypes.TRACKING:
        return (
          <TrackingComponent
            stateValue={trackingValue}
            setStateValue={setTrackingValue}
          />
        );
      case filterTypes.ROUTINE:
        return (
          <RoutineComponent
            stateValue={routineValue}
            setStateValue={setRoutineValue}
          />
        );
      case filterTypes.MODULE:
        return (
          <ModuleComponent
            stateValue={moduleValue}
            setStateValue={setModuleValue}
          />
        );
      case filterTypes.TIMEFRAME:
        return <Typography>to implement timeframe</Typography>;
      default:
        break;
    }
  };

  const applyFilterChanges = (filterName, index) => {
    let updatedMessages = [...filtersTextMessages];
    switch (filterName) {
      case filterTypes.ID:
        updatedMessages[index] = `${filterList[index]}: ${idValue}`;
        break;
      case filterTypes.SEVERITY:
        updatedMessages[index] = `${filterList[index]}: ${severityValue}`;
        break;
      case filterTypes.TRACKING:
        updatedMessages[index] = `${filterList[index]}: ${trackingValue}`;
        break;
      case filterTypes.ROUTINE:
        updatedMessages[index] = `${filterList[index]}: ${routineValue}`;
        break;
      case filterTypes.MODULE:
        updatedMessages[index] = `${filterList[index]}: ${moduleValue}`;
        break;
      case filterTypes.TIMEFRAME:
        break;
      default:
        break;
    }
    let updatedState = [...chipState];
    updatedState[index] = true;

    setFiltersTextMessages(updatedMessages);
    setChipState(updatedState);
    setExpandedPanel(null);
  };

  return (
    <Stack
      rowGap={2}
      sx={{
        pt: "20px",
        pb: "20px",
        pl: "10px",
        pr: "10px",
        width: { xs: "80vw", sm: "300px" },
      }}
    >
      {filtersTextMessages.map((value, index) => {
        return (
          <Accordion
            key={index}
            expanded={expandedPanel === index}
            onChange={handleFocusedFilterChange(index)}
            sx={{
              backgroundColor: "var(--primaryColor)",
              color: "var(--mainColor)",
            }}
          >
            <AccordionSummary id={index}>
              <Chip
                label={value}
                onDelete={
                  chipState[index] ? () => handleChipRemove(index) : undefined
                }
                variant="outlined"
                sx={{
                  width: "100%",
                  backgroundColor: "transparent",
                  color: "var(--mainColor)",
                  border: "2px solid transparent",
                  borderRadius: "15px",
                  "& .MuiChip-deleteIcon": {
                    marginRight: 0,
                    marginLeft: "auto",
                  },
                }}
              ></Chip>
            </AccordionSummary>
            <AccordionDetails>{renderFilterContent(value)}</AccordionDetails>
            <AccordionActions>
              <Button onClick={() => applyFilterChanges(value, index)}>
                Apply
              </Button>
            </AccordionActions>
          </Accordion>
        );
      })}
    </Stack>
  );
}

function FilterModal({ open, onClose, filterList }) {
  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <DrawerContent filterList={filterList} />
    </Drawer>
  );
}

export default FilterModal;
