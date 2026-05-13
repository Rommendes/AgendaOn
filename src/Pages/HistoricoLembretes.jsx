import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import Header from "../Componentes/Header/Header";
import { enviarLembreteDeAgendamento } from "../utils/whatsapp";

const HistoricoLembretes = () => {
  const [lembretes, setLembretes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarHistorico = async () => {
      setCarregando(true);

      const { data, error } = await supabase
        .from("lembretes_enviados")
        .select(`
            id,
            cliente_nome,
            telefone,
            mensagem,
            tipo,
            status,
            enviado_em,
            agendamentos (
                data,
                horario,
                servico,
                valor
            )
            `)
        .order("enviado_em", { ascending: false });

      if (error) {
        console.error("Erro ao buscar histórico:", error);
      } else {
        setLembretes(data || []);
      }

      setCarregando(false);
    };

    buscarHistorico();
  }, []);

  const formatarDataHora = (data) => {
    if (!data) return "";

    return new Date(data).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };
const traduzirTipo = (tipo) => {
  if (tipo === "lembrete_agendamento") return "Lembrete de atendimento";
  return tipo;
};

const traduzirStatus = (status) => {
  if (status === "aberto_whatsapp") return "Enviado via WhatsApp";
  return status;
};


  return (
    <div className="container mx-auto p-4">
      <Header />

      <div className="bg-gray-50 border border-gray-200 rounded-xl shadow p-4 mt-4">
        <h1 className="text-xl font-semibold text-primary mb-4">
          Histórico de lembretes enviados
        </h1>

        {carregando ? (
          <p className="text-gray-600">Carregando histórico...</p>
        ) : lembretes.length === 0 ? (
          <p className="text-gray-600">Nenhum lembrete registrado ainda.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
  <table className="w-full min-w-[900px] border-separate border-spacing-0">
    <thead className="bg-violet-100 text-xs uppercase text-primary">
      <tr>
        <th className="border-b border-violet-200 px-3 py-3 text-left">Cliente</th>
        <th className="border-b border-violet-200 px-3 py-3 text-left">Serviço</th>
        <th className="border-b border-violet-200 px-3 py-3 text-left">Horário</th>
        <th className="border-b border-violet-200 px-3 py-3 text-left">Enviado em</th>
        <th className="border-b border-violet-200 px-3 py-3 text-center">Status</th>
        <th className="border-b border-violet-200 px-3 py-3 text-center">Ação</th>
      </tr>
    </thead>

    <tbody>
      {lembretes.map((item) => {
        const dataEnvio = new Date(item.enviado_em);

        const formatarData = () => {
          const hoje = new Date();
          const ontem = new Date();
          ontem.setDate(ontem.getDate() - 1);

          const isHoje =
            dataEnvio.toDateString() === hoje.toDateString();

          const isOntem =
            dataEnvio.toDateString() === ontem.toDateString();

          if (isHoje) {
            return `Hoje às ${dataEnvio.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}`;
          }

          if (isOntem) {
            return `Ontem às ${dataEnvio.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}`;
          }

          return dataEnvio.toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
          });
        };

        return (
          <tr key={item.id} className="bg-white hover:bg-violet-50/60 transition-colors">
            
            {/* Cliente */}
            <td className="border-b border-gray-200 px-3 py-3 text-sm">
              {item.cliente_nome}
            </td>

            {/* Serviço */}
            <td className="border-b border-gray-200 px-3 py-3 text-sm">
              {item.agendamentos?.servico || "-"}
            </td>

            {/* Horário */}
            <td className="border-b border-gray-200 px-3 py-3 text-sm">
              {item.agendamentos?.horario || "-"}
            </td>

            {/* Data envio */}
            <td className="border-b border-gray-200 px-3 py-3 text-sm">
              {formatarData()}
            </td>

            {/* Status */}
            <td className="border-b border-gray-200 px-3 py-3 text-center">
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                Enviado
              </span>
            </td>

            {/* Ação */}
            <td className="border-b border-gray-200 px-3 py-3 text-center">
                <button
                    className="bg-primary text-white px-3 py-1 rounded-md hover:bg-secondary transition text-sm"
                    onClick={() => {
                        const agendamento = {
                        ...item.agendamentos,
                        clientes: {
                            nome: item.cliente_nome,
                            telefone: item.telefone,
                        },
                        };

                        enviarLembreteDeAgendamento(agendamento);
                    }}
                    >
                    Reenviar
                </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
        )}

      </div>
    </div>
  );
};

export default HistoricoLembretes;