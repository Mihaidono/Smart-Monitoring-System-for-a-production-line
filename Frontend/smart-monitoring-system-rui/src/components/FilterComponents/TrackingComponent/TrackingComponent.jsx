import { Select, MenuItem } from "@mui/material";

function TrackingComponent({ stateValue, setStateValue }) {
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
      <MenuItem value={"Yes"}>Yes</MenuItem>
      <MenuItem value={"No"}>No</MenuItem>
    </Select>
  );
}

export default TrackingComponent;
