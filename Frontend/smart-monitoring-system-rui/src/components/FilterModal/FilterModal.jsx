import {
  Stack,
  Button,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AccordionActions,
  Typography,
  Chip,
  SwipeableDrawer,
} from "@mui/material";
import React, { useState } from "react";
import IdComponent from "../FilterComponents/IdComponent/IdComponent";
import SeverityComponent from "../FilterComponents/SeverityComponent/SeverityComponent";
import TrackingComponent from "../FilterComponents/TrackingComponent/TrackingComponent";
import RoutineComponent from "../FilterComponents/RoutineComponent/RoutineComponent";
import ModuleComponent from "../FilterComponents/ModuleComponent/ModuleComponent";
import { FilterList } from "../../config/enums/FilterList";
import { Severity } from "../../config/enums/Severity";
import { MonitoringRoutines } from "../../config/enums/MonitoringRoutines";
import { MonitoringModules } from "../../config/enums/MonitoringModules";

function DrawerContent({ query, updateQuery, filterCount, updateFilterCount }) {
  const [expandedPanel, setExpandedPanel] = useState(null);
  const filterList = Object.values(FilterList);

  const [chipState, setChipState] = useState(
    JSON.parse(sessionStorage.getItem("chipState")) ||
      Array.from({ length: filterList.length }).fill(false)
  );
  const [filtersTextMessages, setFiltersTextMessages] = useState(
    JSON.parse(sessionStorage.getItem("filterList")) || filterList
  );

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

    sessionStorage.setItem("filterList", JSON.stringify(filterList));
    setFiltersTextMessages(updatedMessages);

    let updatedState = [...chipState];
    updatedState[index] = false;

    sessionStorage.setItem("chipState", JSON.stringify(updatedState));
    setChipState(updatedState);

    let updatedQuery = { ...query };
    switch (filterList[index].split(":")[0]) {
      case FilterList.ID:
        delete updatedQuery.log_id;
        break;
      case FilterList.SEVERITY:
        delete updatedQuery.severity;
        break;
      case FilterList.TRACKING:
        delete updatedQuery.while_tracking;
        break;
      case FilterList.ROUTINE:
        delete updatedQuery.current_routine;
        break;
      case FilterList.MODULE:
        delete updatedQuery.current_module;
        break;
      case FilterList.TIMEFRAME:
        break;
      default:
        break;
    }

    sessionStorage.setItem("query", JSON.stringify(updatedQuery));
    sessionStorage.setItem("appliedFilters", JSON.stringify(filterCount - 1));
    updateFilterCount(filterCount - 1);
    updateQuery(updatedQuery);
  };

  const getKeyByValue = (object, value) => {
    return Object.keys(object).find((key) => object[key] === value);
  };

  const renderFilterContent = (filterName) => {
    switch (filterName.split(":")[0]) {
      case FilterList.ID:
        return <IdComponent stateValue={idValue} setStateValue={setIdValue} />;
      case FilterList.SEVERITY:
        return (
          <SeverityComponent
            stateValue={severityValue}
            setStateValue={setSeverityValue}
          />
        );
      case FilterList.TRACKING:
        return (
          <TrackingComponent
            stateValue={trackingValue}
            setStateValue={setTrackingValue}
          />
        );
      case FilterList.ROUTINE:
        return (
          <RoutineComponent
            stateValue={routineValue}
            setStateValue={setRoutineValue}
          />
        );
      case FilterList.MODULE:
        return (
          <ModuleComponent
            stateValue={moduleValue}
            setStateValue={setModuleValue}
          />
        );
      case FilterList.TIMEFRAME:
        return <Typography>to implement timeframe</Typography>;
      default:
        break;
    }
  };

  const applyFilterChanges = (filterName, index) => {
    let updatedQuery = { ...query };
    let updatedMessages = [...filtersTextMessages];
    let stateChanged = false;
    switch (filterName.split(":")[0]) {
      case FilterList.ID:
        if (idValue) {
          updatedMessages[index] = `${filterList[index]}: ${idValue}`;
          stateChanged = true;
          updatedQuery.log_id = idValue;
        }
        break;
      case FilterList.SEVERITY:
        if (severityValue) {
          updatedMessages[index] = `${filterList[index]}: ${getKeyByValue(
            Severity,
            severityValue
          )}`;
          stateChanged = true;
          updatedQuery.severity = severityValue;
        }
        break;
      case FilterList.TRACKING:
        if (trackingValue) {
          updatedMessages[index] = `${filterList[index]}: ${trackingValue}`;
          stateChanged = true;
          if (trackingValue.toLowerCase() === "yes") {
            updatedQuery.while_tracking = true;
          } else if (trackingValue.toLowerCase() === "no") {
            updatedQuery.while_tracking = false;
          }
        }
        break;
      case FilterList.ROUTINE:
        if (routineValue) {
          updatedMessages[index] = `${filterList[index]}: ${getKeyByValue(
            MonitoringRoutines,
            routineValue
          )}`;
          stateChanged = true;
          updatedQuery.current_routine = routineValue;
        }
        break;
      case FilterList.MODULE:
        if (moduleValue) {
          updatedMessages[index] = `${filterList[index]}: ${getKeyByValue(
            MonitoringModules,
            moduleValue
          )}`;
          stateChanged = true;
          updatedQuery.current_module = moduleValue;
        }
        break;
      case FilterList.TIMEFRAME:
        break;
      default:
        break;
    }

    if (stateChanged) {
      let updatedState = [...chipState];
      updatedState[index] = true;
      setChipState(updatedState);
      sessionStorage.setItem("filterList", JSON.stringify(updatedMessages));
      sessionStorage.setItem("chipState", JSON.stringify(updatedState));
      sessionStorage.setItem("query", JSON.stringify(updatedQuery));
      sessionStorage.setItem("appliedFilters", JSON.stringify(filterCount + 1));
      updateFilterCount(filterCount + 1);
    }

    updateQuery(updatedQuery);
    setFiltersTextMessages(updatedMessages);
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
        width: { xs: "90vw", sm: "300px" },
      }}
    >
      {filtersTextMessages.map((value, index) => {
        return (
          <Accordion
            key={index}
            expanded={expandedPanel === index}
            onChange={handleFocusedFilterChange(index)}
            sx={{
              backgroundColor: "var(--mainColor)",
            }}
          >
            <AccordionSummary id={index}>
              <Chip
                label={<Typography>{value}</Typography>}
                onDelete={
                  chipState[index] ? () => handleChipRemove(index) : undefined
                }
                variant="outlined"
                sx={{
                  width: "100%",
                  backgroundColor: "transparent",
                  color: "#fff",
                  border: "2px solid transparent",
                  borderRadius: "15px",
                  "& .MuiChip-deleteIcon": {
                    marginRight: 0,
                    fontSize: "2em",
                    marginLeft: "auto",
                    color: "var(--secondaryColor)",
                  },
                }}
              ></Chip>
            </AccordionSummary>
            <AccordionDetails>{renderFilterContent(value)}</AccordionDetails>
            <AccordionActions>
              <Button
                onClick={() => applyFilterChanges(value, index)}
                sx={{ color: "var(--secondaryColor)" }}
              >
                Apply
              </Button>
            </AccordionActions>
          </Accordion>
        );
      })}
    </Stack>
  );
}

function FilterModal({
  open,
  onClose,
  query,
  updateQuery,
  filterCount,
  updateFilterCount,
}) {
  return (
    <SwipeableDrawer anchor="left" open={open} onClose={onClose}>
      <DrawerContent
        query={query}
        updateQuery={updateQuery}
        updateFilterCount={updateFilterCount}
        filterCount={filterCount}
      />
    </SwipeableDrawer>
  );
}

export default FilterModal;
