import React, { useEffect, useState } from 'react';
import { vendasPorCliente, vendasPorProduto, contarClientes, contarProdutos, contarCompras } from '../services/api';

const Relatorio = () => {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [dados, setDados] = useState({
    total_clientes: 0,
    total_produtos: 0,
    total_compras: 0,
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [clientesData, produtosData, totalClientes, totalProdutos, totalCompras] = await Promise.all([
          vendasPorCliente(),
          vendasPorProduto(),
          contarClientes(),
          contarProdutos(),
          contarCompras(),
        ]);

        setClientes(clientesData);
        setProdutos(produtosData);
        setDados({
          total_clientes: totalClientes.total,
          total_produtos: totalProdutos.total,
          total_compras: totalCompras.total,
        });
      } catch (error) {
        console.error('Erro ao carregar dados dos relatórios:', error);
      }
    };

    carregarDados();
  }, []);

  return (
    <div style={{ backgroundColor: '#0e1a2b', color: 'white', padding: '2rem', borderRadius: '10px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Relatórios Gerais</h2>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ backgroundColor: '#1e2a3c', padding: '1rem', borderRadius: '10px', minWidth: '150px', textAlign: 'center' }}>
          <h3>Clientes</h3>
          <p>{dados.total_clientes}</p>
        </div>
        <div style={{ backgroundColor: '#1e2a3c', padding: '1rem', borderRadius: '10px', minWidth: '150px', textAlign: 'center' }}>
          <h3>Produtos</h3>
          <p>{dados.total_produtos}</p>
        </div>
        <div style={{ backgroundColor: '#1e2a3c', padding: '1rem', borderRadius: '10px', minWidth: '150px', textAlign: 'center' }}>
          <h3>Compras</h3>
          <p>{dados.total_compras}</p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Vendas por Cliente</h3>
        <table style={{ width: '100%', backgroundColor: '#1e2a3c', color: 'white', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid white', padding: '0.5rem' }}>Cliente</th>
              <th style={{ borderBottom: '1px solid white', padding: '0.5rem' }}>Total Compras</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente, index) => (
              <tr key={index}>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{cliente.nome}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{cliente.total_compras}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem' }}>Vendas por Produto</h3>
        <table style={{ width: '100%', backgroundColor: '#1e2a3c', color: 'white', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid white', padding: '0.5rem' }}>Produto</th>
              <th style={{ borderBottom: '1px solid white', padding: '0.5rem' }}>Quantidade Vendida</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto, index) => (
              <tr key={index}>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{produto.nome}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{produto.total_vendido}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Relatorio;
