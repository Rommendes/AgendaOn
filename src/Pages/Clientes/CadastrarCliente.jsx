import { useState } from 'react';
import { supabase } from '../../api/supabaseClient'; // Importe seu Supabase

import { useAuth } from '../../context/AuthContext';

import EnderecoForm from '../../Componentes/EnderecoForm';

import Header from '../../Componentes/Header/Header';
import { X, UserRoundPlus, CircleCheck } from 'lucide-react';

import {
  apenasNumeros,
  formatarCEP,
  formatarTelefoneBR,
} from '../../Componentes/Utilitarios/formadores';

import { createLogger } from '../../lib/logger';
const logger = createLogger('CadastrarCliente');

const CadastrarCliente = () => {
  const { empresaId, loadingEmpresa, erroEmpresa } = useAuth();
  const [avisoSucesso, setAvisoSucesso] = useState('');
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

  const [pesquisa, setPesquisa] = useState('');
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalEncontrados, setTotalEncontrados] = useState(0);

  const itensPorPagina = 20;

  const [loading, setLoading] = useState(false); // Estado para indicar o carregamento
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [erroCEP, setErroCEP] = useState('');

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

  const buscarCEP = async (cepInformado) => {
    const cepLimpo = apenasNumeros(cepInformado);

    if (cepLimpo.length !== 8) return;

    setBuscandoCEP(true);
    setErroCEP('');

    try {
      const resposta = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      if (!resposta.ok) {
        throw new Error('Não foi possível consultar o CEP.');
      }

      const dados = await resposta.json();

      if (dados.erro) {
        setErroCEP('CEP não encontrado.');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          cep: formatarCEP(cepLimpo),
          rua: dados.logradouro || prev.endereco.rua,
          bairro: dados.bairro || prev.endereco.bairro,
          cidade: dados.localidade || prev.endereco.cidade,
        },
      }));
    } catch (error) {
      logger.error('Erro ao consultar CEP:', error);
      setErroCEP('Não foi possível consultar o CEP.');
    } finally {
      setBuscandoCEP(false);
    }
  };

  const handleEnderecoChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cep') {
      const cepLimpo = apenasNumeros(value);

      setFormData((prev) => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          cep: formatarCEP(cepLimpo),
        },
      }));

      setErroCEP('');

      if (cepLimpo.length === 8) {
        buscarCEP(cepLimpo);
      }

      return;
    }

    setFormData((prev) => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        [name]: value,
      },
    }));
  };

  // Função para cadastrar cliente no Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setAvisoSucesso('');

    if (loadingEmpresa) {
      alert('Aguarde o carregamento dos dados do salão.');
      return;
    }

    if (erroEmpresa || !empresaId) {
      alert(
        erroEmpresa ||
          'Não foi possível identificar o salão. Saia e entre novamente.'
      );
      return;
    }

    if (!validate()) return;

    setLoading(true);

    try {
      const { data: clienteSalvo, error } = await supabase
        .from('clientes')
        .insert([
          {
            empresa_id: empresaId,
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
        ])
        .select('id, empresa_id')
        .single();

      if (error) throw error;
      console.log('Empresa enviada:', empresaId);
      console.log('Cliente salvo:', clienteSalvo);

      setAvisoSucesso('Cliente cadastrado com sucesso!');

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
      <Header title="Cadastro de Cliente" voltarPara="/clientes-menu" />
      {avisoSucesso && (
        <div
          role="status"
          className="fixed right-4 top-24 z-50 flex w-[calc(100%-2rem)] max-w-sm items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <CircleCheck size={21} className="shrink-0" />

            <p className="text-sm font-medium">{avisoSucesso}</p>
          </div>

          <button
            type="button"
            onClick={() => setAvisoSucesso('')}
            className="rounded-md p-1 text-green-700 transition hover:bg-green-100"
            aria-label="Fechar aviso"
            title="Fechar aviso"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="main">
        <div className="main-container">
          <div className="container-formulario text-primary">
            <div className="mb-6">
              <h1 className="flex gap-2 text-primary">
                <UserRoundPlus className="text-secondary" />
                Cadastrar novo cliente
              </h1>
              <p className="text-sm text-cinza/80">
                Preencha os campos abaixo para cadastrar um novo cliente.
              </p>
              <p className="mt-1 text-sm text-cinza/80">
                <span className="whitespace-nowrap">
                  Campos com{' '}
                  <span className="text-cinza/80">
                    (<span className="tex-lg font-bold text-danger">*</span>)
                  </span>{' '}
                  são obrigatórios
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block px-2 text-left font-medium">
                  Nome<span className="font-bold text-danger">*</span>
                </label>

                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className={`input-padrao ${errors.nome ? '!border-red-500 !ring-red-200' : ''}`}
                />
                {errors.nome && (
                  <p className="text-sm text-red-500">{errors.nome}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
                {/* Telefone */}
                <div>
                  <label className="block px-2 text-left font-medium">
                    Telefone<span className="font-bold text-danger">*</span>
                  </label>

                  <input
                    type="text"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(99) 99999-9999"
                    className={`input-padrao ${
                      errors.telefone ? '!border-red-500 !ring-red-200' : ''
                    }`}
                  />

                  {errors.telefone && (
                    <p className="text-sm text-red-500">{errors.telefone}</p>
                  )}
                </div>

                {/* Data de aniversário */}
                <div className="min-w-0">
                  <label className="block px-2 text-left font-medium">
                    Data de Aniversário
                    <span className="font-bold text-danger">*</span>
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
                buscandoCEP={buscandoCEP}
                erroCEP={erroCEP}
              />

              {/* Botão de cadastrar */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="w-fit rounded-lg bg-primary p-3 text-white transition-all hover:bg-secondary"
                  disabled={loading}
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CadastrarCliente;
