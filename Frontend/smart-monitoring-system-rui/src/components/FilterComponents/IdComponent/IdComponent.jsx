import { TextField } from "@mui/material";

function IdComponent({ stateValue, setStateValue }) {
  return (
    <TextField
      fullWidth
      value={stateValue}
      autoComplete="off"
      onChange={(event) => setStateValue(event.target.value)}
      sx={{
        "& .MuiInputBase-input": {
          color: "#fff",
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "#fff",
          },
          "&:hover fieldset": {
            borderColor: "var(--secondaryColor)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "var(--secondaryColor)",
          },
        },
      }}
    />
  );
}

export default IdComponent;
