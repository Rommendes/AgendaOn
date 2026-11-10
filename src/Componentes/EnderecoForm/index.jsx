const EnderecoForm = ({ formData, handleChange, buscandoCEP, erroCEP }) => {
  if (!formData) {
    return <p>Erro: Dados do endereço não foram carregados corretamente.</p>;
  }

  return (
    <div className="flex flex-col shadow">
      <div className="my-1 rounded border border-secondary p-2 pb-5 shadow">
        <h3 className="mb-2 pt-2 text-xl font-bold text-primary">Endereço</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Rua */}
          <div>
            <label className="block px-2">Rua:</label>

            <input
              type="text"
              name="rua"
              value={formData.rua}
              onChange={handleChange}
              placeholder="Nome da rua"
              className="input-padrao"
            />
          </div>

          {/* Número */}
          <div>
            <label className="block px-2">Número:</label>

            <input
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              placeholder="Número"
              className="input-padrao"
            />
          </div>

          {/* Complemento */}
          <div>
            <label className="block px-2">Complemento:</label>

            <input
              type="text"
              name="complemento"
              value={formData.complemento}
              onChange={handleChange}
              placeholder="Apartamento, bloco etc."
              className="input-padrao"
            />
          </div>

          {/* Bairro */}
          <div>
            <label className="block px-2">Bairro:</label>

            <input
              type="text"
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              placeholder="Bairro"
              className="input-padrao"
            />
          </div>
          {/* CEP */}
          <div>
            <label className="block px-2">CEP:</label>

            <input
              type="text"
              name="cep"
              value={formData.cep}
              onChange={handleChange}
              placeholder="00000-000"
              maxLength={9}
              autoComplete="postal-code"
              className="input-padrao"
            />

            {buscandoCEP && (
              <p className="mt-1 px-2 text-xs text-cinza/70">
                Buscando endereço...
              </p>
            )}

            {erroCEP && (
              <p className="mt-1 px-2 text-xs text-danger">{erroCEP}</p>
            )}
          </div>

          {/* Cidade */}
          <div>
            <label className="block px-2">Cidade:</label>

            <input
              type="text"
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              placeholder="Nome da cidade"
              className="input-padrao"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnderecoForm;
