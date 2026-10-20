//import { useState } from "react";

const EnderecoForm = ({ formData, handleChange }) => {
  if (!formData) {
    return <p>Erro: Dados do endereço não foram carregados corretamente.</p>;
  }

  return (
    <div className="flex flex-col shadow">
      {/* <p className="relative mb-0 pb-[-4px] text-sm text-gray-500">
        (Opcional)
      </p> */}
      <div className="my-1 rounded border border-secondary p-2 pb-5 shadow">
        <h3 className="mb-2 pt-2 text-xl font-bold text-primary">Endereço</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block px-2">Rua:</label>
            <input
              type="text"
              name="rua"
              value={formData.rua}
              onChange={handleChange}
              placeholder="Nome da Rua"
              className="input-padrao"
            />
          </div>

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

          <div>
            <label className="block px-2">Complemento:</label>
            <input
              type="text"
              name="complemento"
              value={formData.complemento}
              onChange={handleChange}
              placeholder="Apartamento, Bloco, etc."
              className="input-padrao"
            />
          </div>

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

          <div>
            <label className="block px-2">Cidade:</label>
            <input
              type="text"
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              placeholder="Nome da Cidade"
              className="input-padrao"
            />
          </div>

          <div>
            <label className="block px-2">CEP:</label>
            <input
              type="text"
              name="cep"
              value={formData.cep}
              onChange={handleChange}
              placeholder="00000-000"
              maxLength={9}
              className="input-padrao"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnderecoForm;
