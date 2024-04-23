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
      {Object.entries(Severity).map(([key, value]) => {
        return (
          <MenuItem
            key={key}
            value={value}
            sx={{ justifyContent: "center", color: "var(--mainColor)" }}
          >
            {key}
          </MenuItem>
        );
      })}
    </Select>
  );
}

export default SeverityComponent;
