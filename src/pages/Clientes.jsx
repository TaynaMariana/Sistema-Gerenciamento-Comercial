import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack
} from "@mui/material";
import { Delete, Edit } from '@mui/icons-material';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [novoCliente, setNovoCliente] = useState({
    id: null,
    nome: '',
    email: '',
    telefone: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/clientes')
      .then(response => setClientes(response.data))
      .catch(error => console.error('Erro ao buscar clientes:', error));
  }, []);

  const handleChange = (e) => {
    setNovoCliente({
      ...novoCliente,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (novoCliente.id) {
      // Edição
      axios.put(`http://127.0.0.1:5000/clientes/${novoCliente.id}`, novoCliente)
        .then(() => {
          setClientes(clientes.map(cliente => cliente.id === novoCliente.id ? novoCliente : cliente)); // Atualiza a tabela
          setNovoCliente({ id: null, nome: '', email: '', telefone: '' });
        })
        .catch(error => {
          console.error('Erro ao atualizar cliente:', error);
        });
    } else {
      // Criação
      axios.post('http://127.0.0.1:5000/clientes', novoCliente)
        .then(response => {
          setClientes([...clientes, response.data]);
          setNovoCliente({ id: null, nome: '', email: '', telefone: '' });
        })
        .catch(error => {
          console.error('Erro ao cadastrar cliente:', error);
        });
    }
  };

  const handleEdit = (cliente) => {
    setNovoCliente(cliente);
  };

  const handleDelete = (id) => {
    if (window.confirm("Deseja realmente deletar este cliente?")) {
      axios.delete(`http://127.0.0.1:5000/clientes/${id}`)
        .then(() => setClientes(clientes.filter(cliente => cliente.id !== id)))
        .catch(error => console.error('Erro ao deletar cliente:', error));
    }
  };

  const handleCancel = () => {
    setNovoCliente({ id: null, nome: '', email: '', telefone: '' }); // Limpa o formulário
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ backgroundColor: '#121B2D', padding: 4, borderRadius: 2 }}>
      <Typography variant="h4" color="white" align="center" gutterBottom>
        Cadastrar Novo Cliente
      </Typography>

      <Paper sx={{ padding: 3, backgroundColor: '#1E2A47', mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} useFlexGap flexWrap="wrap">
            <TextField
              label="Nome"
              name="nome"
              value={novoCliente.nome}
              onChange={handleChange}
              required
              fullWidth
              sx={{ backgroundColor: '#fff' }}
            />
            <TextField
              label="Email"
              name="email"
              value={novoCliente.email}
              onChange={handleChange}
              required
              fullWidth
              sx={{ backgroundColor: '#fff' }}
            />
            <TextField
              label="Telefone"
              name="telefone"
              value={novoCliente.telefone}
              onChange={handleChange}
              required
              fullWidth
              sx={{ backgroundColor: '#fff' }}
            />
            <Stack direction="row" spacing={2} width="100%">
              {novoCliente.id && (
                <Button type="button" variant="outlined" fullWidth onClick={handleCancel} style={{ backgroundColor: '#f44336', color: '#fff' }}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" variant="contained" fullWidth style={{ backgroundColor: '#00A9E0', color: '#fff' }}>
                {novoCliente.id ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>

      <Typography variant="h4" color="white" align="center" gutterBottom>
        Lista de Clientes
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <TextField
          label="Pesquisar Cliente"
          variant="outlined"
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: '300px', backgroundColor: '#fff' }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ backgroundColor: '#1E2A47' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ color: '#00A9E0' }}>Nome</TableCell>
              <TableCell align="center" sx={{ color: '#00A9E0' }}>Email</TableCell>
              <TableCell align="center" sx={{ color: '#00A9E0' }}>Telefone</TableCell>
              <TableCell align="center" sx={{ color: '#00A9E0' }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell align="center" sx={{ color: '#A1B2C1' }}>{cliente.nome}</TableCell>
                <TableCell align="center" sx={{ color: '#A1B2C1' }}>{cliente.email}</TableCell>
                <TableCell align="center" sx={{ color: '#A1B2C1' }}>{cliente.telefone}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleEdit(cliente)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(cliente.id)} color="secondary">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Clientes;
