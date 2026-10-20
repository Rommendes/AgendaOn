import Header from '../../Componentes/Header/Header';

function MensagensAvisos() {
  console.log('MensagensAvisos renderizou');
  return (
    <>
      <Header title="Mensagens e Avisos" voltarPara="/comunicacao-menu" />
      <div className="main">
        <div className="main-container">
          <div className="container-formulario text-primary">
            <div className="">
              <div className="mx-auto max-w-3xl rounded-xl border bg-white p-6 shadow">
                <h2 className="text-2xl font-bold text-primary">
                  Enviar mensagens e avisos
                </h2>

                <p className="mt-3 text-cinza">
                  Envie avisos importantes, promoções, novidades ou mensagens
                  personalizadas.
                </p>

                <button
                  type="button"
                  className="mt-5 rounded bg-secondary px-4 py-2 text-white"
                  onClick={() => alert('O botão também está funcionando!')}
                >
                  Testar botão
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MensagensAvisos;
