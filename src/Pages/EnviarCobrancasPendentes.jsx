
import React, { useEffect, useState } from "react";
import BotaoEnviarCobranca from "../Componentes/BotaoEnviarCobranca/BotaoEnviarCobranca.jsx";
import { getAgendamentosPendentes } from "../api/supabaseClient.js";
//import formatarTelefoneExibicao from "../Componentes/Utilitarios/formatarTelefone.js";
import Header from "../Componentes/Header/Header.jsx";
import { formatarTelefoneBR, whatsappLink, formatarDataBR} from "../Componentes/Utilitarios/formadores.js";

function formatarValorBR(valor) {
  const n = Number(valor);
  if (Number.isFinite(n)) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
  }
  return valor ?? "-";
}

export default function EnviarCobrancasPendentes() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [statusEnvio, setStatusEnvio] = useState({});

  useEffect(() => {
    async function carregarAgendamentos() {
      const resultado = await getAgendamentosPendentes();

      
      setAgendamentos(resultado || []);
    }
    carregarAgendamentos();
  }, []);


  const atualizarStatus = (id, status) => {
    setStatusEnvio((prev) => ({ ...prev, [id]: status }));
  };

  return (
    <>
    <Header/>
    <div className="container mx-auto p-4 space-y-4">
      <div className="w-full max-w-[100%] mx-auto border border-[rgba(128,128,128,0.3)] p-4 rounded-lg bg-gray-50 shadow-lg">
        <h1 className="text-lg font-bold text-primary mb-3">Cobranças Pendentes</h1>

        {/* DESKTOP (>= sm): TABELA */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border min-w-[700px] text-left">
            <thead className="bg-gray-100 text-sm uppercase text-gray-600 font-bold">
              <tr>
                <th className="border p-2">Cliente</th>
                <th className="border p-2">Telefone</th>
                <th className="border p-2">Valor</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {agendamentos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-sm text-gray-600">
                    Nenhuma cobrança pendente.
                  </td>
                </tr>
              ) : (
                agendamentos.map((a) => (
                  <tr key={a.id} className="border">
                    <td className="p-2">{a.clientes?.nome || "Sem nome"}</td>
                    <td className="p-2">{formatarTelefoneBR(a.clientes?.telefone) || "Sem telefone"}</td>
                    <td className="p-2">{formatarValorBR(a.valor)}</td>
                    <td className="p-2">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full bg-red-600 text-white font-semibold tracking-wide ${
                          a.pagamento === "Pendente"
                           
                           
                        }`}
                      >
                        {/*{a.pagamento || "-"}*/}
                        Pendente
                      </span>
                    </td>
                    <td className="p-2">
                      <BotaoEnviarCobranca
                        agendamento={a}
                        atualizarStatus={atualizarStatus}
                        status={statusEnvio[a.id]}
                        disabled={!whatsappLink(a.clientes?.telefone)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE (< sm): CARDS */}
        <div className="grid gap-3 sm:hidden">
          {agendamentos.length === 0 ? (
            <div className="border rounded-lg p-3 bg-white shadow text-center text-sm text-gray-600">
              Nenhuma cobrança pendente.
            </div>
          ) : (
            agendamentos.map((a) => (
              <div
                key={a.id}
                className="card-pendente"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">{a.clientes?.nome || "Sem nome"}</h2>

                  <span className="badge-pendente">
                    Pendente
                  </span>
                </div>

                <div className="mt-2 text-sm text-gray-500 space-y-1">
                  {/* <p><strong>Telefone:</strong> {formatarTelefoneBR(a.clientes?.telefone) || "Sem telefone"}</p>
                  <p><strong>Valor:</strong> {formatarValorBR(a.valor)}</p>
                  <p><strong>Serviço:</strong> {a.servico || "-"}</p>
                  <p><strong>Data:</strong> {a.data || "-"}</p>
                  <p><strong>Horário:</strong> {a.horario || "-"}</p> */}
                  <p className="text-xs text-gray-500">
                    Atendimento em {a.data}, às {a.horario}
                  </p>
                </div>

                <div className="mt-3 flex justify-end">
                  <BotaoEnviarCobranca
                    agendamento={a}
                    atualizarStatus={atualizarStatus}
                    status={statusEnvio[a.id]}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </>
  );
}
