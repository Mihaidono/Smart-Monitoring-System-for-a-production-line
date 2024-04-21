import { Select, MenuItem } from "@mui/material";

const modules = [
  "Home",
  "Warehouse",
  "Processing Station",
  "Sorting Line",
  "Shipping",
];

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
      {modules.map((value, index) => {
        return (
          <MenuItem key={index} value={value}>
            {value}
          </MenuItem>
        );
      })}
    </Select>
  );
}

export default ModuleComponent;
