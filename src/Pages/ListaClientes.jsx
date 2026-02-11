import { useLocation } from "react-router-dom";

import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";

import { useNavigate } from "react-router-dom";
import Header from "../Componentes/Header/Header";

import { createLogger } from "../lib/logger";
const logger = createLogger("ListaClientes")

import { formatarDataBR, formatarCEP, formatarTelefoneBR } from "../Componentes/Utilitarios/formadores";
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
      const { data, error } = await supabase.from("clientes").select("*");
      if (error) {
        logger.error("Erro ao buscar clientes: ", error);
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
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) {
      logger.error("Erro ao excluir cliente:", error);
    } else {
      setClientes((prev) => prev.filter((cliente) => cliente.id !== id));
    }
  };
  
  const handleEditar = (id) => {
    navigate(`/editar-cliente/${id}`); // Certifique-se de que não há barra extra
  };


  return (
    <>
     
<div className="p-4 rounded-lg">
  {/* Container principal */}
  <div className="container mx-auto p-4 ">
    
    {/* Cabeçalho */}
   <Header title="Lista de Clientes Cadastrados"/>

    {/* Tabela Responsiva */}
    <div className="w-full max-w-[100%] mx-auto p-4  rounded-lg overflow-auto max-h-[500px]">
        <div className="overflow-x-auto">
          {showUpdated && (
          <div className="mb-4 rounded-lg  text-green-800 font-semibold px-4 py-2  shadow">
              ✅ Cliente atualizado com sucesso!
        </div>
        )}

        <table className="w-full border-collapse border bg-white">
          <thead>
            <tr className="border bg-gray-100 text-center text-primary font-extrabold text-sm uppercase">
              <th className="border p-2 min-w-[200px]">Nome</th>
              <th className="border p-2 min-w-[100px]">Data de aniversário</th>
              <th className="border p-2 min-w-[150px]">Telefone</th>
              <th className="border p-2">Rua</th>
              <th className="border p-2">Nº</th>
              <th className="border p-2">Complemento</th>
              <th className="border p-2">Bairro</th>
              <th className="border-2 border-roxo px-6 py-4">Cidade</th>
              <th className="border p-2">CEP</th>
              <th className="border p-2 text-center">Editar</th>
              <th className="border p-2 text-center">Excluir</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="border   transition">
                <td className="border p-2 min-w-[200px]">{cliente.nome}</td>
                <td className="border p-2 min-w-[100px]">{formatarDataBR(cliente.data_aniversario)}</td>
                <td className="border p-2 min-w-[150px]">{formatarTelefoneBR(cliente.telefone)}</td>
                <td className="border p-2">{cliente.rua}</td>
                <td className="border p-2">{cliente.numero}</td>
                <td className="border p-2">{cliente.complemento}</td>
                <td className="border p-2">{cliente.bairro}</td>
                <td className="border p-2">{cliente.cidade}</td>
                <td className="border p-2">{formatarCEP(cliente.cep)}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleEditar(cliente.id)}
                    className="text-yellow-500 hover:text-yellow-700 text-xl"
                  >
                    ✏️
                  </button>
                </td>
                <td className="border-2 border-roxo px-3 py-2 text-center">
                  <button
                    onClick={() => handleExcluir(cliente.id, cliente.nome)}
                    className="text-red-500 hover:text-red-700 text-xl"
                  >
                    ❌
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
