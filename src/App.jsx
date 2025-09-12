import React ,{ useState } from "react"
import {  Routes, Route} from "react-router-dom"
import 'material-icons/iconfont/material-icons.css'
import Login from './Pages/Login'
import Home from "./Pages/Home"
import CadastrarCliente from "./Pages/CadastrarCliente.jsx";
import ListaClientes from "./Pages/ListaClientes.jsx"
import EditarCliente from "./Componentes/EditarCliente/editarCliente.jsx"
import Agenda from "./Pages/Agenda.jsx"
import BuscaCliente from "./Pages/buscaCliente.jsx"
import HistoricoSemanal from "./Pages/HistoricoSemanal.jsx"
import CobrancasPendentes from "./Pages/EnviarCobrancasPendentes.jsx"
import EnviarCobrancasPendentes from "./Pages/EnviarCobrancasPendentes.jsx"
import LembreteAgendamentos from "./Pages/LembreteAgendamentos.jsx"


function App() {
  
  const [ setIsAuthenticated] = useState(false);
  return (
    

   <div>
    <Routes >
      {/* pública */}
      <Route path="/" element={<Login />} />

      {/* privadas */}
      <Route path="/"element= { <Login setIsAuthenticated={setIsAuthenticated}/> }/>
      <Route path="/busca-cliente" element={<BuscaCliente />} />
      <Route path="/home" element = { <Home/> }/>
      <Route path="/cadastrar-cliente" element= { <CadastrarCliente/> }/>
      <Route path="/lista-clientes" element={ <ListaClientes/> } />
    
      <Route path="/editar-cliente" element={ <EditarCliente/> }/>
      <Route path="/agenda" element= { <Agenda/> }/>
      <Route path="/historico-semanal" element= { <HistoricoSemanal/> }/>
      <Route path="cobrancas" element= { <CobrancasPendentes/> }/>
      <Route path="/cobrancas" element={<EnviarCobrancasPendentes />} />
      <Route path="/lembretes" element= {<LembreteAgendamentos /> } />
  
    </Routes>
    </div>
   
  )
}

export default App
