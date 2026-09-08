import { useLocation } from 'react-router-dom';

import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabaseClient';

import { useNavigate } from 'react-router-dom';
import Header from '../../Componentes/Header/Header';

import { SquarePen, Trash2, UserSearch } from 'lucide-react';

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

  return (
    <>
      {' '}
      <Header title="Clientes Cadastrados" />
      <div className="main">
        {/* Container principal */}
        <div className="container-formulario">
          {/* Cabeçalho */}
          <h1 className="mb-5 flex gap-2 p-4 text-primary">
            Clientes cadastrados
          </h1>
          {/* Tabela Responsiva */}

          <div className="overflow-x-auto">
            {showUpdated && (
              <div className="mb-4 rounded-lg px-4 py-2 font-semibold text-green-800 shadow">
                ✅ Cliente atualizado com sucesso!
              </div>
            )}

            {/* LISTA PARA CELULAR */}
            <div className="space-y-3 md:hidden">
              {clientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="w-full rounded-lg border bg-white p-4 shadow-sm"
                >
                  <p className="mb-3 flex items-center justify-between gap-x-2 font-bold text-primary">
                    {cliente.nome}
                    <div className="gap-10">
                      <button
                        onClick={() => handleEditar(cliente.id)}
                        className="text-primary"
                        aria-label={`Editar ${cliente.nome}`}
                      >
                        <SquarePen />
                      </button>

                      <button
                        onClick={() => handleExcluir(cliente.id, cliente.nome)}
                        className="text-secondary"
                        aria-label={`Excluir ${cliente.nome}`}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </p>

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
            <div className="hidden md:block">
              <table className="w-full border-collapse border bg-white">
                <thead>
                  <tr className="border bg-cinza/10 text-center text-sm font-extrabold uppercase text-primary">
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
                      <td className="border p-2">{formatarCEP(cliente.cep)}</td>
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
    </>
  );
};

export default ListaClientes;
