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
      <MenuItem value={"Yes"} sx={{justifyContent:"center"}}>Yes</MenuItem>
      <MenuItem value={"No"} sx={{justifyContent:"center"}}>No</MenuItem>
    </Select>
  );
}

export default TrackingComponent;
