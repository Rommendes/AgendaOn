function Mensagem() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-primary">Página funcionando!</h1>

        <p className="mt-3 text-gray-600">
          Este conteúdo é apenas para testar se a página está sendo renderizada.
        </p>

        <button
          type="button"
          className="mt-5 rounded bg-secondary px-4 py-2 text-white"
          onClick={() => alert('O botão também está funcionando!')}
        >
          Testar botão
        </button>
      </div>
    </main>
  );
}

export default Mensagem;
