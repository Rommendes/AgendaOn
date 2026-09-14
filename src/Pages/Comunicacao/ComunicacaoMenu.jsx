import { Link } from 'react-router-dom';
import Header from '../../Componentes/Header/Header';
import {
  ChartNoAxesCombined,
  CreditCard,
  ReceiptText,
  WalletCards,
  BellRing,
  CircleDotDashed,
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
              <BellRing className="shrink-0 text-secondary" size={32} />

              <div>
                <h1>Lembretes</h1>

                <p>Envie lembretes de agendamentos para clientes.</p>
              </div>
            </Link>
            <Link
              to="/cobrancas"
              className="botao-menu w-full transition hover:scale-[1.02]"
            >
              <CircleAlert className="text-secondary" size={32} />

              <div>
                <h1>Pendências</h1>

                <p>Envie cobranças para clientes com pagamentos pendentes.</p>
              </div>
            </Link>

            <Link
              to="/historico-lembretes"
              className="botao-menu w-full transition hover:scale-[1.02]"
            >
              <Hourglass className="text-secondary" shrink-0 size={32} />

              <div>
                <h1>Histórico de lembretes</h1>

                <p>
                  Registro de lembretes enviados, incluindo status e horários de
                  envio.
                </p>
              </div>
            </Link>

            <Link
              to="/avisos"
              className="botao-menu w-full transition hover:scale-[1.02]"
            >
              <Bell className="shrink-0 text-secondary" size={32} />

              <div>
                <h1>Avisos</h1>

                <p>
                  Envie avisos para clientes sobre eventos ou informações
                  importantes.
                </p>
              </div>
            </Link>
            <Link
              to="/mensagem"
              className="botao-menu w-full transition hover:scale-[1.02]"
            >
              <MessageSquareText
                className="shrink-0 text-secondary"
                size={32}
              />

              <div>
                <h1>Mensagens</h1>

                <p>
                  Envie mensagens personalizadas , promoções, novidades ou
                  atualizações de serviços.
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
