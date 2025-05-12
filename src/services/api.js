import axios from 'axios';

// Instância do axios com URL base
const API_URL = axios.create({
  baseURL: 'http://127.0.0.1:5000',
});

// === CLIENTES ===
export const listarClientes = async () => {
  try {
    const response = await API_URL.get('/clientes');
    return response.data;
  } catch (error) {
    console.error('Erro ao listar clientes', error);
    throw error;
  }
};

export const criarCliente = async (cliente) => {
  try {
    const response = await API_URL.post('/clientes', cliente);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar cliente', error);
    throw error;
  }
};

export const atualizarCliente = async (id, cliente) => {
  try {
    const response = await API_URL.put(`/clientes/${id}`, cliente);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar cliente', error);
    throw error;
  }
};

export const excluirCliente = async (id) => {
  try {
    const response = await API_URL.delete(`/clientes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao excluir cliente', error);
    throw error;
  }
};

// === PRODUTOS ===
export const listarProdutos = async () => {
  try {
    const response = await API_URL.get('/produtos');
    return response.data;
  } catch (error) {
    console.error('Erro ao listar produtos', error);
    throw error;
  }
};

export const criarProduto = async (produto) => {
  try {
    const response = await API_URL.post('/produtos', produto);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar produto', error);
    throw error;
  }
};

export const atualizarProduto = async (id, produto) => {
  try {
    const response = await API_URL.put(`/produtos/${id}`, produto);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar produto', error);
    throw error;
  }
};

export const excluirProduto = async (id) => {
  try {
    const response = await API_URL.delete(`/produtos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao excluir produto', error);
    throw error;
  }
};

// === COMPRAS ===
export const listarCompras = async () => {
  try {
    const response = await API_URL.get('/compras');
    return response.data;
  } catch (error) {
    console.error('Erro ao listar compras', error);
    throw error;
  }
};

// Atualiza o processo de compra, registrando todos os produtos de uma vez e baixando o estoque
export const criarCompra = async (compra) => {
  try {
    const response = await API_URL.post('/compras', compra);

    // Baixar o estoque após a compra
    for (let item of compra.produtos) {
      const produtoId = item.produto_id;
      const quantidadeComprada = item.quantidade;
      await API_URL.put(`/produtos/${produtoId}/estoque`, { quantidade: quantidadeComprada });
    }

    return response.data;
  } catch (error) {
    console.error('Erro ao criar compra', error);
    throw error;
  }
};

// === RELATÓRIOS ===
// Vendas por produto (total de compras por produto)
export const vendasPorProduto = async () => {
  try {
    const response = await API_URL.get('/relatorios/vendas_por_produto');
    return response.data;
  } catch (error) {
    console.error('Erro ao listar vendas por produto', error);
    throw error;
  }
};

// Vendas por cliente (total de compras por cliente)
export const vendasPorCliente = async () => {
  try {
    const response = await API_URL.get('/relatorios/vendas_por_cliente');
    return response.data;
  } catch (error) {
    console.error('Erro ao listar vendas por cliente', error);
    throw error;
  }
};

// === CONTADORES ===
export const contarClientes = async () => {
  const response = await API_URL.get('/clientes/count');
  return response.data;
};

export const contarProdutos = async () => {
  const response = await API_URL.get('/produtos/count');
  return response.data;
};

export const contarCompras = async () => {
  const response = await API_URL.get('/compras/count');
  return response.data;
};

// Faturamento total
export const faturamentoTotal = async () => {
  const response = await API_URL.get(`/compras/faturamento`);
  return response.data;
};

export default API_URL;