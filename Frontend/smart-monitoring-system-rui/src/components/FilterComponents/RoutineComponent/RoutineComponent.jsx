import { Select, MenuItem } from "@mui/material";
import { MonitoringRoutines } from "../../../config/enums/MonitoringRoutines";

function RoutineComponent({ stateValue, setStateValue }) {
  const handleChange = (event) => {
    setStateValue(event.target.value);
  };
  return (
    <Select
      value={stateValue}
      onChange={handleChange}
      displayEmpty
      fullWidth
      sx={{ textAlign: "center" }}
    >
      {Object.entries(MonitoringRoutines).map(([key, value]) => {
        return (
          <MenuItem key={key} value={value} sx={{ justifyContent: "center" }}>
            {key}
          </MenuItem>
        );
      })}
    </Select>
  );
}

export default RoutineComponent;
