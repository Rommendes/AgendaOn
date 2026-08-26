import { Link } from 'react-router-dom';
import Header from '../../Componentes/Header/Header';
import {
  ChartNoAxesCombined,
  CreditCard,
  ReceiptText,
  WalletCards,
} from 'lucide-react';

function FinanceiroMenu() {
  return (
    <main>
      <Header title="Financeiro" />

      <div className="main-container">
        <div className="flex flex-col gap-4">
          <Link
            to="/pagamentos"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <CreditCard className="text-secondary" size={32} />

            <div>
              <h1>Pagamentos</h1>

              <p>Confirme pagamentos e informe a forma de recebimento.</p>
            </div>
          </Link>

          <Link
            to="/extrato-financeiro"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <ReceiptText className="text-secondary" size={32} />

            <div>
              <h1>Extrato Financeiro</h1>

              <p>Consulte pagamentos por mês, cliente e forma de pagamento.</p>
            </div>
          </Link>

          <Link
            to="/resumo-financeiro"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <ChartNoAxesCombined className="text-secondary" size={32} />

            <div>
              <h1>Resumo Financeiro</h1>

              <p>Veja o resumo do mês, pendências e gráficos financeiros.</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default FinanceiroMenu;
