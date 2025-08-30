
import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";

import { useNavigate } from "react-router-dom";
import Header from "../Componentes/Header/Header";

//import EditarCliente from "../EditarCliente/editarCliente";

const ListaClientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase.from("clientes").select("*");
      if (error) {
        console.error("Erro ao buscar clientes: ", error);
      } else {
        setClientes(data);
      }
    };
    fetchClientes();
  }, []);

  // 🔹 Função para excluir um cliente
  const handleExcluir = async (id) => {
    console.log("ID do cliente sendo excluído:", id);

    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) {
      console.error("Erro ao excluir cliente:", error);
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
                <td className="border p-2 min-w-[100px]">{cliente.data_aniversario}</td>
                <td className="border p-2 min-w-[150px]">{cliente.telefone}</td>
                <td className="border p-2">{cliente.rua}</td>
                <td className="border p-2">{cliente.numero}</td>
                <td className="border p-2">{cliente.complemento}</td>
                <td className="border p-2">{cliente.bairro}</td>
                <td className="border p-2">{cliente.cidade}</td>
                <td className="border p-2">{cliente.cep}</td>
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
                    onClick={() => handleExcluir(cliente.id)}
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
