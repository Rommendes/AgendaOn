import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../api/supabaseClient.js';
import Header from '../../Componentes/Header/Header.jsx';
import {
  enviarLembretesEmLote,
  enviarLembreteDeAgendamento,
} from '../../utils/whatsapp.jsx';
import {
  BellRing,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Printer,
} from 'lucide-react';
import { createLogger } from '../../lib/logger.js';
const logger = createLogger('AgendaSemanal');

// --- helpers simples ---
function hojeISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10); // YYYY-MM-DD
}
function formatarBRDataISO(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR');
}

//🟣 telefone válido?
function temTelefone(ag) {
  const tel = (ag?.clientes?.telefone || ag?.telefone || '').toString();
  return tel.replace(/\D/g, '').length >= 10;
}

// 🟣 conta total / com telefone / sem telefone / enviados (usaremos depois)
function contarDia(ags, enviadosSessao = new Set()) {
  const total = ags.length;
  const comTel = ags.filter(temTelefone).length;
  const semTel = total - comTel;
  const enviados = ags.filter((ag) => enviadosSessao.has(String(ag.id))).length; // por enquanto deve dar 0
  return { total, comTel, semTel, enviados };
}

function formatarValorBR(v) {
  if (v == null) return '';
  const n = Number(v);
  return Number.isFinite(n)
    ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : String(v);
}
// retorna { ano, semana } no padrão ISO
function getISOWeekInfo(dateISO) {
  const d = new Date(dateISO + 'T12:00:00');
  // ISO week: quinta-feira como referência
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7; // 0=segunda
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstThursdayDayNr = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstThursdayDayNr + 3);
  const week =
    1 + Math.round((target - firstThursday) / (7 * 24 * 3600 * 1000));
  return { ano: target.getFullYear(), semana: week };
}

export default function AgendaSemanal() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState({
    aberto: false,
    mensagem: '',
  });

  const abrirAviso = (mensagem) => {
    setAviso({
      aberto: true,
      mensagem,
    });
  };

  const fecharAviso = () => {
    setAviso({
      aberto: false,
      mensagem: '',
    });
  };

  const imprimirSemana = (ano, numeroSemana) => {
    const idSemana = `semana-${ano}-${numeroSemana}`;
    const elementoSemana = document.getElementById(idSemana);

    if (!elementoSemana) {
      abrirAviso('Não foi possível localizar esta semana para impressão.');
      return;
    }

    const janelaImpressao = window.open('', '_blank', 'width=900,height=700');

    if (!janelaImpressao) {
      abrirAviso(
        'Não foi possível abrir a impressão. Verifique se o navegador bloqueou a nova janela.'
      );
      return;
    }

    const estilosDaPagina = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style')
    )
      .map((estilo) => estilo.outerHTML)
      .join('');

    janelaImpressao.document.write(`
    <!DOCTYPE html>

    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />

        <title>Agenda — Semana ${numeroSemana} de ${ano}</title>

        ${estilosDaPagina}

        <style>
          body {
            margin: 0;
            padding: 24px;
            background: white;
            color: #2f3136;
            font-family: Poppins, Arial, sans-serif;
          }

          button {
            display: none !important;
          }

          th:last-child,
          td:last-child {
            display: none !important;
          }

          section {
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }

          @page {
            size: A4;
            margin: 15mm;
          }
        </style>
      </head>

      <body>
        <h1 style="margin-bottom: 20px; color: #0D4C85;">
          Agenda Semanal
        </h1>

        ${elementoSemana.outerHTML}
      </body>
    </html>
  `);

    janelaImpressao.document.close();

    janelaImpressao.onload = () => {
      janelaImpressao.focus();
      janelaImpressao.print();
      janelaImpressao.close();
    };
  };
  useEffect(() => {
    (async () => {
      setCarregando(true);
      const { data, error } = await supabase
        .from('agendamentos')
        .select(
          `
          id, data, horario, servico, valor, pagamento, obs, cliente_id,
          clientes ( id, nome, telefone )
        `
        )
        .gte('data', hojeISO()) // somente hoje em diante
        .order('data', { ascending: true })
        .order('horario', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar agendamentos:', error);
        setAgendamentos([]);
      } else {
        setAgendamentos(data || []);
      }
      setCarregando(false);
    })();
  }, []);

  // Agrupa por semana (ISO) e por dia
  const semanas = useMemo(() => {
    const mapa = new Map(); // chave: `${ano}-W${semana}`
    for (const ag of agendamentos) {
      const { ano, semana } = getISOWeekInfo(ag.data);
      const chave = `${ano}-W${String(semana).padStart(2, '0')}`;
      if (!mapa.has(chave)) mapa.set(chave, { ano, semana, dias: new Map() });
      const grupo = mapa.get(chave);

      // agrupar por dia
      if (!grupo.dias.has(ag.data)) grupo.dias.set(ag.data, []);
      grupo.dias.get(ag.data).push(ag);
    }

    // ordenar dias dentro da semana
    const array = Array.from(mapa.values()).map((sem) => {
      const diasOrdenados = Array.from(sem.dias.entries()).sort((a, b) =>
        a[0] < b[0] ? -1 : 1
      ); // por data asc
      return { ...sem, dias: diasOrdenados };
    });

    // ordenar semanas (a partir da atual, já vem asc)
    array.sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano;
      return a.semana - b.semana;
    });

    return array;
  }, [agendamentos]);

  return (
    <>
      <Header voltarPara="/agendamentos-menu" />

      <div className="main">
        <div className="main-container">
          <div className="container-formulario text-primary">
            <div>
              {' '}
              <h1 className="mb-5 flex items-center gap-2 pb-2 text-lg leading-tight text-primary sm:text-2xl">
                <CalendarDays
                  size={22}
                  className="shrink-0 text-secondary sm:h-6 sm:w-6"
                />

                <span>Agenda Semanal (atual e futura)</span>
              </h1>
            </div>

            {carregando && <div className="text-cinza/80">Carregando…</div>}

            {!carregando && semanas.length === 0 && (
              <div className="text-cinza/80">Não há agendamentos futuros.</div>
            )}

            {!carregando &&
              semanas.map((sem) => (
                <section
                  id={`semana-${sem.ano}-${sem.semana}`}
                  key={`${sem.ano}-${sem.semana}`}
                  className="mb-5 rounded-xl border border-primary/30 bg-white pt-5 shadow-sm"
                >
                  {/* Cabeçalho da semana */}
                  <div className="flex h-10 items-center justify-between gap-3 border-primary/30 px-4 sm:ml-3 sm:h-auto sm:p-4">
                    <h2 className="whitespace-nowrap text-lg font-semibold text-primary sm:text-xl">
                      Semana{' '}
                      <span className="font-bold text-secondary">
                        {sem.semana}
                      </span>{' '}
                      de {sem.ano}
                    </h2>

                    {/* Ações da semana */}
                    <div className="flex shrink-0 items-center gap-2">
                      {/* Imprimir semana */}
                      <button
                        type="button"
                        title={`Imprimir a semana ${sem.semana}`}
                        className="btn-icone text-primary"
                        onClick={() => imprimirSemana(sem.ano, sem.semana)}
                        aria-label={`Imprimir a semana ${sem.semana} de ${sem.ano}`}
                      >
                        <Printer size={19} aria-hidden="true" />
                      </button>

                      {/* Enviar lembretes da semana */}
                      <button
                        type="button"
                        title="Enviar lembretes para todos desta semana"
                        className="btn-icone text-secondary"
                        onClick={async () => {
                          const listaSemana = sem.dias.flatMap(
                            ([_, ags]) => ags
                          );

                          const { enviados, copiados } =
                            await enviarLembretesEmLote(listaSemana, {
                              intervalMs: 2000,
                            });

                          abrirAviso(
                            `Semana ${sem.semana}: ${enviados} enviados no WhatsApp${
                              copiados ? `, ${copiados} copiados` : ''
                            }.`
                          );
                        }}
                        aria-label={`Enviar lembretes da semana ${sem.semana}`}
                      >
                        <CalendarRange size={19} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Dias da semana */}
                  <div className="space-y-4 p-2 sm:ml-3 sm:p-4">
                    {sem.dias.map(([dataISO, ags]) => (
                      <div key={dataISO} className="border-t border-primary/30">
                        {/* Cabeçalho do dia */}
                        <div className="flex items-center justify-between gap-3 p-3">
                          <div className="font-semibold text-primary">
                            {formatarBRDataISO(dataISO)}
                          </div>

                          {/* Enviar lembretes do dia */}
                          <button
                            type="button"
                            title="Enviar lembretes para todos deste dia"
                            className="btn-icone text-secondary"
                            onClick={async () => {
                              const { enviados, copiados } =
                                await enviarLembretesEmLote(ags, {
                                  intervalMs: 2000,
                                });

                              abrirAviso(
                                `${formatarBRDataISO(
                                  dataISO
                                )}: ${enviados} enviados${
                                  copiados ? `, ${copiados} copiados` : ''
                                }.`
                              );
                            }}
                            aria-label={`Enviar lembretes do dia ${formatarBRDataISO(
                              dataISO
                            )}`}
                          >
                            <CalendarClock size={19} aria-hidden="true" />
                          </button>
                        </div>

                        {/* Tabela de atendimentos do dia */}
                        <div className="hidden overflow-x-auto p-2 md:block">
                          <table className="w-full table-fixed border-collapse">
                            <colgroup>
                              <col className="w-[14%]" />
                              <col className="w-[30%]" />
                              <col className="w-[38%]" />
                              <col className="w-[18%]" />
                            </colgroup>

                            <thead>
                              <tr className="border bg-primary/10 text-center text-sm font-extrabold uppercase text-primary">
                                <th
                                  scope="col"
                                  className="px-4 py-2 text-xs font-semibold uppercase text-primary"
                                >
                                  Hora
                                </th>

                                <th
                                  scope="col"
                                  className="px-4 py-2 text-xs font-semibold uppercase text-primary"
                                >
                                  Cliente
                                </th>

                                <th
                                  scope="col"
                                  className="px-4 py-2 text-xs font-semibold uppercase text-primary"
                                >
                                  Serviço
                                </th>

                                <th
                                  scope="col"
                                  className="px-2 py-2 text-center text-xs font-semibold uppercase text-primary"
                                >
                                  Lembrete
                                </th>
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                              {ags.map((ag) => (
                                <tr
                                  key={ag.id}
                                  className="transition-colors hover:bg-slate-50"
                                >
                                  {/* Hora */}
                                  <td className="px-4 py-3 align-middle font-semibold text-cinza">
                                    {ag.horario}
                                  </td>

                                  {/* Cliente */}
                                  <td className="break-words px-4 py-3 align-middle text-cinza">
                                    {ag.clientes?.nome || 'Sem nome'}
                                  </td>

                                  {/* Serviço */}
                                  <td className="break-words px-4 py-3 align-middle text-cinza">
                                    {ag.servico || '-'}
                                  </td>

                                  {/* Lembrete individual */}
                                  <td className="px-2 py-3 text-center align-middle">
                                    <button
                                      type="button"
                                      title={`Enviar lembrete para ${
                                        ag.clientes?.nome || 'este cliente'
                                      }`}
                                      className="btn-icone text-secondary"
                                      onClick={async () => {
                                        const resultado =
                                          await enviarLembreteDeAgendamento(ag);

                                        if (resultado === 'copiado') {
                                          abrirAviso(
                                            'Sem telefone. Mensagem copiada para a área de transferência.'
                                          );
                                        }
                                      }}
                                      aria-label={`Enviar lembrete para ${
                                        ag.clientes?.nome || 'este cliente'
                                      }`}
                                    >
                                      <BellRing size={19} aria-hidden="true" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* CARDS — TELAS PEQUENAS */}
                        <div className="grid gap-3 p-2 md:hidden">
                          {ags.map((ag) => (
                            <div
                              key={ag.id}
                              className="rounded-lg bg-primary/10 p-3 shadow-sm"
                            >
                              {/* Horário e lembrete */}
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs text-cinza/60">
                                    Horário
                                  </p>

                                  <p className="font-semibold text-primary">
                                    {ag.horario || '-'}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  title={`Enviar lembrete para ${
                                    ag.clientes?.nome || 'este cliente'
                                  }`}
                                  className="btn-icone shrink-0 text-secondary"
                                  onClick={async () => {
                                    const resultado =
                                      await enviarLembreteDeAgendamento(ag);

                                    if (resultado === 'copiado') {
                                      abrirAviso(
                                        'Sem telefone. Mensagem copiada para a área de transferência.'
                                      );
                                    }
                                  }}
                                  aria-label={`Enviar lembrete para ${
                                    ag.clientes?.nome || 'este cliente'
                                  }`}
                                >
                                  <BellRing size={19} aria-hidden="true" />
                                </button>
                              </div>

                              {/* Cliente */}
                              <div className="mt-3">
                                <p className="text-xs text-cinza/60">Cliente</p>

                                <p className="break-words font-semibold text-primary">
                                  {ag.clientes?.nome || 'Sem nome'}
                                </p>
                              </div>

                              {/* Serviço */}
                              <div className="mt-3">
                                <p className="text-xs text-cinza/60">Serviço</p>

                                <p className="break-words text-sm text-cinza">
                                  {ag.servico || 'Não informado'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
          </div>

          {/* Modal de aviso */}
          {aviso.aberto && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-aviso"
            >
              <div className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2
                    id="titulo-aviso"
                    className="text-lg font-semibold text-primary"
                  >
                    Lembretes
                  </h2>
                </div>

                <div className="px-5 py-5">
                  <p className="text-sm leading-relaxed text-cinza">
                    {aviso.mensagem}
                  </p>
                </div>

                <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3">
                  <button
                    type="button"
                    className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                    onClick={fecharAviso}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
