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
  Stack,
  Snackbar,
  CircularProgress
} from "@mui/material";
import { Delete, Edit } from '@mui/icons-material';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [novoProduto, setNovoProduto] = useState({ id: null, nome: '', preco: '', estoque: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarProdutos();
  }, []);

  // Função para buscar produtos no backend
  const carregarProdutos = () => {
    setLoading(true);
    axios.get('http://127.0.0.1:5000/produtos')
      .then(response => {
        setProdutos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao buscar produtos:', error);
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    setNovoProduto({ ...novoProduto, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (novoProduto.preco <= 0) {
      setFeedbackMessage('Preço deve ser maior que zero!');
      setFeedbackOpen(true);
      return;
    }

    if (novoProduto.estoque < 0) {
      setFeedbackMessage('Estoque não pode ser negativo!');
      setFeedbackOpen(true);
      return;
    }

    if (novoProduto.id) {
      axios.put(`http://127.0.0.1:5000/produtos/${novoProduto.id}`, novoProduto)
        .then(() => {
          carregarProdutos(); // Atualiza a lista após edição
          resetarFormulario();
          setFeedbackMessage('Produto atualizado com sucesso!');
          setFeedbackOpen(true);
        })
        .catch(error => {
          console.error('Erro ao atualizar produto:', error);
          setFeedbackMessage('Erro ao atualizar produto!');
          setFeedbackOpen(true);
        });
    } else {
      axios.post('http://127.0.0.1:5000/produtos', novoProduto)
        .then(() => {
          carregarProdutos();
          resetarFormulario();
          setFeedbackMessage('Produto cadastrado com sucesso!');
          setFeedbackOpen(true);
        })
        .catch(error => {
          console.error('Erro ao cadastrar produto:', error);
          setFeedbackMessage('Erro ao cadastrar produto!');
          setFeedbackOpen(true);
        });
    }
  };

  const handleEdit = (produto) => {
    setNovoProduto(produto);
  };

  const handleCancelEdit = () => {
    resetarFormulario();
  };

  const handleDelete = (id) => {
    axios.delete(`http://127.0.0.1:5000/produtos/${id}`)
      .then(() => {
        carregarProdutos(); // Atualiza a lista após exclusão
        setFeedbackMessage('Produto excluído com sucesso!');
        setFeedbackOpen(true);
      })
      .catch(error => {
        console.error('Erro ao excluir produto:', error);
        setFeedbackMessage('Erro ao excluir produto!');
        setFeedbackOpen(true);
      });
  };

  const resetarFormulario = () => {
    setNovoProduto({ id: null, nome: '', preco: '', estoque: '' });
  };

  const filteredProdutos = produtos.filter(produto =>
    produto.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCloseSnackbar = () => {
    setFeedbackOpen(false);
  };

  return (
    <Box sx={{ backgroundColor: '#121B2D', padding: 4, borderRadius: 2 }}>
      <Typography variant="h4" color="white" align="center" gutterBottom>
        Cadastrar Novo Produto
      </Typography>

      <Paper sx={{ padding: 3, backgroundColor: '#1E2A47', mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Stack direction="column" spacing={2} flexWrap="wrap">
            <TextField label="Nome" name="nome" value={novoProduto.nome} onChange={handleChange} required fullWidth sx={{ backgroundColor: '#fff' }} />
            <TextField label="Preço" name="preco" type="number" value={novoProduto.preco} onChange={handleChange} required fullWidth sx={{ backgroundColor: '#fff' }} />
            <TextField label="Estoque" name="estoque" type="number" value={novoProduto.estoque} onChange={handleChange} fullWidth sx={{ backgroundColor: '#fff' }} />
            <Stack direction="row" spacing={2} width="100%">
              {novoProduto.id && (
                <Button type="button" variant="outlined" fullWidth onClick={handleCancelEdit} style={{ backgroundColor: '#f44336', color: '#fff' }}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" variant="contained" fullWidth style={{ backgroundColor: '#00A9E0', color: '#fff' }}>
                {novoProduto.id ? 'Atualizar Produto' : 'Cadastrar Produto'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>

      <Typography variant="h4" color="white" align="center" gutterBottom>
        Lista de Produtos
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <TextField label="Pesquisar Produto" variant="outlined" onChange={(e) => setSearchTerm(e.target.value)} sx={{ width: '300px', backgroundColor: '#fff' }} />
      </Box>

      {loading ? (
        <CircularProgress color="primary" sx={{ display: 'block', margin: 'auto' }} />
      ) : (
        <TableContainer component={Paper} sx={{ backgroundColor: '#1E2A47' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ color: '#00A9E0' }}>Nome</TableCell>
                <TableCell align="center" sx={{ color: '#00A9E0' }}>Preço</TableCell>
                <TableCell align="center" sx={{ color: '#00A9E0' }}>Estoque</TableCell>
                <TableCell align="center" sx={{ color: '#00A9E0' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProdutos.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell align="center" sx={{ color: '#A1B2C1' }}>{produto.nome}</TableCell>
                  <TableCell align="center" sx={{ color: '#A1B2C1' }}>R$ {parseFloat(produto.preco).toFixed(2)}</TableCell>
                  <TableCell align="center" sx={{ color: '#A1B2C1' }}>{produto.estoque}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEdit(produto)} color="primary"><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(produto.id)} color="secondary"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar open={feedbackOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} message={feedbackMessage} />
    </Box>
  );
};

export default Produtos;