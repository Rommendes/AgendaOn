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
      <Header title="Extrato Financeiro" />
      <div className="main">
        <div className="container-formulario">
          <div className="mb-6 lg:flex lg:items-end lg:gap-10 lg:border-b lg:border-cinza/30 lg:pb-4">
            {/* Título e descrição */}
            <div className="border-b border-cinza/30 pb-2 lg:border-b-0 lg:pb-0">
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
                className="btn btn-secondary sm:w-auto"
                aria-label="Exportar PDF"
              >
                <FileText />
              </button>
            </div>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
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

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
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

          <div className="container-formulario mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-primary">Pagamentos do período</h2>

            {pagamentos.length === 0 ? (
              <p className="text-cinza">
                Nenhum pagamento encontrado neste período.
              </p>
            ) : (
              <div className="overflow-x-auto">
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
                        className="border-b border-gray-100 text-sm"
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

                        <td className="px-3 py-3 text-cinza">{item.servico}</td>

                        <td className="px-3 py-3 text-cinza">
                          {item.pagamento}
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
            )}
          </div>
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-primary">Pendências do período</h2>

            {pendencias.length === 0 ? (
              <p className="text-sm text-cinza">
                Nenhuma pendência encontrada neste período.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-secondary/60 text-left text-sm text-cinza">
                      <th className="px-3 py-2 font-medium">Agendamento</th>
                      <th className="px-3 py-2 font-medium">Cliente</th>
                      <th className="px-3 py-2 font-medium">Serviço</th>
                      <th className="px-3 py-2 font-medium">Situação</th>
                      <th className="px-3 py-2 text-right font-medium">
                        Valor
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pendencias.map((item) => (
                      <tr
                        key={item.id}
                        className="border-gray- border-b text-sm"
                      >
                        <td className="px-3 py-3 text-cinza">
                          {new Date(item.data + 'T12:00:00').toLocaleDateString(
                            'pt-BR'
                          )}
                          {' • '}
                          {item.horario}
                        </td>

                        <td className="px-3 py-3 text-primary">
                          {item.clientes?.nome || 'Cliente sem nome'}
                        </td>

                        <td className="px-3 py-3 text-cinza">{item.servico}</td>

                        <td className="px-3 py-3 font-medium uppercase text-red-600">
                          {item.pagamento}
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ExtratoFinanceiro;
