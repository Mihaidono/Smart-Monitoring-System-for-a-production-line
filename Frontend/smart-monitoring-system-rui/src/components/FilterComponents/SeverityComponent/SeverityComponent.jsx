import { Select, MenuItem } from "@mui/material";
import { Severity } from "../../../config/enums/Severity";

function SeverityComponent({ stateValue, setStateValue }) {
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
      {Object.entries(Severity).map(([key, value]) => {
        return (
          <MenuItem key={key} value={value} sx={{justifyContent:"center"}}>
            {key}
          </MenuItem>
        );
      })}
    </Select>
  );
}

export default SeverityComponent;
