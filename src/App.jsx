import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import 'material-icons/iconfont/material-icons.css';
import Login from './Pages/Login/Login.jsx';
import Home from './Pages/Home';
import CadastrarCliente from './Pages/Clientes/CadastrarCliente.jsx';
import ListaClientes from './Pages/Clientes/ListaClientes.jsx';
import EditarCliente from './Componentes/EditarCliente/editarCliente.jsx';
import Agenda from './Pages/Agenda/Agenda.jsx';
import BuscaCliente from './Pages/Clientes/buscaCliente.jsx';
//import HistoricoSemanal from './Pages/HistoricoSemanal.jsx';
import EnviarCobrancasPendentes from './Pages/Comunicacao/EnviarCobrancasPendentes.jsx';
import LembreteAgendamentos from './Pages/Comunicacao/LembreteAgendamentos.jsx';
import AgendaSemanal from './Pages/Agenda/AgendaSemanal.jsx';
import ResetSenha from './Pages/Login/ResetSenha.jsx';
import ProtectedRoute from './Componentes/ProtectedRoute.jsx';
import HistoricoLembretes from './Pages/Comunicacao/HistoricoLembretes.jsx';
import Financeiro from './Pages/Financeiro/Financeiro.jsx';
import ExtratoFinanceiro from './Pages/Financeiro/ExtratoFinanceiro.jsx';
import FinanceiroMenu from './Pages/Financeiro/FinanceiroMenu.jsx';
import Pagamentos from './Pages/Financeiro/Pagamentos.jsx';
function App() {
  const [setIsAuthenticated] = useState(false);
  return (
    <div>
      <Routes>
        {/* pública */}
        <Route path="/" element={<Login />} />
        <Route path="/reset-senha" element={<ResetSenha />} />

        {/* privadas */}
        <Route element={<ProtectedRoute />}>
          {/*<Route path="/"element= { <Login setIsAuthenticated={setIsAuthenticated}/> }/>*/}
          <Route path="/busca-cliente" element={<BuscaCliente />} />
          <Route path="/home" element={<Home />} />
          <Route path="/cadastrar-cliente" element={<CadastrarCliente />} />
          <Route path="/lista-clientes" element={<ListaClientes />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/financeiro-menu" element={<FinanceiroMenu />} />
          {/* <Route path="/historico-semanal" element={<HistoricoSemanal />} /> */}
          <Route path="/pagamentos" element={<Pagamentos />} />

          <Route path="/cobrancas" element={<EnviarCobrancasPendentes />} />
          <Route path="/lembretes" element={<LembreteAgendamentos />} />
          <Route path="/agenda-semanal" element={<AgendaSemanal />} />
          <Route path="/editar-cliente/:id" element={<EditarCliente />} />
          <Route path="/historico-lembretes" element={<HistoricoLembretes />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
