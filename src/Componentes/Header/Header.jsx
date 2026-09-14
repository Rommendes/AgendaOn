import { Menu, X, Home, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

import BotaoSair from '../BotaoSair';
import { useState } from 'react';

const Header = ({ title = 'Agenda de Atendimentos', actionButton = null }) => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [submenuClientesAberto, setSubmenuClientesAberto] = useState(false);
  const [submenuAgendamentosAberto, setSubmenuAgendamentosAberto] =
    useState(false);
  const [submenuComunicacaoAberto, setSubmenuComunicacaoAberto] =
    useState(false);
  const [submenuFinanceiroAberto, setSubmenuFinanceiroAberto] = useState(false);

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
        <nav className="absolute right-4 top-full z-50 max-h-[calc(100vh-7rem)] w-64 overflow-y-auto rounded-b-lg border border-gray-200 bg-white shadow-lg">
          <Link
            to="/home"
            onClick={() => setMenuAberto(false)}
            className="block border-b border-cinza/20 px-5 py-3 text-secondary transition hover:bg-secondary/10"
          >
            <Home size={20} className="mr-2 inline-block" />
            Home
          </Link>

          <div className="border-b border-gray-100">
            <div className="flex items-center">
              <Link
                to="/agendamentos-menu"
                onClick={() => setMenuAberto(false)}
                className="flex-1 px-5 py-3 text-primary transition hover:bg-blue-50"
              >
                Agendamentos
              </Link>

              <button
                type="button"
                onClick={() =>
                  setSubmenuAgendamentosAberto(!submenuAgendamentosAberto)
                }
                aria-label={
                  submenuAgendamentosAberto
                    ? 'Fechar submenu Agendamentos'
                    : 'Abrir submenu Agendamentos'
                }
                aria-expanded={submenuAgendamentosAberto}
                className="self-stretch px-4 text-secondary transition hover:bg-orange-50"
              >
                <ChevronDown
                  size={20}
                  className={`transition-transform ${
                    submenuAgendamentosAberto ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {submenuAgendamentosAberto && (
              <div className="bg-blue-50">
                <Link
                  to="/agenda"
                  onClick={() => setMenuAberto(false)}
                  className="block px-8 py-2 text-sm text-primary hover:bg-blue-100"
                >
                  Agenda
                </Link>

                <Link
                  to="/agenda-semanal"
                  onClick={() => setMenuAberto(false)}
                  className="block px-8 py-2 text-sm text-primary hover:bg-blue-100"
                >
                  Semana Atual
                </Link>
              </div>
            )}
          </div>

          <div className="border-b border-gray-100">
            <div className="flex items-center">
              <Link
                to="/clientes-menu"
                onClick={() => setMenuAberto(false)}
                className="flex-1 px-5 py-3 text-primary transition hover:bg-blue-50"
              >
                Clientes
              </Link>

              <button
                type="button"
                onClick={() => setSubmenuClientesAberto(!submenuClientesAberto)}
                aria-label={
                  submenuClientesAberto
                    ? 'Fechar submenu Clientes'
                    : 'Abrir submenu Clientes'
                }
                aria-expanded={submenuClientesAberto}
                className="self-stretch px-4 text-secondary transition hover:bg-orange-50"
              >
                <ChevronDown
                  size={20}
                  className={`transition-transform ${
                    submenuClientesAberto ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {submenuClientesAberto && (
              <div className="bg-blue-50">
                <Link
                  to="/busca-cliente"
                  onClick={() => setMenuAberto(false)}
                  className="block px-8 py-2 text-sm text-primary hover:bg-blue-100"
                >
                  Busca cliente
                </Link>

                <Link
                  to="/cadastrar-cliente"
                  onClick={() => setMenuAberto(false)}
                  className="block px-8 py-2 text-sm text-primary hover:bg-blue-100"
                >
                  Cadastro
                </Link>

                <Link
                  to="/lista-clientes"
                  onClick={() => setMenuAberto(false)}
                  className="block px-8 py-2 text-sm text-primary hover:bg-blue-100"
                >
                  Lista de Clientes
                </Link>
              </div>
            )}
          </div>

          <div className="border-b border-gray-100">
            <div className="flex items-center">
              <Link
                to="/comunicacao-menu"
                onClick={() => setMenuAberto(false)}
                className="flex-1 px-5 py-3 text-primary transition hover:bg-blue-50"
              >
                Comunicação
              </Link>

              <button
                type="button"
                onClick={() =>
                  setSubmenuComunicacaoAberto(!submenuComunicacaoAberto)
                }
                aria-label={
                  submenuComunicacaoAberto
                    ? 'Fechar submenu Comunicação'
                    : 'Abrir submenu Comunicação'
                }
                aria-expanded={submenuComunicacaoAberto}
                className="self-stretch px-4 text-secondary transition hover:bg-orange-50"
              >
                <ChevronDown
                  size={20}
                  className={`transition-transform ${
                    submenuComunicacaoAberto ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {submenuComunicacaoAberto && (
              <div className="bg-blue-50">
                <Link
                  to="/lembretes"
                  onClick={() => setMenuAberto(false)}
                  className="block px-8 py-2 text-sm text-primary hover:bg-blue-100"
                >
                  Lembretes
                </Link>

                <Link
                  to="/cobrancas"
                  onClick={() => setMenuAberto(false)}
                  className="block px-8 py-2 text-sm text-primary hover:bg-blue-100"
                >
                  Cobranças pendentes
                </Link>

                <Link
                  to="/historico-lembretes"
                  onClick={() => setMenuAberto(false)}
                  className="block px-8 py-2 text-sm text-primary hover:bg-blue-100"
                >
                  Histórico de lembretes
                </Link>

                <Link
                  to="/mensagem"
                  onClick={() => setMenuAberto(false)}
                  className="block px-8 py-2 text-sm text-primary hover:bg-blue-100"
                >
                  Mensagens
                </Link>

                <Link
                  to="/avisos"
                  onClick={() => setMenuAberto(false)}
                  className="block px-8 py-2 text-sm text-primary hover:bg-blue-100"
                >
                  Avisos
                </Link>
              </div>
            )}
          </div>
          <div className="border-b border-gray-200">
            <div className="flex items-center">
              <Link
                to="/financeiro-menu"
                onClick={() => setMenuAberto(false)}
                className="flex-1 px-5 py-3 text-primary transition hover:bg-blue-50"
              >
                Financeiro
              </Link>

              <button
                type="button"
                onClick={() =>
                  setSubmenuFinanceiroAberto(!submenuFinanceiroAberto)
                }
                aria-label={
                  submenuFinanceiroAberto
                    ? 'Fechar submenu Financeiro'
                    : 'Abrir submenu Financeiro'
                }
                aria-expanded={submenuFinanceiroAberto}
                className="self-stretch px-4 text-secondary transition hover:bg-orange-50"
              >
                <ChevronDown
                  size={20}
                  className={`transition-transform ${
                    submenuFinanceiroAberto ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {submenuFinanceiroAberto && (
              <div className="bg-blue-50">
                <Link
                  to="/pagamentos"
                  onClick={() => setMenuAberto(false)}
                  className="block px-8 py-2 text-sm text-primary hover:bg-blue-100"
                >
                  Pagamentos
                </Link>

                <Link
                  to="/extrato-financeiro"
                  onClick={() => setMenuAberto(false)}
                  className="block px-8 py-2 text-sm text-primary hover:bg-blue-100"
                >
                  Extrato Financeiro
                </Link>

                <Link
                  to="/resumo-financeiro"
                  onClick={() => setMenuAberto(false)}
                  className="block px-8 py-2 text-sm text-primary hover:bg-blue-100"
                >
                  Resumo Financeiro
                </Link>
              </div>
            )}
          </div>

          <BotaoSair modoMenu />
        </nav>
      )}
      {/* Linha inferior */}
      <div className="h-1 bg-secondary" />
    </header>
  );
};

export default Header;
