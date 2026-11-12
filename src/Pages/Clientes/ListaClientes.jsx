import { useLocation } from 'react-router-dom';

import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabaseClient';

import { useNavigate } from 'react-router-dom';
import Header from '../../Componentes/Header/Header';

import {
  Search,
  X,
  SquarePen,
  Trash2,
  Users,
  UserCheck,
  UserRoundPlus,
} from 'lucide-react';

import { createLogger } from '../../lib/logger';
const logger = createLogger('ListaClientes');

import {
  formatarDataBR,
  formatarCEP,
  formatarTelefoneBR,
} from '../../Componentes/Utilitarios/formadores';
const ListaClientes = () => {
  const location = useLocation();

  const showUpdated = location.state?.updated;

  useEffect(() => {
    if (showUpdated) {
      window.history.replaceState({}, document.title);
    }
  }, [showUpdated]);

  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [pesquisa, setPesquisa] = useState('');

  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true });
      if (error) {
        logger.error('Erro ao buscar clientes: ', error);
      } else {
        setClientes(data);
      }
    };
    fetchClientes();
  }, []);

  // 🔹 Função para excluir um cliente
  const handleExcluir = async (id, nome) => {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o cliente "${nome}"?\n\nEssa ação não pode ser desfeita.`
    );

    if (!confirmar) return;
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) {
      logger.error('Erro ao excluir cliente:', error);
    } else {
      setClientes((prev) => prev.filter((cliente) => cliente.id !== id));
    }
  };

  const handleEditar = (id) => {
    navigate(`/editar-cliente/${id}`); // Certifique-se de que não há barra extra
  };

  const normalizarTexto = (texto = '') =>
    texto
      .toLocaleLowerCase('pt-BR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const clientesFiltrados = clientes.filter((cliente) =>
    normalizarTexto(cliente.nome).includes(normalizarTexto(pesquisa))
  );

  return (
    <>
      {' '}
      <Header title="Clientes Cadastrados" voltarPara="/clientes-menu" />
      <div className="main">
        <div className="main-container">
          {/* Container principal */}
          <div className="container-formulario">
            <div className="mb-6">
              {/* Cabeçalho */}
              <h1 className="flex gap-2 text-primary">
                <UserRoundPlus className="text-secondary" />
                Clientes cadastrados
              </h1>
              <p className="text-sm text-cinza/80">
                Aqui você pode visualizar, editar ou excluir clientes
                cadastrados.
              </p>
            </div>

            {/* Total de clientes */}
            <div className="mb-5 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <div>
                <p className="text-sm text-cinza/70">Clientes cadastrados</p>

                <p className="text-2xl font-bold text-primary">
                  {clientes.length}
                </p>
              </div>

              <UserCheck size={28} className="text-secondary" />
            </div>

            <div className="mb-5">
              <label
                htmlFor="pesquisa-cliente"
                className="mb-1 block text-sm font-medium text-primary"
              >
                Pesquisar cliente
              </label>

              <div className="relative w-full max-w-md">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
                />

                <input
                  id="pesquisa-cliente"
                  type="text"
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                  placeholder="Digite o nome do cliente"
                  className="input-padrao w-full pl-10 pr-10"
                />

                {pesquisa && (
                  <button
                    type="button"
                    onClick={() => setPesquisa('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cinza/60 hover:text-secondary"
                    aria-label="Limpar pesquisa"
                    title="Limpar pesquisa"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {pesquisa && (
                <p className="mt-1 text-xs text-cinza/70">
                  {clientesFiltrados.length}{' '}
                  {clientesFiltrados.length === 1
                    ? 'cliente encontrado'
                    : 'clientes encontrados'}
                </p>
              )}
            </div>

            {/* Tabela Responsiva */}

            <div className="overflow-x-auto">
              {showUpdated && (
                <div className="mb-4 rounded-lg border border-success bg-success/5 px-4 py-2 font-semibold text-success shadow">
                  ✅ Cliente atualizado com sucesso!
                </div>
              )}

              {/* RESULTADOS DA PESQUISA */}
              {pesquisa.trim() && (
                <div className="space-y-4">
                  {clientesFiltrados.length === 0 ? (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 text-center">
                      <p className="text-sm text-cinza/70">
                        Nenhum cliente encontrado com esse nome.
                      </p>
                    </div>
                  ) : (
                    clientesFiltrados.map((cliente) => (
                      <div
                        key={cliente.id}
                        className="rounded-xl border border-primary/30 bg-white p-4 shadow-sm sm:p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-bold text-primary">
                              {cliente.nome}
                            </p>

                            {cliente.email && (
                              <p className="mt-1 text-sm text-cinza">
                                {cliente.email}
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditar(cliente.id)}
                              className="btn-icone text-primary"
                              aria-label={`Editar ${cliente.nome}`}
                              title="Editar cliente"
                            >
                              <SquarePen size={20} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleExcluir(cliente.id, cliente.nome)
                              }
                              className="btn-icone text-secondary"
                              aria-label={`Excluir ${cliente.nome}`}
                              title="Excluir cliente"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-medium uppercase text-cinza/60">
                              Telefone
                            </p>

                            <p className="text-cinza">
                              {cliente.telefone
                                ? formatarTelefoneBR(cliente.telefone)
                                : 'Não informado'}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase text-cinza/60">
                              Aniversário
                            </p>

                            <p className="text-cinza">
                              {cliente.data_aniversario
                                ? formatarDataBR(cliente.data_aniversario)
                                : 'Não informado'}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase text-cinza/60">
                              Endereço
                            </p>

                            <p className="text-cinza">
                              {cliente.rua || 'Não informado'}
                              {cliente.numero ? `, ${cliente.numero}` : ''}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase text-cinza/60">
                              Complemento
                            </p>

                            <p className="text-cinza">
                              {cliente.complemento || 'Não informado'}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase text-cinza/60">
                              Bairro
                            </p>

                            <p className="text-cinza">
                              {cliente.bairro || 'Não informado'}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase text-cinza/60">
                              Cidade
                            </p>

                            <p className="text-cinza">
                              {cliente.cidade || 'Não informada'}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase text-cinza/60">
                              CEP
                            </p>

                            <p className="text-cinza">
                              {cliente.cep
                                ? formatarCEP(cliente.cep)
                                : 'Não informado'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              {/* LISTA PARA CELULAR */}
              <div
                className={pesquisa.trim() ? 'hidden' : 'space-y-3 md:hidden'}
              >
                {clientesFiltrados.map((cliente) => (
                  <div
                    key={cliente.id}
                    className="w-full rounded-lg border border-primary/30 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between gap-x-2">
                      <p className="font-bold text-primary">{cliente.nome}</p>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditar(cliente.id)}
                          className="btn-icone text-primary"
                          aria-label={`Editar ${cliente.nome}`}
                        >
                          <SquarePen />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleExcluir(cliente.id, cliente.nome)
                          }
                          className="btn-icone text-secondary"
                          aria-label={`Excluir ${cliente.nome}`}
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-sm">
                      <span className="font-base text-cinza">Aniversário:</span>{' '}
                      {formatarDataBR(cliente.data_aniversario)}
                    </p>

                    <p className="text-sm">
                      <span className="font-base text-cinza">Telefone:</span>{' '}
                      {formatarTelefoneBR(cliente.telefone)}
                    </p>

                    <p className="mt-2 text-sm">
                      <span className="font-base text-cinza">Endereço:</span>{' '}
                      {cliente.rua}, {cliente.numero}
                    </p>

                    {cliente.complemento && (
                      <p className="text-sm">
                        <span className="font- text-cinza">Complemento:</span>{' '}
                        {cliente.complemento}
                      </p>
                    )}

                    <p className="text-sm">
                      <span className="font-base text-cinza">Cidade:</span>{' '}
                      {cliente.cidade}
                    </p>

                    <p className="text-sm">
                      <span className="font-base text-cinza">CEP:</span>{' '}
                      {formatarCEP(cliente.cep)}
                    </p>
                  </div>
                ))}
              </div>
              <div className={pesquisa.trim() ? 'hidden' : 'hidden md:block'}>
                <table className="w-full border-collapse border border-primary/30 bg-white">
                  <thead>
                    <tr className="border border-primary/30 bg-primary/5 text-center text-sm font-extrabold uppercase text-primary">
                      <th className="min-w-[200px] border p-2">Nome</th>
                      <th className="min-w-[100px] border p-2">
                        Data de aniversário
                      </th>
                      <th className="min-w-[150px] border p-2">Telefone</th>
                      <th className="border p-2">Rua</th>
                      <th className="border p-2">Nº</th>
                      <th className="border p-2">Complemento</th>
                      <th className="border p-2">Bairro</th>
                      <th className="border-roxo border-2 px-6 py-4">Cidade</th>
                      <th className="border p-2">CEP</th>
                      <th className="border p-2 text-center">Editar</th>
                      <th className="border p-2 text-center">Excluir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((cliente) => (
                      <tr key={cliente.id} className="border transition">
                        <td className="min-w-[200px] border p-2">
                          {cliente.nome}
                        </td>
                        <td className="min-w-[100px] border p-2">
                          {formatarDataBR(cliente.data_aniversario)}
                        </td>
                        <td className="min-w-[150px] border p-2">
                          {formatarTelefoneBR(cliente.telefone)}
                        </td>
                        <td className="border p-2">{cliente.rua}</td>
                        <td className="border p-2">{cliente.numero}</td>
                        <td className="border p-2">{cliente.complemento}</td>
                        <td className="border p-2">{cliente.bairro}</td>
                        <td className="border p-2">{cliente.cidade}</td>
                        <td className="border p-2">
                          {formatarCEP(cliente.cep)}
                        </td>
                        <td className="border p-2 text-center">
                          <button
                            onClick={() => handleEditar(cliente.id)}
                            className="text-xl text-yellow-500 hover:text-yellow-700"
                          >
                            <SquarePen className="text-primary" />
                          </button>
                        </td>
                        <td className="border-roxo border-2 px-3 py-2 text-center">
                          <button
                            onClick={() =>
                              handleExcluir(cliente.id, cliente.nome)
                            }
                            className="text-xl text-secondary hover:text-red-700"
                          >
                            {/* ❌ */}
                            <Trash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListaClientes;
