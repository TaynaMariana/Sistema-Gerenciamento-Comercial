import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#121B2D',
        padding: 3,
        position: 'fixed',
        bottom: 0,
        left: 220,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#A1B2C1',
      }}
    >
      <Typography variant="body2" sx={{ textAlign: 'center' }}>
        &copy; {new Date().getFullYear()} Sistema Comercial.  
        <br />
        Desenvolvido por alunos da UNA - Contagem.
      </Typography>
    </Box>
  );
};

export default Footer;
