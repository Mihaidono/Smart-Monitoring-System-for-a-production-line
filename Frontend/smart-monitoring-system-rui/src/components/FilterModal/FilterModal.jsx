import { Grid, Typography, Box, Modal, Chip } from "@mui/material";
import React, { useState } from "react";

function FilterModal({ open, onClose, filterList }) {
  const [chipModalOpen, setChipModalOpen] = useState(false);

  const handleChipOpenModal = () => setChipModalOpen(true);
  const handleChipCloseModal = () => setChipModalOpen(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="Filter"
      aria-describedby="Filter Log Messages List"
    >
      <Box
        sx={{
          position: "absolute",
          top: "30%",
          left: { xs: "50%", sm: "55%", md: "50%" },
          transform: "translate(-50%, -50%)",
          width: { xs: "80%", sm: "70%", md: "50%" },
          height: "30%",
          backgroundColor: "#fff",
          border: "2px solid var(--mainColorToggled)",
          padding: "20px",
        }}
      >
        <Typography
          gutterBottom
          id="modal-modal-title"
          variant="h5"
          component="h2"
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
                  p: "10px",
                }}
              />
              <Modal open={chipModalOpen} onClose={handleChipCloseModal}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "30%",
                    left: { xs: "50%", sm: "55%", md: "50%" },
                    transform: "translate(-50%, -50%)",
                    width: { xs: "80%", sm: "70%", md: "50%" },
                    height: "30%",
                    backgroundColor: "#fff",
                    border: "2px solid var(--mainColorToggled)",
                    padding: "20px",
                  }}
                >
                  element
                </Box>
              </Modal>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Modal>
  );
}

export default FilterModal;
