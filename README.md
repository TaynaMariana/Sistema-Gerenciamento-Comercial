# 📦 Sistema de Gerenciamento

Este é um sistema de gerenciamento em desenvolvimento, voltado para controle de clientes, produtos e compras. A aplicação fornece também relatórios e métricas em tempo real, com o objetivo de facilitar a gestão de negócios de forma moderna, eficiente e escalável.

---

## 🚧 Status do Projeto

🛠 **Em desenvolvimento**

Funcionalidades básicas implementadas:

- Cadastro, edição e exclusão de **clientes** e **produtos**
- Registro e listagem de **compras**
- Relatórios de **vendas por cliente** e **por produto**
- Contadores e **faturamento total**

🗓️ **Próximas implementações:**

- Sistema de autenticação com **usuário super-admin**
- Cadastro de usuários com **perfis e permissões**
- Telas de **login** e **gestão de usuários**
- Melhorias na **UI/UX**, como:
  - Feedback visual nas ações
  - Validações de formulários
  - Acessibilidade aprimorada

---

## ⚙️ Tecnologias Utilizadas

### 💻 Frontend

- **React 19**: Construção da interface com renderização declarativa e componentes reutilizáveis
- **React Router v7**: Gerenciamento eficiente de rotas
- **Material UI (MUI)**: Componentes prontos e responsivos com design moderno e acessível
- **Axios**: Comunicação com a API de forma simples e tipada
- **Chart.js + react-chartjs-2**: Visualização de dados em gráficos
- **jsPDF** e **xlsx**: Geração de relatórios em PDF e Excel

### ⚒️ Ferramentas de desenvolvimento

- **Vite**: Ambiente de build rápido e moderno para desenvolvimento com React
- **ESLint**: Padrão de código consistente e limpo
- **CSS Custom Properties**: Paleta de cores definida via variáveis para facilitar o suporte a temas claros/escuros

---

## 🗂 Estrutura de Pastas (simplificada)

src/
├── components/ # Header, Sidebar, Footer
├── pages/ # Clientes, Produtos, Compras, Relatórios, Home
├── services/ # Integração com a API (axios)
├── App.jsx # Definição das rotas principais
└── index.css # Estilos globais

yaml
Copiar
Editar

---

## 🧠 Decisões de Arquitetura

- **React 19** foi escolhido por sua estabilidade, performance e pelo suporte a melhorias como o novo sistema de transições e renderização assíncrona.
- **MUI (Material UI)** traz agilidade no desenvolvimento e uma interface visualmente agradável desde o início.
- A separação de responsabilidades (páginas, componentes, serviços) torna o sistema escalável e de fácil manutenção.
- O uso de variáveis CSS e modo escuro por `prefers-color-scheme` oferece melhor experiência ao usuário em diferentes contextos.

---

## 💡 Como rodar o projeto

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/sistema-gerenciamento.git

# Acessar a pasta
cd sistema-gerenciamento

# Instalar as dependências
npm install

# Rodar em modo desenvolvimento
npm run dev
💡 Certifique-se de que o backend (Flask, FastAPI, etc.) esteja rodando na porta http://127.0.0.1:5000.

🛡️ Segurança e Permissões
Na próxima fase, será implementado um sistema de autenticação, onde:

Um usuário super-admin será responsável pelo primeiro acesso e criação de novos usuários

Cada usuário terá permissões específicas para acesso às funcionalidades

Sessões serão gerenciadas com tokens JWT

📌 Contribuições Futuras
📱 Responsividade para uso em dispositivos móveis

🌐 Internacionalização (i18n)

📊 Mais relatórios customizados

🔒 Logs de auditoria e controle de acessos