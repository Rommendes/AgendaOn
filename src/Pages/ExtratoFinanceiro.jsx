import Header from '../Componentes/Header/Header';

function ExtratoFinanceiro() {
  return (
    <div className="container mx-auto p-4">
      <Header />

      <div className="mx-auto w-full max-w-[1200px] p-4">
        <h1 className="mb-1 text-2xl font-medium text-primary">
          Extrato Financeiro
        </h1>

        <p className="mb-6 text-sm text-gray-500">
          Consulte pagamentos e pendências de períodos anteriores.
        </p>
      </div>
    </div>
  );
}

export default ExtratoFinanceiro;
