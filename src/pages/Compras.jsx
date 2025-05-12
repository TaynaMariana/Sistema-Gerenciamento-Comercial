import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

const Compras = () => {
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [estoqueDisponivel, setEstoqueDisponivel] = useState(null);
  const [mensagemErro, setMensagemErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [compras, setCompras] = useState([]);
  const [produtosNaCompra, setProdutosNaCompra] = useState([]);
  const [valorTotal, setValorTotal] = useState(0);

  useEffect(() => {
    buscarProdutos();
    buscarClientes();
    buscarCompras();
  }, []);

  useEffect(() => {
    const total = produtosNaCompra.reduce(
      (acc, produto) => acc + produto.preco * produto.quantidade,
      0
    );
    setValorTotal(total);
  }, [produtosNaCompra]);

  const buscarProdutos = () => {
    axios
      .get('http://127.0.0.1:5000/produtos')
      .then((res) => setProdutos(res.data))
      .catch((err) => console.error('Erro ao buscar produtos:', err));
  };

  const buscarClientes = () => {
    axios
      .get('http://127.0.0.1:5000/clientes')
      .then((res) => setClientes(res.data))
      .catch((err) => console.error('Erro ao buscar clientes:', err));
  };

  const buscarCompras = () => {
    axios
      .get('http://127.0.0.1:5000/compras')
      .then((res) => setCompras(res.data))
      .catch((err) => console.error('Erro ao buscar compras:', err));
  };

  const handleProdutoChange = (e) => {
    const id = e.target.value;
    setProdutoSelecionado(id);
    setMensagemErro('');
    setMensagemSucesso('');
    setEstoqueDisponivel(null);

    axios
      .get(`http://127.0.0.1:5000/produtos/${id}`)
      .then((res) => setEstoqueDisponivel(res.data.estoque))
      .catch((err) => console.error('Erro ao buscar produto:', err));
  };

  const handleAddProduto = () => {
    if (!produtoSelecionado || !quantidade) {
      setMensagemErro('Preencha todos os campos!');
      return;
    }

    const produtoSelecionadoData = produtos.find(
      (prod) => prod.id === produtoSelecionado
    );

    if (quantidade > estoqueDisponivel) {
      setMensagemErro('Estoque insuficiente para a quantidade informada.');
      return;
    }

    const novoProdutoNaCompra = {
      id: produtoSelecionado,
      nome: produtoSelecionadoData.nome,
      preco: produtoSelecionadoData.preco,
      quantidade: parseInt(quantidade),
    };

    setProdutosNaCompra([...produtosNaCompra, novoProdutoNaCompra]);
    setProdutoSelecionado('');
    setQuantidade('');
    setEstoqueDisponivel(null);
  };

  const handleRemoverProduto = (id) => {
    setProdutosNaCompra(produtosNaCompra.filter(produto => produto.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!clienteSelecionado) {
      setMensagemErro('Selecione um cliente!');
      return;
    }

    const novaCompra = {
      cliente_id: clienteSelecionado,
      produtos: produtosNaCompra.map((produto) => ({
        produto_id: produto.id,
        quantidade: produto.quantidade,
      })),
    };

    axios
      .post('http://127.0.0.1:5000/compras', novaCompra)
      .then(() => {
        setMensagemErro('');
        setMensagemSucesso('Compra registrada com sucesso!');
        setProdutosNaCompra([]);
        setClienteSelecionado('');
        buscarProdutos();
        buscarCompras();
      })
      .catch((err) => {
        console.error('Erro ao registrar compra:', err);
        setMensagemErro('Erro ao registrar compra.');
      });
  };

  const nomeProduto = (id) => {
    const prod = produtos.find((p) => p.id === id);
    return prod ? prod.nome : `ID ${id}`;
  };

  const nomeCliente = (id) => {
    const cli = clientes.find((c) => c.id === id);
    return cli ? cli.nome : `ID ${id}`;
  };

  return (
    <Box sx={{ backgroundColor: '#121B2D', padding: 4, borderRadius: 2 }}>
      <Typography variant="h4" color="white" align="center" gutterBottom>
        Registrar Compra
      </Typography>

      <Paper sx={{ padding: 3, backgroundColor: '#1E2A47', mb: 4 }}>
        {mensagemErro && <Alert severity="error">{mensagemErro}</Alert>}
        {mensagemSucesso && <Alert severity="success">{mensagemSucesso}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            select
            label="Cliente"
            value={clienteSelecionado}
            onChange={(e) => setClienteSelecionado(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2, backgroundColor: '#fff' }}
          >
            {clientes.map((cli) => (
              <MenuItem key={cli.id} value={cli.id}>
                {cli.nome}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Produto"
            value={produtoSelecionado}
            onChange={handleProdutoChange}
            fullWidth
            required
            sx={{ mb: 2, backgroundColor: '#fff' }}
          >
            {produtos.map((prod) => (
              <MenuItem key={prod.id} value={prod.id}>
                {prod.nome}
              </MenuItem>
            ))}
          </TextField>

          {estoqueDisponivel !== null && (
            <Typography color="white" sx={{ mb: 1 }}>
              Estoque disponível: {estoqueDisponivel}
            </Typography>
          )}

          <TextField
            label="Quantidade"
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            fullWidth
            required
            inputProps={{ min: 1 }}
            sx={{ mb: 2, backgroundColor: '#fff' }}
          />

          <Button
            type="button"
            variant="contained"
            fullWidth
            style={{ backgroundColor: '#00A9E0', color: '#fff', marginBottom: 10 }}
            onClick={handleAddProduto}
          >
            Adicionar Produto
          </Button>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            style={{ backgroundColor: '#00A9E0', color: '#fff' }}
          >
            Registrar Compra
          </Button>
        </form>
      </Paper>

      <Typography variant="h5" color="white" gutterBottom>
        Produtos na Compra
      </Typography>
      <Typography color="white" gutterBottom>
        Valor Total: R$ {valorTotal.toFixed(2)}
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650, backgroundColor: '#f5f5f5' }}>
          <TableHead>
            <TableRow>
              <TableCell>Produto</TableCell>
              <TableCell>Quantidade</TableCell>
              <TableCell>Preço Unitário</TableCell>
              <TableCell>Preço Total</TableCell>
              <TableCell>Remover</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {produtosNaCompra.map((produto, index) => (
              <TableRow key={index}>
                <TableCell>{produto.nome}</TableCell>
                <TableCell>{produto.quantidade}</TableCell>
                <TableCell>R$ {produto.preco.toFixed(2)}</TableCell>
                <TableCell>
                  R$ {(produto.preco * produto.quantidade).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoverProduto(produto.id)}
                  >
                    Remover
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" color="white" gutterBottom>
        Compras Realizadas
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650, backgroundColor: '#f5f5f5' }}>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Produto</TableCell>
              <TableCell>Quantidade</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {compras.map((compra, index) => (
              <TableRow key={index}>
                <TableCell>{nomeCliente(compra.cliente_id)}</TableCell>
                <TableCell>{nomeProduto(compra.produto_id)}</TableCell>
                <TableCell>{compra.quantidade}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Compras;