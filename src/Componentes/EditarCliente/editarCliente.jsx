import { Navigate } from 'react-router-dom';

import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

import { createLogger } from '../../lib/logger';
const logger = createLogger('EditarCliente');

const EditarCliente = () => {
  const { id } = useParams(); // Pegando o ID do cliente pela URL
  console.log('ID da URL:', id);

  const navigate = useNavigate();

  // Estado inicial corrigido para evitar inputs descontrolados
  // const [cliente, setCliente] = useState(null);
  const [cliente, setCliente] = useState({
    nome: '',
    data_aniversario: '',
    telefone: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    cep: '',
  });

  const [redirect, setRedirect] = useState(false);

  const [loading, setLoading] = useState(true);
  console.log('RENDER: loading =', loading);

  useEffect(() => {
    let ativo = true;

    const fetchCliente = async () => {
      console.log('A) fetchCliente começou', id);
      setLoading(true);

      try {
        console.log('B) antes do await supabase');

        const { data, error } = await supabase
          .from('clientes')
          .select(
            'nome, data_aniversario, telefone, rua, numero, complemento, bairro, cidade, cep'
          )
          .eq('id', id)
          .single();

        console.log('C) depois do await supabase', { data, error });

        if (error) {
          console.log('D) entrou no if(error)');
          logger.error('Erro ao buscar cliente:', error);
          alert('Erro ao carregar dados do cliente.');
          return;
        }

        setCliente({
          nome: data?.nome || '',
          data_aniversario: data?.data_aniversario || '',
          telefone: data?.telefone || '',
          rua: data?.rua || '',
          numero: data?.numero ?? '',
          complemento: data?.complemento || '',
          bairro: data?.bairro || '',
          cidade: data?.cidade || '',
          cep: data?.cep ?? '',
        });
      } catch (e) {
        console.log('E) caiu no catch', e);
        logger.error('Erro inesperado ao buscar cliente:', e);
        alert('Erro inesperado ao carregar dados do cliente.');
      } finally {
        console.log('F) finally rodou -> setLoading(false)');
        setLoading(false);
      }
    };

    if (id) fetchCliente();

    return () => {
      ativo = false;
    };
  }, [id]);

  const handleSalvar = async (e) => {
    e.preventDefault();

    if (!cliente) {
      alert('Erro: Nenhum cliente carregado.');
      return;
    }

    const { data, error } = await supabase
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select(); // ✅ Garante que os dados atualizados sejam retornados

    if (error) {
      console.log('❌ Deu erro no update', error);
      alert('Erro ao atualizar cliente. Verifique o console.');
    } else {
      setRedirect(true);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="font-bold text-red-500">Carregando dados do cliente...</p>
        <p className="text-sm text-cinza/80">ID: {id}</p>
        <p className="text-sm text-cinza/80">
          Nome no state: {cliente.nome ? cliente.nome : '(vazio)'}
        </p>
      </div>
    );
  }

  if (redirect) {
    return <Navigate to="/lista-clientes" replace state={{ updated: true }} />;
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-roxo text-center text-2xl font-bold">
        Editar Cliente
      </h2>
      <form
        onSubmit={handleSalvar}
        className="mx-auto mt-5 max-w-lg space-y-4 rounded-lg bg-white p-6 shadow-md"
      >
        <label className="block">
          Nome:
          <input
            type="text"
            value={cliente.nome}
            onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
            className="mt-1 block w-full rounded border p-2"
            required
          />
        </label>

        <label className="block">
          Data de Aniversário:
          <input
            type="date"
            value={cliente.data_aniversario}
            onChange={(e) =>
              setCliente({ ...cliente, data_aniversario: e.target.value })
            }
            className="mt-1 block w-full rounded border p-2"
            required
          />
        </label>

        <label className="block">
          Telefone:
          <input
            type="tel"
            value={cliente.telefone}
            onChange={(e) =>
              setCliente({ ...cliente, telefone: e.target.value })
            }
            className="mt-1 block w-full rounded border p-2"
            required
          />
        </label>

        <label className="block">
          Rua:
          <input
            type="text"
            value={cliente.rua}
            onChange={(e) => setCliente({ ...cliente, rua: e.target.value })}
            className="mt-1 block w-full rounded border p-2"
            required
          />
        </label>

        <label className="block">
          Nº:
          <input
            type="text"
            value={cliente.numero}
            onChange={(e) => setCliente({ ...cliente, numero: e.target.value })}
            className="mt-1 block w-full rounded border p-2"
            required
          />
        </label>

        <label className="block">
          Complemento:
          <input
            type="text"
            value={cliente.complemento}
            onChange={(e) =>
              setCliente({ ...cliente, complemento: e.target.value })
            }
            className="mt-1 block w-full rounded border p-2"
          />
        </label>

        <label className="block">
          Bairro:
          <input
            type="text"
            value={cliente.bairro}
            onChange={(e) => setCliente({ ...cliente, bairro: e.target.value })}
            className="mt-1 block w-full rounded border p-2"
            required
          />
        </label>

        <label className="block">
          Cidade:
          <input
            type="text"
            value={cliente.cidade}
            onChange={(e) => setCliente({ ...cliente, cidade: e.target.value })}
            className="mt-1 block w-full rounded border p-2"
            required
          />
        </label>

        <label className="block">
          CEP:
          <input
            type="text"
            value={cliente.cep}
            onChange={(e) => setCliente({ ...cliente, cep: e.target.value })}
            className="mt-1 block w-full rounded border p-2"
            required
          />
        </label>

        <div className="flex justify-between">
          <button
            type="submit"
            className="rounded bg-green-500 px-4 py-2 text-white"
          >
            Salvar Alterações
          </button>
          <button
            onClick={() => navigate('/lista-clientes')}
            className="rounded bg-gray-500 px-4 py-2 text-white"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarCliente;
