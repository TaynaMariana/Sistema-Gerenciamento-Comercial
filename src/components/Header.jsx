// src/components/Header.jsx
import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";

const Header = () => {
  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#121B2D", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Sistema de Gerenciamento Comercial
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
      </Toolbar>
    </AppBar>
  );
};

export default Header;