import { Link } from 'react-router-dom';
import Header from '../../Componentes/Header/Header';
import {
  BellRing,
  Hourglass,
  CircleAlert,
  Bell,
  MessageSquareText,
} from 'lucide-react';

function ComunicacaoMenu() {
  return (
    <>
      <Header title="Comunicação" />
      <div className="main">
        <div className="main-container">
          <div className="flex flex-col gap-4">
            <Link
              to="/lembretes"
              className="botao-menu w-full transition hover:scale-[1.02]"
            >
              <BellRing
                size={32}
                className="shrink-0 text-secondary"
                aria-hidden="true"
              />

              <div className="min-w-0">
                <h1>Lembretes de agendamento</h1>

                <p className="text-sm leading-tight">
                  Envie lembretes de agendamentos para clientes.
                </p>
              </div>
            </Link>

            <Link
              to="/cobrancas"
              className="botao-menu w-full shadow-lg transition hover:scale-[1.02]"
            >
              <CircleAlert
                className="shrink-0 text-secondary"
                aria-hidden="true"
                size={32}
              />

              <div className="min-w-0">
                <h1>Pendências</h1>

                <p className="text-sm leading-tight">
                  Envie cobranças para clientes com pagamentos pendentes.
                </p>
              </div>
            </Link>

            <Link
              to="/historico-lembretes"
              className="botao-menu w-full transition hover:scale-[1.02]"
            >
              <Hourglass
                size={32}
                className="shrink-0 text-secondary"
                aria-hidden="true"
              />

              <div className="min-w-0">
                <h1 className="leading-tight">Histórico de lembretes</h1>

                <p className="text-sm leading-tight">
                  Registro de lembretes enviados, incluindo status e horários de
                  envio.
                </p>
              </div>
            </Link>

            <Link
              to="/mensagens-avisos"
              className="botao-menu w-full transition hover:scale-[1.02]"
            >
              <MessageSquareText
                className="shrink-0 text-secondary"
                size={32}
                aria-hidden="true"
              />

              <div className="min-w-0">
                <h1 className="text-xl font-medium leading-tight">
                  Avisos e mensagens
                </h1>

                <p className="text-sm leading-tight">
                  Envie avisos para clientes sobre eventos ou informações
                  importantes.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
export default ComunicacaoMenu;
