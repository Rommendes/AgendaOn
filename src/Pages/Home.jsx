import { Link } from 'react-router-dom';

import logoAgendaOn from '../assets/logoAgendaOn.png';
import BotaoSair from '../Componentes/BotaoSair/index.jsx';
import { MessagesSquare, ReceiptText, UserRoundArrowLeft } from 'lucide-react';

export default function Home() {
  return (
    <div className="main">
      <div className="main-container">
        {/* LOGO */}
        <div className="mb-8 text-center">
          <img
            src={logoAgendaOn}
            alt="AgendaOn"
            className="mx-auto h-auto w-64 p-2 px-4"
          />

          <p className="mt-2 text-lg text-primary">
            mais que agenda, sua parceira de confiança.
          </p>
        </div>
        {/* ATENDIMENTOS */}

        <div className="mb-6 flex flex-col gap-4">
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
          </Link>
        </div>
        <div className="mt-3 flex justify-end pt-4">
          <BotaoSair />
        </div>
      </div>
    </div>
  );
}
