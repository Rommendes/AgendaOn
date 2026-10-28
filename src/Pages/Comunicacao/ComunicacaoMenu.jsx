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
              className="grid w-full grid-cols-[44px_minmax(0,1fr)] items-center gap-x-3 rounded-xl bg-primary px-4 py-4 text-white shadow"
            >
              <BellRing
                size={32}
                className="shrink-0 text-secondary"
                aria-hidden="true"
              />

              <div className="min-w-0">
                <h2 className="text-xl font-medium leading-tight">
                  Lembretes de agendamento
                </h2>

                <p className="mt-1 text-sm leading-[18px] text-white/90 sm:text-base">
                  Envie lembretes de agendamentos para clientes.
                </p>
              </div>
            </Link>

            <Link
              to="/cobrancas"
              className="grid w-full grid-cols-[44px_minmax(0,1fr)] items-center gap-x-3 rounded-xl bg-primary px-4 py-4 text-white shadow"
            >
              <CircleAlert
                className="shrink-0 text-secondary"
                aria-hidden="true"
                size={32}
              />

              <div className="min-w-0">
                <h2 className="text-xl font-medium leading-tight">
                  Pendências
                </h2>

                <p className="mt-1 text-sm leading-[18px] text-white/90 sm:text-base">
                  Envie cobranças para clientes com pagamentos pendentes.
                </p>
              </div>
            </Link>

            <Link
              to="/historico-lembretes"
              className="grid w-full grid-cols-[44px_minmax(0,1fr)] items-center gap-x-3 rounded-xl bg-primary px-4 py-4 text-white shadow"
            >
              <Hourglass
                size={32}
                className="shrink-0 text-secondary"
                aria-hidden="true"
              />

              <div className="min-w-0">
                <h2 className="text-xl font-medium leading-tight">
                  Histórico de lembretes
                </h2>

                <p className="mt-1 text-sm leading-[18px] text-white/90 sm:text-base">
                  Registro de lembretes enviados, incluindo status e horários de
                  envio.
                </p>
              </div>
            </Link>

            <Link
              to="/mensagens-avisos"
              className="grid w-full grid-cols-[44px_minmax(0,1fr)] items-center gap-x-3 rounded-xl bg-primary px-4 py-4 text-white shadow"
            >
              <Bell
                className="shrink-0 text-secondary"
                size={32}
                aria-hidden="true"
              />

              <div className="min-w-0">
                <h2 className="text-xl font-medium leading-tight">
                  Avisos e mensagens
                </h2>

                <p className="mt-1 text-sm leading-[18px] text-white/90 sm:text-base">
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
