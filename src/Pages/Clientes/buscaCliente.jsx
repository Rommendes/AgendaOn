import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Header from '../../Componentes/Header/Header';
import HistoricoDoCliente from './HistoricoDoCliente';
import {
  formatarDataBR,
  formatarCEP,
  formatarTelefoneBR,
} from '../../Componentes/Utilitarios/formadores';
import { createLogger } from '../../lib/logger';
const logger = createLogger('PesquisandoClientes');

const PesquisandoClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [resultados, setResultados] = useState([]);
  const [resumoFinanceiro, setResumoFinanceiro] = useState({});
  const [resumoCobrancas, setResumoCobrancas] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase.from('clientes').select('*');
      if (error) {
        logger.error('Erro ao buscar clientes: ', error);
      } else {
        setClientes(data);
      }
    };
    fetchClientes();
  }, []);

  useEffect(() => {
    const termo = search.trim().toLowerCase();

    if (!termo) {
      setResultados([]);
      return;
    }

    const filtrados = clientes.filter((cliente) =>
      cliente.nome?.toLowerCase().includes(termo)
    );

    setResultados(filtrados);

    filtrados.forEach((cliente) => {
      buscarResumoCobrancas(cliente.id);
    });
  }, [search, clientes]);

  {
    /*Excluir*/
  }

  const handleExcluir = (id) => {
    abrirConfirmacao(
      'Tem certeza que deseja excluir este cliente?',
      async () => {
        const { error } = await supabase.from('clientes').delete().eq('id', id);

        if (error) {
          logger.error('Erro ao excluir cliente:', error);
          mostrarMensagem('erro', 'Erro ao excluir cliente.');
        } else {
          setClientes((prev) => prev.filter((c) => c.id !== id));
          setResultados((prev) => prev.filter((c) => c.id !== id));
          mostrarMensagem('sucesso', 'Cliente excluído com sucesso!');
        }
      }
    );
  };

  {
    /*Editar*/
  }
  const handleEditar = (id) => {
    navigate(`/editar-cliente/${id}`);
  };

  const [confirmacao, setConfirmacao] = useState({
    aberto: false,
    mensagem: '',
    onConfirm: null,
  });

  const abrirConfirmacao = (mensagem, callback) => {
    setConfirmacao({
      aberto: true,
      mensagem,
      onConfirm: callback,
    });
  };

  {
    confirmacao.aberto && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-[90%] max-w-md rounded-lg bg-white p-6 shadow-lg">
          <p className="mb-4 text-gray-800">{confirmacao.mensagem}</p>

          <div className="flex justify-end gap-3">
            <button
              className="rounded bg-gray-200 px-4 py-2"
              onClick={() => setConfirmacao({ ...confirmacao, aberto: false })}
            >
              Cancelar
            </button>

            <button
              className="rounded bg-red-500 px-4 py-2 text-white"
              onClick={async () => {
                await confirmacao.onConfirm();
                setConfirmacao({ ...confirmacao, aberto: false });
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const buscarResumoCobrancas = async (clienteId) => {
    const { data, error } = await supabase
      .from('lembretes_enviados')
      .select('id, enviado_em')
      .eq('cliente_id', clienteId)
      .eq('tipo', 'cobranca_pendente')
      .order('enviado_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar cobranças do cliente:', error);
      return;
    }

    setResumoCobrancas((prev) => ({
      ...prev,
      [clienteId]: {
        quantidade: data?.length || 0,
        ultimaCobranca: data?.[0]?.enviado_em || null,
      },
    }));
  };

  return (
    <div className="mx-auto mt-6 w-full max-w-xl rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 shadow-lg sm:px-6 md:max-w-3xl md:px-10 lg:max-w-5xl">
      <Header title="Histórico do Cliente Cadastrado" />
      <div className="mt-6 rounded-lg border-2 bg-gray-50 p-4 shadow-lg">
        <h4 className="mb-3 px-2 text-center text-lg uppercase text-primary sm:text-xl md:mb-4 md:text-2xl">
          Pesquise um cliente para visualizar os dados
        </h4>

        {/* Card informativo */}
        {!search && (
          <div className="mb-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-10 text-center">
            <span className="material-icons mb-3 text-5xl text-gray-400">
              search
            </span>

            <p className="text-base font-medium text-gray-600">
              Procure um cliente
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Digite o nome para iniciar a busca
            </p>
          </div>
        )}

        {/* Input separado */}
        <div className="mx-auto mb-5 max-w-md">
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>

            <input
              type="text"
              placeholder="Pesquisar cliente..."
              className="input-padrao w-full rounded-lg border border-gray-300 bg-white py-4 pl-10 text-gray-700 placeholder-gray-400 shadow-sm transition hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {resultados.length > 0
          ? resultados.map((cliente) => (
              <div key={cliente.id} className="mb-12">
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                  {/* COLUNA ESQUERDA - DADOS DO CLIENTE */}
                  <div>
                    <h3 className="mb-3 mt-3 text-xl font-bold uppercase text-primary">
                      Dados do Cliente
                    </h3>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-md transition-all duration-200 hover:shadow-lg">
                      <h3 className="mb-3 text-xl font-bold text-primary">
                        {cliente.nome}
                      </h3>
                      <div
                        className={`mb-4 rounded-lg px-3 py-2 text-sm font-medium ${
                          resumoFinanceiro.totalPendente > 0
                            ? 'border border-red-200 bg-red-50 text-red-700'
                            : 'border border-green-200 bg-green-50 text-green-700'
                        }`}
                      >
                        {resumoFinanceiro.totalPendente > 0
                          ? '🔴 Cliente com pendência financeira'
                          : '🟢 Cliente sem pendências'}
                      </div>
                      <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 md:grid-cols-2">
                        <p>
                          <span className="font-semibold text-primary">
                            Aniversário:
                          </span>{' '}
                          {formatarDataBR(cliente.data_aniversario)}
                        </p>
                        <p>
                          <span className="font-semibold text-primary">
                            Telefone:
                          </span>{' '}
                          {formatarTelefoneBR(cliente.telefone)}
                        </p>
                        <p>
                          <span className="font-semibold text-primary">
                            Rua:
                          </span>{' '}
                          {cliente.rua || '-'}, {cliente.numero || 's/n'}
                        </p>
                        <p>
                          <span className="font-semibold text-primary">
                            Complemento:
                          </span>{' '}
                          {cliente.complemento || '-'}
                        </p>
                        <p>
                          <span className="font-semibold text-primary">
                            Bairro:
                          </span>{' '}
                          {cliente.bairro || '-'}
                        </p>
                        <p>
                          <span className="font-semibold text-primary">
                            Cidade:
                          </span>{' '}
                          {cliente.cidade || '-'}
                        </p>
                        <p>
                          <span className="font-semibold text-primary">
                            CEP:
                          </span>{' '}
                          {formatarCEP(cliente.cep)}
                        </p>
                      </div>

                      <div className="mt-5 flex gap-3">
                        <button
                          onClick={() => handleEditar(cliente.id)}
                          className="rounded-lg bg-secondary px-4 py-2 font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleExcluir(cliente.id)}
                          className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-red-600"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>

                  {/*RESUMO FINANCEIRO */}

                  <div>
                    {/*"mb-3 mt-3 text-xl font-bold uppercase text-primary*/}
                    <h3 className="mb-3 mt-3 text-xl font-bold uppercase text-secondary">
                      Resumo Financeiro
                    </h3>
                    <div className="mt-3 rounded-xl border border-gray-200 bg-white p-5 shadow-md">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-green-100 bg-green-50 p-3">
                          <p className="text-xs text-gray-500">Total Pago</p>

                          <p className="font-bold text-green-600">
                            R${' '}
                            {(resumoFinanceiro.totalPago || 0)
                              .toFixed(2)
                              .replace('.', ',')}
                          </p>
                        </div>

                        <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                          <p className="text-xs text-gray-500">Pendente</p>

                          <p className="font-bold text-red-600">
                            R${' '}
                            {(resumoFinanceiro.totalPendente || 0)
                              .toFixed(2)
                              .replace('.', ',')}
                          </p>
                        </div>

                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                          <p className="text-xs text-gray-500">Atendimentos</p>

                          <p className="font-bold text-primary">
                            {resumoFinanceiro.totalAtendimentos || 0}
                          </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <p className="text-xs text-gray-500">
                            Último Atendimento
                          </p>

                          <p className="font-bold text-cinza">
                            {resumoFinanceiro.ultimoAtendimento || '-'}
                          </p>
                        </div>
                        <div className="rounded-lg border border-purple-100 bg-purple-50 p-3">
                          <p className="text-xs text-gray-500">
                            Cobranças enviadas
                          </p>

                          <p className="font-bold text-purple-700">
                            {resumoCobrancas[cliente.id]?.quantidade || 0}
                          </p>
                        </div>

                        <div className="rounded-lg border border-orange-100 bg-orange-50 p-3">
                          <p className="text-xs text-gray-500">
                            Última cobrança
                          </p>

                          <p className="font-bold text-orange-700">
                            {resumoCobrancas[cliente.id]?.ultimaCobranca
                              ? new Date(
                                  resumoCobrancas[cliente.id].ultimaCobranca
                                ).toLocaleDateString('pt-BR')
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COLUNA DIREITA - HISTÓRICO */}
                  <div className="lg:col-span-2">
                    <h3 className="mb-3 mt-3 text-xl font-bold text-primary">
                      Histórico de Agendamentos
                    </h3>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-md">
                      <HistoricoDoCliente
                        clienteId={cliente.id}
                        onResumoFinanceiro={setResumoFinanceiro}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          : search && (
              <p className="text-center text-red-500">
                Nenhum cliente encontrado.
              </p>
            )}
      </div>
    </div>
  );
};

export default PesquisandoClientes;
