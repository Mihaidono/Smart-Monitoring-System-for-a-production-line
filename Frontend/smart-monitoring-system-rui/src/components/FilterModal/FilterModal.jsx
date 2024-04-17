import { Grid, Typography, Box, Dialog, Chip } from "@mui/material";
import React, { useState } from "react";

function FilterModal({ open, onClose, filterList }) {
  const [chipModalOpen, setChipModalOpen] = useState(false);

  const handleChipOpenModal = () => setChipModalOpen(true);
  const handleChipCloseModal = () => setChipModalOpen(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="Filter"
      aria-describedby="Filter Log Messages List"
    >
      <Box sx={{ width: "90%", p: "20px" }}>
        <Typography
          gutterBottom
          variant="h5"
          component="h2"
          sx={{ color: "var(--mainColorToggled)" }}
        >
          Select filters:
        </Typography>
        <Grid container rowSpacing={1}>
          {filterList.map((value, index) => (
            <Grid item key={index} sx={{ pr: "10px" }}>
              <Chip
                label={value}
                onClick={handleChipOpenModal}
                variant="outlined"
                sx={{
                  fontSize: "1em",
                  color: "var(--mainColorToggled)",
                  p: "10px",
                }}
              />
            </Grid>
          ))}
        </Grid>
        <Dialog open={chipModalOpen} onClose={handleChipCloseModal}>
          <Box
            sx={{
              width: { xs: "70%", sm: "60%", md: "40%" },
              p: "20px",
            }}
          >
            element
          </Box>
        </Dialog>
      </Box>
    </Dialog>
  );
}

export default FilterModal;
