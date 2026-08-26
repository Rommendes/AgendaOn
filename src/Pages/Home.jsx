import { Link } from 'react-router-dom';
import { useState } from 'react';
import logoAgendaOn from '../assets/logoAgendaOn.png';
import BotaoSair from '../Componentes/BotaoSair/index.jsx';
import {
  MessagesSquare,
  CalendarRange,
  ReceiptText,
  UserRoundArrowLeft,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [mostrarSubmenu, setMostrarSubmenu] = useState(false);
  const navigate = useNavigate();

  const toggleSubmenu = () => {
    setMostrarSubmenu(!mostrarSubmenu);
  };

  return (
    <div className="main">
      <div className="main-container">
        {/* LOGO */}
        <div className="mb-8 text-center">
          <img
            src={logoAgendaOn}
            alt="AgendaOn"
            className="mx-auto h-auto w-64"
          />

          <p className="text-primary">
            mais que agenda, sua parceira de confiança.
          </p>
        </div>
        {/* ATENDIMENTOS */}

        <div className="mb-6 flex flex-col gap-4">
          {/* <Link
            to="/agenda"
            className="botao-menu w-full shadow-lg transition hover:scale-[1.02]"
          >
            <CalendarRange className="text-4xl text-secondary" size={32} />

            <div>
              <h1>Agenda</h1>
              <p>Gerencie sua agenda e os atendimentos da semana.</p>
            </div>
          </Link> */}

          <Link
            to="/agendamentos-menu"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <ReceiptText className="text-4xl text-secondary" size={32} />

            <div>
              <h1>Agendamentos</h1>
              <p>Gerencie sua agenda e os atendimentos da semana.</p>
            </div>
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-4">
          <Link
            to="/clientes-menu"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <UserRoundArrowLeft className="text-4xl text-secondary" size={32} />

            <div>
              <h1>Clientes</h1>
              <p>Cadastre, consulte e acompanhe seus clientes.</p>
            </div>
          </Link>
        </div>
        {/* COMUNICAÇÃO */}

        <div className="mb-6 flex flex-col gap-4">
          <Link
            to="/comunicacao-menu"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <MessagesSquare size={35} className="text-secondary" />

            <div>
              <h1>Comunicação</h1>

              <p>Envie lembretes, cobranças e mensagens aos clientes.</p>
            </div>
          </Link>
        </div>
        {/* FINANCEIRO */}

        <div className="flex flex-col gap-4">
          <Link
            to="/financeiro-menu"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <ReceiptText className="text-secondary" size={32} />
            <div>
              <h1>Financeiro</h1>
              <p>Gerencie pagamentos, pendẽncias e extratos</p>
            </div>
            {/* <div>
              <h2 className="text-lg font-medium text-white">Financeiro</h2>
            </div> */}
          </Link>
          {/* 
          <Link
            to="/extrato-financeiro"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <ReceiptText className="text-secondary" size={32} />

            <div>
              <h2 className="text-lg font-bold">Extrato Financeiro</h2>

              <p className="text-sm">
                Consulte pagamentos por mês, cliente e forma de pagamento
              </p>
            </div>
          </Link> */}

          {/* <Link
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
          </Link> */}
        </div>
      </div>
    </div>
  );
}
