import { useState } from 'react';
import { supabase } from '../../api/supabaseClient'; // Importe seu Supabase
import EnderecoForm from '../../Componentes/EnderecoForm';

import Header from '../../Componentes/Header/Header';

import {
  apenasNumeros,
  formatarCEP,
  formatarTelefoneBR,
} from '../../Componentes/Utilitarios/formadores';

import { createLogger } from '../../lib/logger';
const logger = createLogger('CadastrarCliente');

const CadastrarCliente = () => {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    dataAniversario: '',
    endereco: {
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      cep: '',
    },
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Estado para indicar o carregamento

  // ✅ Função para validar número ou retornar null
  const toNullableNumber = (value) => {
    const trimmed = value.trim();
    return /^\d+$/.test(trimmed) ? parseInt(trimmed, 10) : null;
  };

  const validate = () => {
    let tempErrors = {};

    if (!formData.nome) tempErrors.nome = 'O nome é obrigatório';

    if (!formData.telefone) {
      tempErrors.telefone = 'O telefone é obrigatório';
    } else if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(formData.telefone)) {
      tempErrors.telefone = 'Formato inválido. Use (99) 99999-9999';
    }

    // ✅ CEP opcional, mas se preencher tem que ter 8 dígitos
    if (formData.endereco.cep) {
      const cepLimpo = apenasNumeros(formData.endereco.cep);
      if (cepLimpo.length !== 8) {
        tempErrors.cep = 'CEP inválido. Use 12345-678';
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'telefone') {
      setFormData((prev) => ({ ...prev, telefone: formatarTelefoneBR(value) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEnderecoChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cep') {
      setFormData((prev) => ({
        ...prev,
        endereco: { ...prev.endereco, cep: formatarCEP(value) },
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      endereco: { ...prev.endereco, [name]: value },
    }));
  };

  // Função para cadastrar cliente no Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const { error } = await supabase.from('clientes').insert([
        {
          nome: formData.nome,
          telefone: apenasNumeros(formData.telefone),
          email: formData.email,
          data_aniversario: formData.dataAniversario,
          rua: formData.endereco.rua,
          numero: toNullableNumber(formData.endereco.numero),
          complemento: formData.endereco.complemento,
          bairro: formData.endereco.bairro,
          cidade: formData.endereco.cidade,
          cep: toNullableNumber(apenasNumeros(formData.endereco.cep)),
        },
      ]);

      if (error) throw error;

      alert('Cliente cadastrado com sucesso!');

      // Resetar formulário após sucesso
      setFormData({
        nome: '',
        telefone: '',
        email: '',
        dataAniversario: '',
        endereco: {
          rua: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          cep: '',
        },
      });

      setErrors({});
    } catch (error) {
      logger.error('Erro ao cadastrar cliente:', error.message);
      alert(
        `Erro ao cadastrar cliente: ${error.message || 'Erro desconhecido'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Cadastro de Cliente" />

      <div className="container mx-auto p-4">
        <div className="mx-auto mt-6 w-full max-w-[1250px] rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div>
            <div className="flex-wrap">
              <div className="rounded p-4">
                <h2 className="text-center text-lg text-primary">
                  Preencha os Campos Obrigatórios* e opcionais
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block px-2 text-left font-medium">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className={` ${errors.nome ? 'border-red-500' : 'border-gray-300'} input-padrao`}
                />
                {errors.nome && (
                  <p className="text-sm text-red-500">{errors.nome}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
                {/* Telefone */}
                <div>
                  <label className="block px-2 text-left font-medium">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(99) 99999-9999"
                    className={`input-padrao ${errors.telefone ? 'border-red-500' : 'border-gray-300'} `}
                  />
                  {errors.telefone && (
                    <p className="text-sm text-red-500">{errors.telefone}</p>
                  )}
                </div>

                {/* Data de aniversário */}
                <div>
                  <label className="block px-2 text-left font-medium">
                    Data de Aniversário:
                  </label>
                  <input
                    type="date"
                    name="dataAniversario"
                    value={formData.dataAniversario}
                    onChange={handleChange}
                    className="input-padrao"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block px-2 text-left font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-padrao"
                  />
                </div>
              </div>
              {/* Endereço */}
              <EnderecoForm
                formData={formData.endereco}
                handleChange={handleEnderecoChange}
              />

              {/* Botão de cadastrar */}
              <button
                type="submit"
                className="ml-40 w-fit justify-center rounded-lg bg-primary p-3 text-white transition-all hover:bg-secondary"
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CadastrarCliente;
