import { Link } from 'react-router-dom';
import Header from '../../Componentes/Header/Header';
import {
  ChartNoAxesCombined,
  CreditCard,
  ReceiptText,
  WalletCards,
  CalendarRange,
} from 'lucide-react';

function AgendamentosMenu() {
  return (
    <>
      <Header title="Agendamentos" />
      <div className="main">
        <div className="main-container">
          <div className="flex flex-col gap-4">
            <Link
              to="/agenda"
              className="botao-menu w-full shadow-lg transition hover:scale-[1.02]"
            >
              <CalendarRange className="text-4xl text-secondary" size={32} />

              <div>
                <h1>Agenda</h1>
                <p>Gerencie sua agenda e os atendimentos da semana.</p>
              </div>
            </Link>

            <Link
              to="/agenda-semanal"
              className="botao-menu w-full transition hover:scale-[1.02]"
            >
              <CreditCard className="text-secondary" size={32} />

              <div>
                <h1>Agenda Semanal</h1>

                <p>
                  Consulte seus atendimentos desta semana e envie lembretes.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default AgendamentosMenu;
