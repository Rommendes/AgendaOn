import Header from '../../Componentes/Header/Header';

function Avisos() {
  return (
    <>
      <Header title="Avisos" voltarPara="/comunicacao-menu" />
      <div className="main">
        <div className="main-container">
          <div className="container-formulario text-primary">
            <div className="">
              <div className="mx-auto max-w-3xl rounded-xl border bg-white p-6 shadow">
                <h1 className="text-2xl font-bold text-primary">
                  Página funcionando!
                </h1>

                <p className="mt-3 text-cinza">
                  Este conteúdo é apenas para testar se a página está sendo
                  renderizada.
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

export default Avisos;
