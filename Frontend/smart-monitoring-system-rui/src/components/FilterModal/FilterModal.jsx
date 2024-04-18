import { Drawer, Box } from "@mui/material";
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

function FilterModal({ open, onClose, filterList }) {
  const [chipModalOpen, setChipModalOpen] = useState(false);
  const [selectedChip, setSelectedChip] = useState(null);
  const [auxiliaryQuery, setAuxiliaryQuery] = useState(null);

  const handleChipOpenModal = (chipInfo) => {
    setSelectedChip(chipInfo);
    setChipModalOpen(true);
  };
  const handleChipCloseModal = () => setChipModalOpen(false);

  return <Box>Nimic</Box>; //DO IT WITH DRAWER LIKE THE EMAG GODS
}

export default FilterModal;
