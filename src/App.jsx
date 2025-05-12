// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, Toolbar, CssBaseline } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Clientes from "./pages/Clientes";
import Produtos from "./pages/Produtos";
import Compras from "./pages/Compras";
import Home from "./pages/Home";
import Relatorios from "./pages/Relatorios";
import Footer from "./components/Footer";

const App = () => {
  return (
    <Router>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />

        <Sidebar />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            ml: "240px", // margem à esquerda fixada pela sidebar
            width: "calc(100% - 240px)", // ocupa o restante da largura
          }}
        >
          <Header />
          <Toolbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Routes>
        </Box>
      </Box>

      <Footer />
    </Router>
  );
};

export default App;
