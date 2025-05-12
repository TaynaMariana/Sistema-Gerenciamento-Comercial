// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { Home, People, ShoppingCart, Store, BarChart } from "@mui/icons-material";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: <Home /> },
    { path: "/clientes", label: "Clientes", icon: <People /> },
    { path: "/produtos", label: "Produtos", icon: <Store /> },
    { path: "/compras", label: "Compras", icon: <ShoppingCart /> },
    { path: "/relatorios", label: "Relatórios", icon: <BarChart /> },
  ];

  return (
    <div className="sidebar expanded">
      <h2 className="logo">Comercial</h2>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className={location.pathname === item.path ? "active" : ""}>
              <Link to={item.path}>
                {item.icon}
                <span style={{ marginLeft: 16 }}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
