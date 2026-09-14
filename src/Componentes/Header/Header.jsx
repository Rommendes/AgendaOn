import { Menu, X, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

import BotaoSair from '../BotaoSair';
import { useState } from 'react';

const Header = ({ title = 'Agenda de Atendimentos', actionButton = null }) => {
  const [menuAberto, setMenuAberto] = useState(false);
  return (
    <header className="relative mb-1 bg-white shadow-sm">
      {/* Faixa superior */}
      <div className="bg-primary px-4 py-2 text-center">
        <p className="text-lg font-semibold text-white">AgendaOn</p>
      </div>

      {/* Área principal do cabeçalho */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-4">
        <Link
          to="/home"
          className="justify-self-start"
          aria-label="Ir para a página inicial"
        >
          <img
            src="/agendaon-icon.png"
            alt="AgendaOn"
            className="h-10 w-10 object-contain"
          />
        </Link>

        <h1 className="px-2 text-center text-lg font-semibold text-primary sm:text-xl">
          {title}
        </h1>

        <div className="flex items-center gap-2 justify-self-end">
          {actionButton}
          <button
            type="button"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuAberto}
            className="flex h-10 w-10 items-center justify-center rounded text-secondary transition hover:bg-orange-50"
          >
            {menuAberto ? <X size={30} /> : <Menu size={30} />}
          </button>
        </div>
      </div>
      {menuAberto && (
        <nav className="absolute right-4 top-full z-50 w-64 overflow-hidden rounded-b-lg border border-gray-200 bg-white shadow-lg">
          <Link
            to="/home"
            onClick={() => setMenuAberto(false)}
            className="block border-b border-cinza/20 px-5 py-3 text-secondary transition hover:bg-secondary/10"
          >
            <Home size={20} className="mr-2 inline-block" />
            Home
          </Link>

          <Link
            to="/agendamentos-menu"
            onClick={() => setMenuAberto(false)}
            className="block border-b border-cinza/10 px-5 py-3 text-primary transition hover:bg-alternativo/10"
          >
            Agendamentos
          </Link>

          <Link
            to="/clientes-menu"
            onClick={() => setMenuAberto(false)}
            className="block border-b border-cinza/10 px-5 py-3 text-primary transition hover:bg-alternativo/10"
          >
            Clientes
          </Link>

          <Link
            to="/comunicacao-menu"
            onClick={() => setMenuAberto(false)}
            className="block border-b border-cinza/10 px-5 py-3 text-primary transition hover:bg-alternativo/10"
          >
            Comunicação
          </Link>

          <Link
            to="/financeiro-menu"
            onClick={() => setMenuAberto(false)}
            className="block border-b border-cinza/20 px-5 py-3 text-primary transition hover:bg-alternativo/10"
          >
            Financeiro
          </Link>

          <BotaoSair modoMenu />
        </nav>
      )}
      {/* Linha inferior */}
      <div className="h-1 bg-secondary" />
    </header>
  );
};

export default Header;
