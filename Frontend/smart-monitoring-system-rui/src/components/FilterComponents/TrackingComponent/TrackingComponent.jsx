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
      sx={{
        textAlign: "center",
        color: "#fff",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#fff",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "var(--secondaryColor)",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "var(--secondaryColor)",
        },
        ".MuiSvgIcon-root": {
          fill: "white !important",
        },
        "&:hover .MuiSvgIcon-root": {
          fill: "var(--secondaryColor) !important",
        },
      }}
    >
      <MenuItem
        value={"Yes"}
        sx={{ justifyContent: "center", color: "var(--mainColor)" }}
      >
        Yes
      </MenuItem>
      <MenuItem
        value={"No"}
        sx={{ justifyContent: "center", color: "var(--mainColor)" }}
      >
        No
      </MenuItem>
    </Select>
  );
}

export default TrackingComponent;
