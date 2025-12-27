
import { useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";
import Header from "../Componentes/Header/Header"
import HistoricoDoCliente from "./HistoricoDoCliente";

const PesquisandoClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState("");
  const [resultados, setResultados] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase.from("clientes").select("*");
      if (error) {
        logger.error("Erro ao buscar clientes: ", error);
      } else {
        setClientes(data);
      }
    };
    fetchClientes();
  }, []);

  const handlePesquisa = (e) => {
    e.preventDefault();
    const termo = search.trim().toLowerCase();
    if (!termo) return;

    const filtrados = clientes.filter((cliente) =>
      cliente.nome.toLowerCase().includes(termo)
    );
    setResultados(filtrados);
  };

  const handleExcluir = async (id) => {
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) {
      logger.error("Erro ao excluir cliente:", error);
    } else {
      setClientes((prev) => prev.filter((c) => c.id !== id));
      setResultados((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleEditar = (id) => {
    navigate(`/editar-cliente/${id}`);
  };

  return (
    <div className="container mx-auto p-4">
      <Header title="Histórico do Cliente Cadastrado" />
      <div className="border-2 rounded-lg shadow-lg p-10 bg-gray-50 mt-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-cinza">
          Pesquise um cliente para visualizar os dados
        </h2>

        <form onSubmit={handlePesquisa} className="max-w-md mx-auto mb-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar cliente..."
              className="input-padrao py-4"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="absolute end-2.5 bottom-2.5 text-white bg-secondary hover:bg-alternativo font-medium rounded-lg text-sm px-4 py-2"
            >
              Buscar
            </button>
          </div>
        </form>

        {resultados.length > 0 ? (
          resultados.map((cliente) => (
            <div key={cliente.id} className="mb-12">
              <h3 className="text-xl font-bold mb-2 text-primary">Dados do Cliente</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white mb-4">
                  <thead>
                    <tr className="bg-azulzinho text-center text-primary font-extrabold text-sm uppercase">
                      <th className="border px-4 py-2">Nome</th>
                      <th className="border px-4 py-2">Aniversário</th>
                      <th className="border px-4 py-2">Telefone</th>
                      <th className="border px-4 py-2">Rua</th>
                      <th className="border px-4 py-2">Nº</th>
                      <th className="border px-4 py-2">Complemento</th>
                      <th className="border px-4 py-2">Bairro</th>
                      <th className="border px-4 py-2">Cidade</th>
                      <th className="border px-4 py-2">CEP</th>
                      <th className="border px-4 py-2">Editar</th>
                      <th className="border px-4 py-2">Excluir</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50 text-center">
                      <td className="border px-4 py-2">{cliente.nome}</td>
                      <td className="border px-4 py-2">{cliente.data_aniversario}</td>
                      <td className="border px-4 py-2">{cliente.telefone}</td>
                      <td className="border px-4 py-2">{cliente.rua}</td>
                      <td className="border px-4 py-2">{cliente.numero}</td>
                      <td className="border px-4 py-2">{cliente.complemento}</td>
                      <td className="border px-4 py-2">{cliente.bairro}</td>
                      <td className="border px-4 py-2">{cliente.cidade}</td>
                      <td className="border px-4 py-2">{cliente.cep}</td>
                      <td className="border px-4 py-2">
                        <button onClick={() => handleEditar(cliente.id)} className="text-yellow-500 text-xl">✏️</button>
                      </td>
                      <td className="border px-4 py-2">
                        <button onClick={() => handleExcluir(cliente.id)} className="text-red-500 text-xl">❌</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* Histórico */}
              <HistoricoDoCliente clienteId={cliente.id} />
            </div>
          ))
        ) : (
          search && <p className="text-center text-red-500">Nenhum cliente encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default PesquisandoClientes;
