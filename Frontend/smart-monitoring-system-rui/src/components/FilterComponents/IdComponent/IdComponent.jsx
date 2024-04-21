import { TextField } from "@mui/material";

function IdComponent({ stateValue, setStateValue }) {
  return (
    <TextField
      fullWidth
      value={stateValue}
      onChange={(event) => setStateValue(event.target.value)}
    />
  );
}

export default IdComponent;
