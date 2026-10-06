import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabaseClient';

import { createLogger } from '../../lib/logger';
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
    agendamentos.forEach((item) => {});
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
  const renderizarSituacao = (item) => {
    const status = normalizarTexto(item.status_agendamento);

    if (status === 'cancelado') {
      return (
        <span className="inline-flex rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-cinza/80">
          Cancelado
        </span>
      );
    }

    if (status === 'agendado') {
      return (
        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          Agendado
        </span>
      );
    }

    if (pagamentoPendente(item.pagamento)) {
      return (
        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          Pendente
        </span>
      );
    }

    if (pagamentoRealizado(item.pagamento)) {
      return (
        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          {item.pagamento}
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-cinza/80">
        -
      </span>
    );
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

  const atendimentosConcluidos = agendamentos.filter(
    (item) => item.status_agendamento === 'concluido'
  );

  const totalAtendimentos = atendimentosConcluidos.length;

  const ultimoAtendimentoConcluido = [...atendimentosConcluidos].sort(
    (a, b) => new Date(b.data) - new Date(a.data)
  )[0];

  const ultimoAtendimento = ultimoAtendimentoConcluido?.data
    ? new Date(
        ultimoAtendimentoConcluido.data + 'T12:00:00'
      ).toLocaleDateString('pt-BR')
    : '-';

  useEffect(() => {
    onResumoFinanceiro?.(clienteId, {
      totalPago,
      totalPendente,
      totalAtendimentos,
      ultimoAtendimento,
    });
  }, [
    clienteId,
    totalPago,
    totalPendente,
    totalAtendimentos,
    ultimoAtendimento,
    onResumoFinanceiro,
  ]);
  return (
    <div>
      {agendamentos.length > 0 ? (
        <>
          {/* TABELA — TELAS GRANDES */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full rounded border bg-white">
              <thead className="bg-alternativo/10 text-sm uppercase text-primary">
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
                {agendamentos.map((item) => (
                  <tr
                    key={item.id}
                    className="text-center transition hover:bg-primary/5"
                  >
                    <td className="px-4 py-2">
                      {new Date(`${item.data}T12:00:00`).toLocaleDateString(
                        'pt-BR'
                      )}
                    </td>

                    <td className="px-4 py-2">{item.horario || '-'}</td>

                    <td className="px-4 py-2">{item.servico || '-'}</td>

                    <td className="px-4 py-2">
                      {parseValor(item.valor).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>

                    <td className="px-4 py-2">{renderizarSituacao(item)}</td>

                    <td className="px-4 py-2">{item.obs?.trim() || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CARDS — TELAS PEQUENAS */}
          <div className="grid gap-3 md:hidden">
            {agendamentos.map((item) => (
              <div
                key={item.id}
                className="border-primary/30bg-white rounded-xl border p-4 shadow-sm"
              >
                {/* Data e situação */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-cinza/60">Data</p>

                    <p className="font-semibold text-primary">
                      {new Date(`${item.data}T12:00:00`).toLocaleDateString(
                        'pt-BR'
                      )}
                    </p>
                  </div>

                  {renderizarSituacao(item)}
                </div>

                {/* Informações */}
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <p className="text-xs text-cinza/60">Horário</p>

                    <p className="font-medium text-cinza">
                      {item.horario || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-cinza/60">Valor</p>

                    <p className="font-semibold text-primary">
                      {parseValor(item.valor).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-xs text-cinza/60">Serviço</p>

                    <p className="break-words font-medium text-cinza">
                      {item.servico || 'Não informado'}
                    </p>
                  </div>
                </div>

                {/* Observações */}
                <div className="mt-4 min-h-[64px] rounded-lg border border-cinza/20 bg-gray-50 p-3">
                  <p className="mb-1 text-xs font-medium text-cinza/60">
                    Observações
                  </p>

                  <p className="whitespace-pre-wrap break-words text-sm text-cinza">
                    {item.obs?.trim() || 'Nenhuma observação.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-4 text-center text-cinza/70">
          Nenhum agendamento encontrado.
        </p>
      )}
    </div>
  );
};

export default HistoricoDoCliente;
