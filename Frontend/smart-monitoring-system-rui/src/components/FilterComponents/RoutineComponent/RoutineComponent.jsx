import { Select, MenuItem } from "@mui/material";

const routines = [
  "Initializing",
  "Surveying Bay",
  "Surveying Delivery Process",
  "Timed Out",
  "Confirm Delivery Status",
  "Delivery Successful",
  "Idle",
];

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
      {routines.map((value, index) => {
        return (
          <MenuItem key={index} value={value}>
            {value}
          </MenuItem>
        );
      })}
    </Select>
  );
}

export default RoutineComponent;
