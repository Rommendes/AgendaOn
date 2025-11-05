
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const HistoricoDoCliente = ({ clienteId }) => {
  const [agendamentos, setAgendamentos] = useState([]);

  useEffect(() => {
    const buscarAgendamentos = async () => {
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("data", { ascending: false });

      if (error) {
        console.error("Erro ao buscar agendamentos:", error);
      } else {
        setAgendamentos(data);
      }
    };

    if (clienteId) {
      buscarAgendamentos();
    }
  }, [clienteId]);

  useEffect(() => {
    console.log("Agendamentos:", agendamentos);
    agendamentos.forEach((item) => {
      console.log("VALOR ORIGINAL:", item.valor, " -> PARSED:", parseValor(item.valor));
    });
  }, [agendamentos]);
  

  const parseValor = (valor) => {
    if (!valor) return 0;
  
    const limpo = valor
      .toString()
      .replace("R$", "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
  
    const convertido = parseFloat(limpo);
  
    return isNaN(convertido) ? 0 : convertido;
  };
  
 


  const normalizarTexto = (texto) =>
    texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  
  const totalPago = agendamentos
    .filter((item) => normalizarTexto(item.pagamento) !== "nao pagou")
    .reduce((acc, item) => acc + parseValor(item.valor), 0);
  
  const totalPendente = agendamentos
    .filter((item) => normalizarTexto(item.pagamento) === "nao pagou")
    .reduce((acc, item) => acc + parseValor(item.valor), 0);

    
  

  return (
    <div className="mt-10 overflow-x-auto" >
  <h3 className="text-xl font-bold mb-2 text-primary">Histórico de Agendamentos</h3>
  {agendamentos.length > 0 ? (
    <>
      <table className="w-full border bg-white shadow rounded overflow-x-auto">
        <thead className="bg-azulzinho text-primary text-sm uppercase">
          <tr className="text-center">
            <th className="border px-4 py-2">Data</th>
            <th className="border px-4 py-2">Horário</th>
            <th className="border px-4 py-2">Serviço</th>
            <th className="border px-4 py-2">Valor</th>
            <th className="border px-4 py-2">Pagamento</th>
           
            <th className="border px-4 py-2">Observações</th>
          </tr>
        </thead>
        <tbody>
          {agendamentos.map((item, index) => (
            <tr key={index} className="text-center hover:bg-gray-100">
              <td className="border px-4 py-2">{item.data}</td>
              <td className="border px-4 py-2">{item.horario}</td>
              <td className="border px-4 py-2">{item.servico}</td>
              <td className="border px-4 py-2">
                R$ {parseValor(item.valor).toFixed(2)}
              </td>
              <td className="border px-4 py-2">{item.pagamento}</td>
              
              <td className="border px-4 py-2">{item.obs}</td>
            </tr>
          ))}

         
         
        </tbody>
      </table>

      {/* Resumo por Forma de Pagamento */}
      <div className="mt-6 border rounded-lg p-4 bg-white shadow">
      <h2 className="text-lg font-semibold mb-2 text-secondary uppercase">Resumo da Conta</h2>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <span className="font-medium text-primary">Total Pago:</span>
          <span className="text-green-600 font-semibold">
            R$ {totalPago.toFixed(2).replace('.', ',')}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-primary">Total Pendente:</span>
          <span className="text-red-600 font-semibold">
            R$ {totalPendente.toFixed(2).replace('.', ',')}
          </span>
        </div>

        <div className="flex justify-between border-t border-t-primary pt-2 mt-2">
          <span className="font-bold text-primary">Total:</span>
          <span className="font-bold">
            R$ {(totalPago + totalPendente).toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>
    </div>

 
    </>
  ) : (
    <p className="mt-4 text-center text-gray-500">Nenhum agendamento encontrado.</p>
  )}
</div>

  );
};

export default HistoricoDoCliente;
