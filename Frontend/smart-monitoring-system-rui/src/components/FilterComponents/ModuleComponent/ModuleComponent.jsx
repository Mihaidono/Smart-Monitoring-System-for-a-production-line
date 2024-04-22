import { Select, MenuItem } from "@mui/material";
import { MonitoringModules } from "../../../config/enums/MonitoringModules";

function ModuleComponent({ stateValue, setStateValue }) {
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
      {Object.entries(MonitoringModules).map(([key, value]) => {
        return (
          <MenuItem key={key} value={value} sx={{justifyContent:"center"}}>
            {key}
          </MenuItem>
        );
      })}
    </Select>
  );
}

export default ModuleComponent;
