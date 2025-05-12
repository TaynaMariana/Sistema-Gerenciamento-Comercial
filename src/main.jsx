import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Criação da raiz de renderização do React
const root = createRoot(document.getElementById('root'));

// Renderiza o componente App dentro do StrictMode para capturar problemas de forma mais rigorosa no desenvolvimento
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
