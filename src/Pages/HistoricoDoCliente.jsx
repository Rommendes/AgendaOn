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

  const pagamentoRealizado = (pagamento) => {
    const texto = normalizarTexto(pagamento);

    return texto === 'pix' || texto === 'cartao' || texto === 'dinheiro';
  };

  const agendamentosValidosFinanceiro = agendamentos.filter(
    (item) => item.status_agendamento !== 'cancelado'
  );

  const totalPago = agendamentos
    .filter(
      (item) =>
        item.status_agendamento !== 'cancelado' &&
        pagamentoRealizado(item.pagamento)
    )
    .reduce((acc, item) => acc + parseValor(item.valor), 0);

  const totalPendente = agendamentos
    .filter(
      (item) =>
        item.status_agendamento !== 'cancelado' &&
        pagamentoPendente(item.pagamento)
    )
    .reduce((acc, item) => acc + parseValor(item.valor), 0);

  // const totalAtendimentos = agendamentos.length;

  const totalAtendimentos = agendamentos.filter(
    (item) => item.status_agendamento !== 'cancelado'
  ).length;

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
                  <th className="border px-4 py-2">Situação</th>

                  <th className="border px-4 py-2">Observações</th>
                </tr>
              </thead>
              <tbody>
                {agendamentos.map((item, index) => (
                  <tr key={index} className="text-center hover:bg-gray-100">
                    <td className="border px-4 py-2">
                      {new Date(item.data + 'T12:00:00').toLocaleDateString(
                        'pt-BR'
                      )}
                    </td>
                    <td className="border px-4 py-2">{item.horario}</td>
                    <td className="border px-4 py-2">{item.servico}</td>
                    <td className="border px-4 py-2">
                      R$ {parseValor(item.valor).toFixed(2)}
                    </td>
                    {/* <td className="border px-4 py-2">{item.pagamento}</td> */}
                    <td className="border px-4 py-2">
                      {(() => {
                        const status = item.status_agendamento;
                        const pagamento = normalizarTexto(item.pagamento);

                        if (status === 'cancelado') {
                          return (
                            <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                              Cancelado
                            </span>
                          );
                        }

                        if (status === 'agendado') {
                          return (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                              Agendado
                            </span>
                          );
                        }

                        if (pagamentoPendente(item.pagamento)) {
                          return (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              Pendente
                            </span>
                          );
                        }

                        if (pagamentoRealizado(item.pagamento)) {
                          return (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              {item.pagamento}
                            </span>
                          );
                        }

                        return (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            -
                          </span>
                        );
                      })()}
                    </td>
                    <td className="border px-4 py-2">{item.obs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Resumo Financeiro */}
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
