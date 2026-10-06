import Header from '../../Componentes/Header/Header';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient.js';
import { FileText, Receipt } from 'lucide-react';
function ExtratoFinanceiro() {
  const hoje = new Date();

  const [mesSelecionado, setMesSelecionado] = useState(
    `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
  );
  const [pagamentos, setPagamentos] = useState([]);
  const [pendencias, setPendencias] = useState([]);

  // ✅ Resumo do período.
  // ✅ Exportar PDF.
  // ✅ Exportar Excel.
  useEffect(() => {
    async function buscarExtrato() {
      if (!mesSelecionado) return;

      const [ano, mes] = mesSelecionado.split('-').map(Number);

      const inicioMes = new Date(ano, mes - 1, 1);
      const inicioProximoMes = new Date(ano, mes, 1);

      const dataInicialAgendamento = `${mesSelecionado}-01`;

      const dataFinalAgendamento = new Date(ano, mes, 0)
        .toISOString()
        .split('T')[0];

      const { data: pagamentosDoMes, error: erroPagamentos } = await supabase
        .from('agendamentos')
        .select(
          `
        id,
        data,
        horario,
        servico,
        valor,
        pagamento,
        data_pagamento,
        status_agendamento,
        clientes (
          nome,
          telefone
        )
      `
        )
        .neq('status_agendamento', 'cancelado')
        .not('data_pagamento', 'is', null)
        .gte('data_pagamento', inicioMes.toISOString())
        .lt('data_pagamento', inicioProximoMes.toISOString())
        .order('data_pagamento', { ascending: false });

      if (erroPagamentos) {
        console.error('Erro ao buscar pagamentos do extrato:', erroPagamentos);
        return;
      }

      const { data: pendenciasDoMes, error: erroPendencias } = await supabase
        .from('agendamentos')
        .select(
          `
        id,
        data,
        horario,
        servico,
        valor,
        pagamento,
        status_agendamento,
        clientes (
          nome,
          telefone
        )
      `
        )
        .neq('status_agendamento', 'cancelado')
        .eq('pagamento', 'Pendente')
        .gte('data', dataInicialAgendamento)
        .lte('data', dataFinalAgendamento)
        .order('data', { ascending: false });

      if (erroPendencias) {
        console.error('Erro ao buscar pendências do extrato:', erroPendencias);
        return;
      }

      setPagamentos(pagamentosDoMes || []);
      setPendencias(pendenciasDoMes || []);
    }

    buscarExtrato();
  }, [mesSelecionado]);

  const totalRecebido = pagamentos.reduce(
    (total, item) => total + Number(item.valor || 0),
    0
  );

  const totalPendente = pendencias.reduce(
    (total, item) => total + Number(item.valor || 0),
    0
  );

  {
    /*Função para exportar o extrato como PDF */
  }
  function exportarPDF() {
    const documento = new jsPDF();

    const [ano, mes] = mesSelecionado.split('-');
    const nomePeriodo = new Date(
      Number(ano),
      Number(mes) - 1,
      1
    ).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });

    const formatarValor = (valor) =>
      Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

    documento.setFontSize(18);
    documento.setTextColor(13, 76, 133);
    documento.text('Extrato Financeiro', 14, 18);

    documento.setFontSize(11);
    documento.setTextColor(90, 90, 90);
    documento.text(`Período: ${nomePeriodo}`, 14, 26);

    documento.setFontSize(12);
    documento.setTextColor(13, 76, 133);
    documento.text(`Total recebido: ${formatarValor(totalRecebido)}`, 14, 38);

    documento.setTextColor(243, 108, 33);
    documento.text(`Total pendente: ${formatarValor(totalPendente)}`, 14, 46);

    documento.setFontSize(14);
    documento.setTextColor(13, 76, 133);
    documento.text('Pagamentos do período', 14, 60);

    autoTable(documento, {
      startY: 65,
      head: [['Pagamento', 'Cliente', 'Serviço', 'Forma', 'Valor']],
      body: pagamentos.map((item) => [
        new Date(item.data_pagamento).toLocaleString('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
        item.clientes?.nome || 'Cliente sem nome',
        item.servico || '',
        item.pagamento || '',
        formatarValor(item.valor),
      ]),
      styles: {
        fontSize: 9,
      },
      headStyles: {
        fillColor: [13, 76, 133],
      },
    });

    const inicioPendencias = documento.lastAutoTable.finalY + 12;

    documento.setFontSize(14);
    documento.setTextColor(13, 76, 133);
    documento.text('Pendências do período', 14, inicioPendencias);

    autoTable(documento, {
      startY: inicioPendencias + 5,
      head: [['Agendamento', 'Cliente', 'Serviço', 'Situação', 'Valor']],
      body: pendencias.map((item) => [
        `${new Date(`${item.data}T12:00:00`).toLocaleDateString('pt-BR')} • ${
          item.horario || ''
        }`,
        item.clientes?.nome || 'Cliente sem nome',
        item.servico || '',
        item.pagamento || 'Pendente',
        formatarValor(item.valor),
      ]),
      styles: {
        fontSize: 9,
      },
      headStyles: {
        fillColor: [243, 108, 33],
      },
    });

    documento.save(`extrato-financeiro-${mesSelecionado}.pdf`);
  }

  return (
    <>
      <Header title="Extrato Financeiro" voltarPara="/financeiro-menu" />
      <div className="main">
        <div className="main-container">
          <div className="container-formulario">
            <div className="lg:border-primary/30lg:pb-4 mb-6 lg:flex lg:items-end lg:gap-10 lg:border-b">
              {/* Título e descrição */}
              <div className="border-primary/30pb-2 border-b lg:border-b-0 lg:pb-0">
                <h1 className="flex gap-2 text-primary">
                  <Receipt className="text-secondary" />
                  Extrato Financeiro
                </h1>

                <p className="text-sm text-primary">
                  Consulte pagamentos e pendências de períodos anteriores.
                </p>
              </div>

              {/* Mês e botão */}
              <div className="mt-6 flex items-end gap-3 lg:mt-0">
                <div>
                  <label className="mb-1 block text-sm text-primary">
                    Selecione o mês
                  </label>

                  <input
                    type="month"
                    value={mesSelecionado}
                    onChange={(e) => setMesSelecionado(e.target.value)}
                    className="rounded-lg border border-primary bg-white px-3 py-2 text-sm text-cinza focus:border-secondary focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  title="Exportar PDF"
                  onClick={exportarPDF}
                  className="btn-icone flex h-10 w-auto items-center justify-center gap-1 rounded border border-secondary px-2 text-sm font-medium text-secondary hover:bg-primary/5 hover:text-primary"
                  aria-label="Exportar PDF"
                >
                  <FileText />
                  PDF
                </button>
              </div>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="border-primary/30bg-white rounded-lg border p-4 shadow-sm">
                <p className="text-primary">Pagamentos encontrados</p>
                <p className="text-2xl font-bold text-cinza">
                  {pagamentos.length}
                </p>
                <p className="text-cinza">
                  {totalRecebido.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>

              <div className="border-primary/30bg-white rounded-lg border p-4 shadow-sm">
                <p className="text-primary">Pendências encontradas</p>
                <p className="text-2xl font-bold text-red-600">
                  {pendencias.length}
                </p>
                <p className="mt-1 font-medium text-cinza">
                  {totalPendente.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
            </div>

            {/* PAGAMENTOS DO PERÍODO */}
            <div className="border-primary/30bg-white mb-6 rounded-lg border p-4 shadow-sm">
              <h2 className="mb-3 text-primary">Pagamentos do período</h2>

              {pagamentos.length === 0 ? (
                <p className="text-sm text-cinza">
                  Nenhum pagamento encontrado neste período.
                </p>
              ) : (
                <>
                  {/* TABELA DE PAGAMENTOS — TELAS GRANDES */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[700px]">
                      <thead>
                        <tr className="border-b border-secondary/60 text-left text-sm text-cinza">
                          <th className="px-3 py-2 font-medium">Pagamento</th>
                          <th className="px-3 py-2 font-medium">Cliente</th>
                          <th className="px-3 py-2 font-medium">Serviço</th>
                          <th className="px-3 py-2 font-medium">Forma</th>
                          <th className="px-3 py-2 text-right font-medium">
                            Valor
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {pagamentos.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-cinza/20 text-sm"
                          >
                            <td className="px-3 py-3 text-cinza">
                              {new Date(item.data_pagamento).toLocaleString(
                                'pt-BR',
                                {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                }
                              )}
                            </td>

                            <td className="px-3 py-3 text-primary">
                              {item.clientes?.nome || 'Cliente sem nome'}
                            </td>

                            <td className="px-3 py-3 text-cinza">
                              {item.servico || 'Não informado'}
                            </td>

                            <td className="px-3 py-3 text-cinza">
                              {item.pagamento || 'Não informado'}
                            </td>

                            <td className="px-3 py-3 text-right font-medium text-primary">
                              {Number(item.valor || 0).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* CARDS DE PAGAMENTOS — TELAS PEQUENAS */}
                  <div className="grid gap-3 md:hidden">
                    {pagamentos.map((item) => (
                      <div
                        key={item.id}
                        className="border-primary/30bg-white rounded-xl border p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* <div className="min-w-0">
                            <p className="text-xs text-cinza/70">Cliente</p>

                            <h3 className="break-words font-semibold text-primary">
                              {item.clientes?.nome || 'Cliente sem nome'}
                            </h3>
                          </div> */}
                          <div className="min-w-0">
                            <p className="text-xs text-cinza/70">Cliente</p>

                            <h3 className="break-words font-semibold text-primary">
                              {item.clientes?.nome || 'Cliente sem nome'}
                            </h3>

                            <div className="mt-2">
                              <p className="text-xs text-cinza/70">
                                Data do pagamento
                              </p>

                              <p className="text-sm text-cinza">
                                {new Date(item.data_pagamento).toLocaleString(
                                  'pt-BR',
                                  {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                  }
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="font-semibold text-success">
                              {Number(item.valor || 0).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </p>

                            <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              {item.pagamento || 'Não informado'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3 text-sm">
                          <div>
                            <p className="text-xs text-cinza/70">Data</p>

                            <p className="text-cinza">
                              {new Date(
                                `${item.data}T12:00:00`
                              ).toLocaleDateString('pt-BR')}
                            </p>
                          </div>

                          <div className="mt-3 text-sm">
                            <p className="text-xs text-cinza/70">Serviço</p>

                            <p className="break-words text-cinza">
                              {item.servico || 'Não informado'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* PENDÊNCIAS DO PERÍODO */}
            <div className="border-primary/30bg-white mb-6 rounded-lg border p-4 shadow-sm">
              <h2 className="mb-3 text-primary">Pendências do período</h2>

              {pendencias.length === 0 ? (
                <p className="text-sm text-cinza">
                  Nenhuma pendência encontrada neste período.
                </p>
              ) : (
                <>
                  {/* TABELA DE PENDÊNCIAS — TELAS GRANDES */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[700px]">
                      <thead>
                        <tr className="border-b border-secondary/60 text-left text-sm text-cinza">
                          <th className="px-3 py-2 font-medium">Data</th>
                          <th className="px-3 py-2 font-medium">Cliente</th>
                          <th className="px-3 py-2 font-medium">Serviço</th>
                          <th className="px-3 py-2 font-medium">Status</th>
                          <th className="px-3 py-2 text-right font-medium">
                            Valor
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {pendencias.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-cinza/20 text-sm"
                          >
                            <td className="px-3 py-3 text-cinza">
                              {new Date(
                                `${item.data}T12:00:00`
                              ).toLocaleDateString('pt-BR')}
                            </td>

                            <td className="px-3 py-3 text-primary">
                              {item.clientes?.nome || 'Cliente sem nome'}
                            </td>

                            <td className="px-3 py-3 text-cinza">
                              {item.servico || 'Não informado'}
                            </td>

                            <td className="px-3 py-3 font-medium text-danger">
                              {item.pagamento || 'Pendente'}
                            </td>

                            <td className="px-3 py-3 text-right font-medium text-danger">
                              {Number(item.valor || 0).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* CARDS DE PENDÊNCIAS — TELAS PEQUENAS */}
                  <div className="grid gap-3 md:hidden">
                    {pendencias.map((item) => (
                      <div
                        key={item.id}
                        className="border-primary/30border-l-danger rounded-xl border bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* <div className="min-w-0">
                            <p className="text-xs text-cinza/70">Cliente</p>

                            <h3 className="break-words font-semibold text-primary">
                              {item.clientes?.nome || 'Cliente sem nome'}
                            </h3>
                          </div> */}
                          <div className="min-w-0">
                            <p className="text-xs text-cinza/70">Cliente</p>

                            <h3 className="break-words font-semibold text-primary">
                              {item.clientes?.nome || 'Cliente sem nome'}
                            </h3>

                            <div className="mt-2">
                              <p className="text-xs text-cinza/70">Data</p>

                              <p className="text-sm text-cinza">
                                {new Date(
                                  `${item.data}T12:00:00`
                                ).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="font-semibold text-danger">
                              {Number(item.valor || 0).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </p>

                            <span className="mt-1 inline-flex rounded-full bg-danger/10 px-2 py-1 text-xs font-semibold text-danger">
                              {item.pagamento || 'Pendente'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                          <div>
                            <p className="text-xs text-cinza/70">Data</p>

                            <p className="text-cinza">
                              {new Date(
                                `${item.data}T12:00:00`
                              ).toLocaleDateString('pt-BR')}
                            </p>
                          </div>

                          {/* <div>
                            <p className="text-xs text-cinza/70">Status</p>

                            <span className="inline-flex rounded-full bg-danger/10 px-2 py-1 text-xs font-semibold text-danger">
                              {item.pagamento || 'Pendente'}
                            </span>
                          </div> */}

                          <div className="col-span-2">
                            <p className="text-xs text-cinza/70">Serviço</p>

                            <p className="break-words text-cinza">
                              {item.servico || 'Não informado'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ExtratoFinanceiro;
