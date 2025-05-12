import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Home = () => {

  const [dadosGrafico, setDadosGrafico] = useState({ clientes: 0, produtos: 0, compras: [] });

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const resClientes = await fetch("http://localhost:5000/clientes");
        const clientes = await resClientes.json();

        const resProdutos = await fetch("http://localhost:5000/produtos");
        const produtos = await resProdutos.json();

        const resCompras = await fetch("http://localhost:5000/compras");
        const compras = await resCompras.json();

        setDadosGrafico({ clientes: clientes.length, produtos: produtos.length, compras });
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    };
    fetchDados();
  }, []);

  const barData = {
    labels: dadosGrafico.compras.map((compra, index) => `Compra ${index + 1}`),
    datasets: [
      {
        label: "Valor das Compras",
        data: dadosGrafico.compras.map((c) => c.total || 0),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ["Clientes", "Produtos"],
    datasets: [
      {
        data: [dadosGrafico.clientes, dadosGrafico.produtos],
        backgroundColor: ["#36A2EB", "#4BC0C0"],
        hoverBackgroundColor: ["#36A2EB", "#4BC0C0"],
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
        Seja bem-vindo a sua central de controle comercial
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">Distribuição de Registros</h2>
          <div style={{width: '250px', height: '250px', display: 'flex', justifyContent: 'center'}}>
            <Pie data={pieData} width={250} height={250} />
          </div>
        </div>
        <br /><br />

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">Valores de Compras</h2>
          <div style={{width: '450px', height: '450px', display: 'flex', justifyContent: 'center'}}>
            <Bar data={barData} width={300} height={300}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;