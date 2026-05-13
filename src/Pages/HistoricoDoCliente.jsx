import { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';

import { createLogger } from '../lib/logger';
const logger = createLogger('HistoricoDoCliente');

const HistoricoDoCliente = ({ clienteId, onResumoFinanceiro }) => {
  const [agendamentos, setAgendamentos] = useState([]);

  useEffect(() => {
    const buscarAgendamentos = async () => {
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('data', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar agendamentos:', error);
      } else {
        setAgendamentos(data);
      }
    };

    if (clienteId) {
      buscarAgendamentos();
    }
  }, [clienteId]);

  useEffect(() => {
    agendamentos.forEach((item) => {
      console.log(
        'VALOR ORIGINAL:',
        item.valor,
        ' -> PARSED:',
        parseValor(item.valor)
      );
    });
  }, [agendamentos]);

  const parseValor = (valor) => {
    if (!valor) return 0;

    const limpo = valor
      .toString()
      .replace('R$', '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    const convertido = parseFloat(limpo);

    return isNaN(convertido) ? 0 : convertido;
  };

  const normalizarTexto = (texto) =>
    texto
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const pagamentoPendente = (pagamento) => {
    const texto = normalizarTexto(pagamento);

    return (
      texto === 'pendente' || texto === 'nao pagou' || texto === 'nao_pago'
    );
  };

  const totalPago = agendamentos
    .filter((item) => !pagamentoPendente(item.pagamento))
    .reduce((acc, item) => acc + parseValor(item.valor), 0);

  const totalPendente = agendamentos
    .filter((item) => pagamentoPendente(item.pagamento))
    .reduce((acc, item) => acc + parseValor(item.valor), 0);

  const totalAtendimentos = agendamentos.length;

  const ultimoAtendimento = agendamentos[0]?.data
    ? new Date(agendamentos[0].data + 'T12:00:00').toLocaleDateString('pt-BR')
    : '-';

  useEffect(() => {
    onResumoFinanceiro?.({
      totalPago,
      totalPendente,
      totalAtendimentos,
      ultimoAtendimento,
    });
  }, [
    totalPago,
    totalPendente,
    totalAtendimentos,
    ultimoAtendimento,
    onResumoFinanceiro,
  ]);
  return (
    <div>
      <div className="overflow-x-auto">
        {agendamentos.length > 0 ? (
          <>
            <table className="w-full rounded border bg-white">
              <thead className="bg-azulzinho text-sm uppercase text-primary">
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
            {/* Resumo Financeiro */}
            {/* <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold uppercase text-secondary">
                Resumo Financeiro
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-green-100 bg-green-50 p-3">
                  <p className="text-xs uppercase text-gray-500">Total Pago</p>

                  <p className="text-lg font-bold text-green-600">
                    R$ {totalPago.toFixed(2).replace('.', ',')}
                  </p>
                </div>

                <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                  <p className="text-xs uppercase text-gray-500">
                    Total Pendente
                  </p>

                  <p className="text-lg font-bold text-red-600">
                    R$ {totalPendente.toFixed(2).replace('.', ',')}
                  </p>
                </div>

                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                  <p className="text-xs uppercase text-gray-500">
                    Atendimentos
                  </p>

                  <p className="text-lg font-bold text-primary">
                    {totalAtendimentos}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs uppercase text-gray-500">
                    Último Atendimento
                  </p>

                  <p className="text-lg font-bold text-cinza">
                    {ultimoAtendimento}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-between border-t border-primary pt-3">
                <span className="font-bold text-primary">Total Geral</span>

                <span className="text-lg font-bold">
                  R$ {(totalPago + totalPendente).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div> */}
          </>
        ) : (
          <p className="mt-4 text-center text-gray-500">
            Nenhum agendamento encontrado.
          </p>
        )}
      </div>
    </div>
  );
};

export default HistoricoDoCliente;
