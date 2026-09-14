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
import AgendamentosMenu from './Pages/Agenda/AgendaMenu.jsx';
import AgendaSemanal from './Pages/Agenda/AgendaSemanal.jsx';
import ResetSenha from './Pages/Login/ResetSenha.jsx';
import ProtectedRoute from './Componentes/ProtectedRoute.jsx';

import ClientesMenu from './Pages/Clientes/ClientesMenu.jsx';

{
  /*Comunicação */
}
import ComunicacaoMenu from './Pages/Comunicacao/ComunicacaoMenu.jsx';
import HistoricoLembretes from './Pages/Comunicacao/HistoricoLembretes.jsx';
import EnviarCobrancasPendentes from './Pages/Comunicacao/EnviarCobrancasPendentes.jsx';
import LembreteAgendamentos from './Pages/Comunicacao/LembreteAgendamentos.jsx';
import Mensagem from './Pages/Comunicacao/Mensagens.jsx';
import Avisos from './Pages/Comunicacao/Avisos.jsx';

{
  /*Financeiro */
}
import FinanceiroMenu from './Pages/Financeiro/FinanceiroMenu.jsx';
import Pagamentos from './Pages/Financeiro/Pagamentos.jsx';
import ResumoFinanceiro from './Pages/Financeiro/ResumoFinanceiro.jsx';
import ExtratoFinanceiro from './Pages/Financeiro/ExtratoFinanceiro.jsx';

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
          <Route path="/home" element={<Home />} />
          <Route path="/agendamentos-menu" element={<AgendamentosMenu />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/agenda-semanal" element={<AgendaSemanal />} />

          <Route path="/cadastrar-cliente" element={<CadastrarCliente />} />
          <Route path="/clientes-menu" element={<ClientesMenu />} />
          <Route path="/busca-cliente" element={<BuscaCliente />} />
          <Route path="/lista-clientes" element={<ListaClientes />} />

          <Route path="/financeiro-menu" element={<FinanceiroMenu />} />
          {/* <Route path="/historico-semanal" element={<HistoricoSemanal />} /> */}

          <Route path="/comunicacao-menu" element={<ComunicacaoMenu />} />
          <Route path="/historico-lembretes" element={<HistoricoLembretes />} />
          <Route path="/cobrancas" element={<EnviarCobrancasPendentes />} />
          <Route path="/lembretes" element={<LembreteAgendamentos />} />
          <Route path="/mensagem" element={<Mensagem />} />
          <Route path="/avisos" element={<Avisos />} />

          <Route path="/pagamentos" element={<Pagamentos />} />
          <Route path="/extrato-financeiro" element={<ExtratoFinanceiro />} />
          <Route path="/resumo-financeiro" element={<ResumoFinanceiro />} />

          <Route path="/editar-cliente/:id" element={<EditarCliente />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
