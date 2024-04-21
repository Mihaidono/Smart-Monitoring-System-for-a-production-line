import { Select, MenuItem } from "@mui/material";

const severity = ["Warning", "Info", "Success"];

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
      {severity.map((value, index) => {
        return (
          <MenuItem key={index} value={value}>
            {value}
          </MenuItem>
        );
      })}
    </Select>
  );
}

export default SeverityComponent;
