import { Link } from 'react-router-dom';
import Header from '../Componentes/Header/Header';
import {
  ChartNoAxesCombined,
  CreditCard,
  ReceiptText,
  WalletCards,
} from 'lucide-react';

function FinanceiroMenu() {
  return (
    <>
      <Header title="Financeiro" />

      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          <Link
            to="/pagamentos"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <CreditCard className="text-secondary" size={32} />

            <div>
              <h2 className="text-lg font-bold">Pagamentos</h2>

              <p className="text-sm">
                Confirme pagamentos e informe a forma de recebimento.
              </p>
            </div>
          </Link>

          <Link
            to="/extrato-financeiro"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <ReceiptText className="text-secondary" size={32} />

            <div>
              <h2 className="text-lg font-bold">Extrato Financeiro</h2>

              <p className="text-sm">
                Consulte pagamentos por mês, cliente e forma de pagamento.
              </p>
            </div>
          </Link>

          <Link
            to="/financeiro"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <ChartNoAxesCombined className="text-secondary" size={32} />

            <div>
              <h2 className="text-lg font-bold">Resumo Financeiro</h2>

              <p className="text-sm">
                Veja o resumo do mês, pendências e gráficos financeiros.
              </p>
            </div>
          </Link>

          <Link
            to="/cobrancas"
            className="botao-menu w-full transition hover:scale-[1.02]"
          >
            <WalletCards className="text-secondary" size={32} />

            <div>
              <h2 className="text-lg font-bold">Pendências</h2>

              <p className="text-sm">
                Envie cobranças para clientes com pagamentos pendentes.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

export default FinanceiroMenu;
