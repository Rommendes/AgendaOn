import { createBrowserRouter } from "react-router-dom";
import Login from "./Pages/Login.jsx";
import Home from "./Pages/Home.jsx";
import CadastrarCliente from "./Pages/CadastrarCliente.jsx";
import ListarClientes from "./Pages/ListarClientes.jsx";
import EditarCliente from "@/Componentes/EditarCliente/editarCliente.jsx";
import Agenda from "./Pages/Agenda.jsx";
import BuscaCliente from "./Pages/buscaCliente.jsx";
import HistoricoSemanal from "./Pages/HistoricoSemanal.jsx";
import EnviarCobrancasPendentes from "./Pages/EnviarCobrancasPendentes.jsx";
import LembreteAgendamentos from "./Pages/LembreteAgendamentos.jsx";
import AgendaSemanal from "./Pages/AgendaSemanal.jsx";
import PrivateRoute from "@/Routes/PrivateRoute.jsx";

export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  {
    element: <PrivateRoute />,
    children: [
      { path: "/home", element: <Home /> },
      { path: "/busca-cliente", element: <BuscaCliente /> },
      { path: "/cadastrar-cliente", element: <CadastrarCliente /> },
      { path: "/lista-clientes", element: <ListarClientes /> },
      { path: "/editar-cliente", element: <EditarCliente /> },
      { path: "/agenda", element: <Agenda /> },
      { path: "/agenda-semanal", element: <AgendaSemanal /> },
      { path: "/historico-semanal", element: <HistoricoSemanal /> },
      { path: "/cobrancas", element: <EnviarCobrancasPendentes /> },
      { path: "/lembretes", element: <LembreteAgendamentos /> },
    ],
  },
]);
