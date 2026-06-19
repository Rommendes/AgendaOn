import { Link } from 'react-router-dom';
import { useState } from 'react';
//import minhaImagem from "../assets/LogoCarmemAgenda.png"
import BotaoSair from '../Componentes/BotaoSair/index.jsx';
import {
  CalendarCog,
  Minus,
  Sparkles,
  Search,
  CalendarRange,
  CalendarDays,
  ReceiptText,
  UserPlus,
  Users,
  BellRing,
  History,
  WalletCards,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [mostrarSubmenu, setMostrarSubmenu] = useState(false);
  const navigate = useNavigate();

  const toggleSubmenu = () => {
    setMostrarSubmenu(!mostrarSubmenu);
  };

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-6">
      <div className="mx-auto max-w-2xl">
        {/* LOGO */}
        <div className="mb-8 text-center">
          <h1 className="flex items-center justify-center gap-2 text-xl font-bold text-primary">
            <Sparkles className="text-primary" />
            Agenda<span className="text-secondary">On</span>
            <Sparkles className="text-primary" />
          </h1>

          <p className="text-sm text-primary">
            mais que agenda, sua parceira de confiança.
          </p>
        </div>

        {/* ATENDIMENTOS */}
        <h2 className="mb-2 text-sm font-semibold text-gray-500">
          Atendimentos
        </h2>

        <div className="mb-6 flex flex-col gap-4">
          <Link
            to="/agenda"
            className="botao-menu w-full shadow-lg transition hover:scale-[1.02]"
          >
            <CalendarRange className="text-4xl text-secondary" size={32} />

            <div>
              <h2 className="text-lg font-bold">Agenda</h2>
              <p className="text-sm">Gerencie horários, serviços e valores</p>
            </div>
          </Link>

          <Link
            to="/agenda-semanal"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <ReceiptText className="text-4xl text-secondary" size={32} />

            <div>
              <h2 className="text-lg font-bold">Semana Atual</h2>
              <p className="text-sm">
                Visualize seus atendimentos desta semana e envie lembretes.
              </p>
            </div>
          </Link>

          <Link
            to="/historico-semanal"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <History
              className="material-icons text-4xl text-secondary"
              size={32}
            />

            <div>
              <h2 className="text-lg font-bold">Histórico Financeiro</h2>
              <p className="text-sm">
                Consulte atendimentos concluídos e valores recebidos
              </p>
            </div>
          </Link>
        </div>

        {/* CLIENTES */}
        <h2 className="mb-2 text-sm font-semibold text-gray-500">Clientes</h2>

        <div className="mb-6 flex flex-col gap-4">
          <Link
            to="/busca-cliente"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <Search className="text-4xl text-secondary" size={32} />

            <div>
              <h2 className="text-lg font-bold">Busca cliente</h2>
              <p className="text-sm">
                Pesquise o histórico e fianceiro do cliente
              </p>
            </div>
          </Link>

          <Link
            to="/cadastrar-cliente"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <UserPlus
              className="material-icons text-4xl text-secondary"
              size={35}
            />

            <div>
              <h2 className="text-lg font-bold">Cadastro</h2>
              <p className="text-sm">Cadastre novos clientes</p>
            </div>
          </Link>

          <Link
            to="/lista-clientes"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <Users
              className="material-icons text-4xl text-secondary"
              size={35}
            />

            <div>
              <h2 className="text-lg font-bold">Lista de Clientes</h2>
              <p className="text-sm">Veja todos os clientes cadastrados</p>
            </div>
          </Link>
        </div>

        {/* COMUNICAÇÃO */}
        <h2 className="mb-2 text-sm font-semibold text-gray-500">
          Comunicação
        </h2>

        <div className="mb-6 flex flex-col gap-4">
          <Link
            to="/historico-lembretes"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <BellRing
              size={35}
              className="material-icons text-4xl text-secondary"
            />

            <div>
              <h2 className="text-lg font-bold">Histórico de lembretes</h2>
              <p className="text-sm">
                Visualize lembretes mensagens aos clientes
              </p>
            </div>
          </Link>
        </div>

        {/* FINANCEIRO */}
        <h2 className="mb-2 text-sm font-semibold text-gray-500">Financeiro</h2>

        <div className="flex flex-col gap-4">
          <Link
            to="/cobrancas"
            className="botao-menu w-full shadow-lg transition hover:scale-[1.02]"
          >
            <WalletCards
              className="material-icons text-4xl text-secondary"
              size={35}
            />

            <div>
              <h2 className="text-lg font-bold">Pendências</h2>
              <p className="text-sm">
                Envie cobranças para clientes com débito
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
