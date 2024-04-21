import { Drawer, Box, Stack, Chip, Button } from "@mui/material";
import React, { useState } from "react";

const severity = ["Warning", "Info", "Success"];
const routines = [
  "Initializing",
  "Surveying Bay",
  "Surveying Delivery Process",
  "Timed Out",
  "Confirm Delivery Status",
  "Delivery Successful",
  "Idle",
];
const modules = [
  "Home",
  "Warehouse",
  "Processing Station",
  "Sorting Line",
  "Shipping",
];

function DrawerContent({ filterList }) {
  return (
    <Stack
      rowGap={2}
      sx={{
        pt: "20px",
        pb: "20px",
        pl: "10px",
        pr: "10px",
        width: { xs: "70vw", sm: "300px" },
        height: "100%",
        backgroundColor: "var(--mainColor)",
      }}
    >
      {filterList.map((value, index) => {
        return (
          <Chip
            key={index}
            label={value}
            sx={{
              p: "20px",
              backgroundColor: "#fff",
              color: "var(--mainColor)",
              border:"2px solid #fff",
              borderRadius:"15px"
            }}
          ></Chip>
        );
      })}
    </Stack>
  );
}

function FilterModal({ open, onClose, filterList }) {
  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <DrawerContent filterList={filterList} />
    </Drawer>
  );
}

export default FilterModal;
