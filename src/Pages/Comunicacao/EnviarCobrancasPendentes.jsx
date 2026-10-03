import React, { useEffect, useState } from 'react';
import BotaoEnviarCobranca from '../../Componentes/BotaoEnviarCobranca/BotaoEnviarCobranca.jsx';
import {
  getAgendamentosPendentes,
  supabase,
} from '../../api/supabaseClient.js';
import Header from '../../Componentes/Header/Header.jsx';
import {
  formatarTelefoneBR,
  whatsappLink,
  formatarDataBR,
} from '../../Componentes/Utilitarios/formadores.js';
import { Loader2, CircleAlert } from 'lucide-react';

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

  // useEffect(() => {
  //   async function carregarAgendamentos() {
  //     const resultado = await getAgendamentosPendentes();

  //     setAgendamentos(resultado || []);
  //   }
  //   carregarAgendamentos();
  // }, []);

  useEffect(() => {
    async function carregarPendencias() {
      const dados = await getAgendamentosPendentes();
      setAgendamentos(dados || []);

      const { data: historico, error: erroHistorico } = await supabase
        .from('lembretes_enviados')
        .select('agendamento_id, created_at')
        .eq('tipo', 'cobranca_pendente');

      if (erroHistorico) {
        console.error('Erro ao carregar histórico:', erroHistorico);
        return;
      }

      const mapaEnviados = {};
      const mapaQuantidade = {};

      historico?.forEach((item) => {
        mapaEnviados[item.agendamento_id] = item.created_at;

        mapaQuantidade[item.agendamento_id] =
          (mapaQuantidade[item.agendamento_id] || 0) + 1;
      });

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
      <Header title="Cobranças Pendentes" voltarPara="/comunicacao-menu" />
      <div className="main">
        <div className="main-container">
          <div className="container-formulario text-primary">
            <div className="mb-10">
              <h1 className="flex gap-2 text-primary">
                <CircleAlert size={24} className="text-secondary" />
                Clientes com Pendencias de Pagamento
              </h1>
              <p className="mb-4 text-sm text-cinza/80">
                Aqui você pode enviar cobranças pendentes para os clientes que
                ainda não realizaram o pagamento.
              </p>
            </div>
            <div className="container-formulario">
              {/* mb-5 flex gap-2 border-b text-primary */}

              {/* DESKTOP (>= sm): TABELA */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[700px] border text-left">
                  <thead className="bg-alternativo/10 text-sm font-bold uppercase text-primary">
                    <tr>
                      <th className="border p-2">Cliente</th>
                      <th className="border p-2">Telefone</th>
                      <th className="border p-2">Valor</th>
                      <th className="border p-2">Status</th>
                      <th className="border p-2">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="text-cinza/80">
                    {agendamentos.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-4 text-center text-sm text-cinza/80"
                        >
                          Nenhuma cobrança pendente.
                        </td>
                      </tr>
                    ) : (
                      agendamentos.map((a) => (
                        <tr key={a.id} className="border">
                          <td className="p-2">
                            {a.clientes?.nome || 'Sem nome'}
                          </td>
                          <td className="p-2">
                            {formatarTelefoneBR(a.clientes?.telefone) ||
                              'Sem telefone'}
                          </td>
                          <td className="p-2">{formatarValorBR(a.valor)}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Loader2
                                className="h-8 w-8 animate-spin text-danger"
                                size={40}
                              />
                              <span className="text-sm text-danger">
                                aguardando...
                              </span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="mt-2 space-y-1 text-sm text-cinza"></div>

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
                                <p className="text-gray-500">
                                  {(quantidadeCobrancas[a.id] || 1) === 1
                                    ? '1 cobrança já enviada'
                                    : `${quantidadeCobrancas[a.id]} cobranças enviadas`}
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
              <div className="grid gap-3 md:hidden">
                {agendamentos.length === 0 ? (
                  <div className="rounded-lg border bg-white p-3 text-center text-sm text-cinza/80 shadow">
                    Nenhuma cobrança pendente.
                  </div>
                ) : (
                  agendamentos.map((a) => (
                    <div key={a.id} className="card-pendente">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-primary">
                          {a.clientes?.nome || 'Sem nome'}
                        </h2>

                        <div className="flex gap-2 text-secondary">
                          <Loader2
                            className="animate-spin"
                            size={24}
                            aria-label="Pagamento pendente"
                          >
                            <title>Pagamento pendente</title>
                          </Loader2>
                          aguardando...
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] gap-2 rounded-lg bg-gray-50 p-3">
                        <div className="min-w-0">
                          <p className="mb-1 text-xs text-cinza">Telefone</p>

                          <p className="flex h-9 items-center truncate text-sm font-medium text-cinza">
                            {formatarTelefoneBR(a.clientes?.telefone) ||
                              'Sem telefone'}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="mb-1 text-xs text-gray-500">Valor</p>

                          <p className="flex h-9 items-center whitespace-nowrap text-sm font-semibold text-danger">
                            {formatarValorBR(a.valor)}
                          </p>
                        </div>

                        <div>
                          <p className="mb-1 text-xs text-cinza">Ação</p>

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
                        </div>
                      </div>
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
                              : `${quantidadeCobrancas[a.id]} cobranças enviadas`}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
