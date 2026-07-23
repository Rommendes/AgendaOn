import React, { useEffect, useState } from 'react';
import BotaoEnviarCobranca from '../../Componentes/BotaoEnviarCobranca/BotaoEnviarCobranca.jsx';
import {
  getAgendamentosPendentes,
  supabase,
} from '../../api/supabaseClient.js';
//import formatarTelefoneExibicao from "../Componentes/Utilitarios/formatarTelefone.js";
import Header from '../../Componentes/Header/Header.jsx';
import {
  formatarTelefoneBR,
  whatsappLink,
  formatarDataBR,
} from '../../Componentes/Utilitarios/formadores.js';

function formatarValorBR(valor) {
  const n = Number(valor);
  if (Number.isFinite(n)) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(n);
  }
  return valor ?? '-';
}

export default function EnviarCobrancasPendentes() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [statusEnvio, setStatusEnvio] = useState({});
  const [cobrancasEnviadas, setCobrancasEnviadas] = useState({});
  const [quantidadeCobrancas, setQuantidadeCobrancas] = useState({});

  useEffect(() => {
    async function carregarAgendamentos() {
      const resultado = await getAgendamentosPendentes();

      setAgendamentos(resultado || []);
    }
    carregarAgendamentos();
  }, []);

  useEffect(() => {
    async function carregarPendencias() {
      const dados = await getAgendamentosPendentes();
      setAgendamentos(dados);

      const { data: historico } = await supabase
        .from('lembretes_enviados')
        .select('agendamento_id, enviado_em')
        .eq('tipo', 'cobranca_pendente');

      const mapaEnviados = {};
      const mapaQuantidade = {};

      historico?.forEach((item) => {
        mapaEnviados[item.agendamento_id] = item.enviado_em;

        mapaQuantidade[item.agendamento_id] =
          (mapaQuantidade[item.agendamento_id] || 0) + 1;
      });

      console.log('HISTÓRICO COBRANÇAS:', historico);
      console.log('QUANTIDADE COBRANÇAS:', mapaQuantidade);

      setCobrancasEnviadas(mapaEnviados);
      setQuantidadeCobrancas(mapaQuantidade);
    }

    carregarPendencias();
  }, []);
  const atualizarStatus = (id, status) => {
    setStatusEnvio((prev) => ({ ...prev, [id]: status }));
  };

  return (
    <>
      <Header />
      <div className="container mx-auto space-y-4 p-4">
        <div className="mx-auto w-full max-w-[100%] rounded-lg border border-[rgba(128,128,128,0.3)] bg-gray-50 p-4 shadow-lg">
          <h1 className="mb-3 text-lg font-bold text-primary">
            Cobranças Pendentes
          </h1>

          {/* DESKTOP (>= sm): TABELA */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[700px] border text-left">
              <thead className="bg-gray-100 text-sm font-bold uppercase text-gray-600">
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
                    <td
                      colSpan={5}
                      className="p-4 text-center text-sm text-gray-600"
                    >
                      Nenhuma cobrança pendente.
                    </td>
                  </tr>
                ) : (
                  agendamentos.map((a) => (
                    <tr key={a.id} className="border">
                      <td className="p-2">{a.clientes?.nome || 'Sem nome'}</td>
                      <td className="p-2">
                        {formatarTelefoneBR(a.clientes?.telefone) ||
                          'Sem telefone'}
                      </td>
                      <td className="p-2">{formatarValorBR(a.valor)}</td>
                      <td className="p-2">
                        <span
                          className={`rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white ${
                            a.pagamento === 'Pendente'
                          }`}
                        >
                          {/*{a.pagamento || "-"}*/}
                          Pendente
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="mt-2 space-y-1 text-sm text-gray-500">
                          {/* <p className="mt-2 space-y-1 text-sm text-gray-500">
                            Atendimento em{' '}
                            {new Date(cobrancasEnviadas[a.id]).toLocaleString(
                              'pt-BR',
                              {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              }
                            )}
                          </p> */}
                        </div>

                        <BotaoEnviarCobranca
                          agendamento={a}
                          atualizarStatus={atualizarStatus}
                          status={statusEnvio[a.id]}
                          label={
                            cobrancasEnviadas[a.id]
                              ? 'Reenviar cobrança'
                              : 'Enviar cobrança'
                          }
                          disabled={!whatsappLink(a.clientes?.telefone)}
                        />

                        {cobrancasEnviadas[a.id] && (
                          <div className="mt-1 text-xs">
                            <p className="text-green-600">
                              Enviado em{' '}
                              {new Date(cobrancasEnviadas[a.id]).toLocaleString(
                                'pt-BR',
                                {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                }
                              )}
                            </p>

                            <p className="text-gray-500">
                              {(quantidadeCobrancas[a.id] || 1) === 1
                                ? '1 cobrança já enviada'
                                : `${quantidadeCobrancas[a.id]} cobranças já enviadas`}
                            </p>
                          </div>
                        )}
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
              <div className="rounded-lg border bg-white p-3 text-center text-sm text-gray-600 shadow">
                Nenhuma cobrança pendente.
              </div>
            ) : (
              agendamentos.map((a) => (
                <div key={a.id} className="card-pendente">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">
                      {a.clientes?.nome || 'Sem nome'}
                    </h2>

                    <span className="badge-pendente">Pendente</span>
                  </div>

                  <div className="mt-2 space-y-1 text-sm text-gray-500">
                    <p className="text-xs text-gray-500">
                      Atendimento em {a.data}, às {a.horario}
                    </p>
                  </div>
                  <p className="text-green-600">
                    Atendimento em{' '}
                    {new Date(cobrancasEnviadas[a.id]).toLocaleString('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>

                  <BotaoEnviarCobranca
                    agendamento={a}
                    atualizarStatus={atualizarStatus}
                    status={statusEnvio[a.id]}
                    label={
                      cobrancasEnviadas[a.id]
                        ? 'Reenviar cobrança'
                        : 'Enviar cobrança'
                    }
                    disabled={!whatsappLink(a.clientes?.telefone)}
                  />

                  {cobrancasEnviadas[a.id] && (
                    <div className="mt-1 text-xs">
                      <p className="text-green-600">
                        Enviado em{' '}
                        {new Date(cobrancasEnviadas[a.id]).toLocaleString(
                          'pt-BR',
                          {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          }
                        )}
                      </p>

                      <p className="text-gray-500">
                        {(quantidadeCobrancas[a.id] || 1) === 1
                          ? '1 cobrança já enviada'
                          : `${quantidadeCobrancas[a.id]} cobranças já enviadas`}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
