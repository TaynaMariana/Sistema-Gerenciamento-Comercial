import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

const Relatorio = () => {
  const [compras, setCompras] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState({
    dataInicial: '',
    dataFinal: '',
    cliente: '',
    produto: '',
    tipoRelatorio: ''
  });
  const [mensagemErro, setMensagemErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  useEffect(() => {
    // Carregar todos os clientes e produtos ao iniciar o componente
    axios.get('http://127.0.0.1:5000/clientes')
      .then((res) => setClientes(res.data))
      .catch((error) => {
        console.error('Erro ao carregar clientes:', error);
        setMensagemErro('Erro ao carregar dados de clientes.');
      });
    
    axios.get('http://127.0.0.1:5000/produtos')
      .then((res) => setProdutos(res.data))
      .catch((error) => {
        console.error('Erro ao carregar produtos:', error);
        setMensagemErro('Erro ao carregar dados de produtos.');
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltro({
      ...filtro,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMensagemErro('');
    setMensagemSucesso('');

    // Verificar se pelo menos um filtro foi preenchido
    if (!filtro.dataInicial && !filtro.dataFinal && !filtro.cliente && !filtro.produto && !filtro.tipoRelatorio) {
      setMensagemErro('Por favor, preencha ao menos um filtro.');
      return;
    }

    // Filtrando compras conforme os dados do filtro
    axios.post('http://127.0.0.1:5000/compras/filtrar', filtro)
      .then((res) => {
        setCompras(res.data);
        setMensagemSucesso('Relatório filtrado com sucesso!');
      })
      .catch((error) => {
        console.error('Erro ao aplicar filtros de compras:', error);
        setMensagemErro('Erro ao aplicar os filtros.');
      });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(compras);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    XLSX.writeFile(wb, 'relatorio_compras.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['ID Compra', 'Cliente', 'Produto', 'Quantidade', 'Valor Total']],
      body: compras.map(compra => [
        compra.id,
        compra.cliente,
        compra.produto,
        compra.quantidade,
        `R$ ${parseFloat(compra.valorTotal).toFixed(2)}`
      ]),
    });
    doc.save('relatorio_compras.pdf');
  };

  return (
    <Box sx={{ backgroundColor: '#121B2D', padding: 4, borderRadius: 2 }}>
      <Typography variant="h4" color="white" align="center" gutterBottom>
        Relatório de Compras
      </Typography>

      {/* Mensagens de sucesso ou erro */}
      {mensagemErro && <Alert severity="error">{mensagemErro}</Alert>}
      {mensagemSucesso && <Alert severity="success">{mensagemSucesso}</Alert>}

      <Paper sx={{ padding: 3, backgroundColor: '#1E2A47', mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Data Inicial"
              type="date"
              name="dataInicial"
              value={filtro.dataInicial}
              onChange={handleChange}
              sx={{ backgroundColor: '#fff' }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Data Final"
              type="date"
              name="dataFinal"
              value={filtro.dataFinal}
              onChange={handleChange}
              sx={{ backgroundColor: '#fff' }}
              InputLabelProps={{ shrink: true }}
            />

            {/* Cliente Select */}
            <FormControl sx={{ backgroundColor: '#fff' }}>
              <InputLabel id="cliente-label">Cliente</InputLabel>
              <Select
                labelId="cliente-label"
                name="cliente"
                value={filtro.cliente}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="">Selecione um Cliente</MenuItem>
                {clientes.map((cliente) => (
                  <MenuItem key={cliente.id} value={cliente.id}>{cliente.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Produto Select */}
            <FormControl sx={{ backgroundColor: '#fff' }}>
              <InputLabel id="produto-label">Produto</InputLabel>
              <Select
                labelId="produto-label"
                name="produto"
                value={filtro.produto}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="">Selecione um Produto</MenuItem>
                {produtos.map((produto) => (
                  <MenuItem key={produto.id} value={produto.id}>{produto.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Tipo de Relatório Select */}
            <FormControl sx={{ backgroundColor: '#fff' }}>
              <InputLabel id="tipoRelatorio-label">Tipo de Relatório</InputLabel>
              <Select
                labelId="tipoRelatorio-label"
                name="tipoRelatorio"
                value={filtro.tipoRelatorio}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="">Selecione um Tipo de Relatório</MenuItem>
                <MenuItem value="vendas">Relatório de Vendas</MenuItem>
                <MenuItem value="compras">Relatório de Compras</MenuItem>
              </Select>
            </FormControl>

            <Button type="submit" variant="contained" sx={{ backgroundColor: '#00A9E0', color: '#fff' }}>
              Filtrar Relatório
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Exibir a tabela de compras apenas se o filtro for aplicado */}
      {compras.length > 0 && (
        <>
          <Typography variant="h5" color="white" align="center" gutterBottom>
            Lista de Compras
          </Typography>

          <TableContainer component={Paper} sx={{ backgroundColor: '#1E2A47' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#00A9E0' }}>ID Compra</TableCell>
                  <TableCell sx={{ color: '#00A9E0' }}>Cliente</TableCell>
                  <TableCell sx={{ color: '#00A9E0' }}>Produto</TableCell>
                  <TableCell sx={{ color: '#00A9E0' }}>Quantidade</TableCell>
                  <TableCell sx={{ color: '#00A9E0' }}>Valor Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {compras.map((compra) => (
                  <TableRow key={compra.id}>
                    <TableCell sx={{ color: '#A1B2C1' }}>{compra.id}</TableCell>
                    <TableCell sx={{ color: '#A1B2C1' }}>{compra.cliente}</TableCell>
                    <TableCell sx={{ color: '#A1B2C1' }}>{compra.produto}</TableCell>
                    <TableCell sx={{ color: '#A1B2C1' }}>{compra.quantidade}</TableCell>
                    <TableCell sx={{ color: '#A1B2C1' }}>
                      R$ {parseFloat(compra.valorTotal).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Botões de exportação */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
            <Button variant="contained" sx={{ backgroundColor: '#4CAF50', color: '#fff' }} onClick={exportToExcel}>
              Exportar para Excel
            </Button>
            <Button variant="contained" sx={{ backgroundColor: '#D32F2F', color: '#fff' }} onClick={exportToPDF}>
              Exportar para PDF
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Relatorio;