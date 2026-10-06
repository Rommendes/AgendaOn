import { Link } from 'react-router-dom';
import Header from '../../Componentes/Header/Header.jsx';
import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabaseClient.js';
import {
  SquareCheckBig,
  Scissors,
  CalendarDays,
  ReceiptText,
  BadgeDollarSign,
  ArrowLeft,
} from 'lucide-react';

function Pagamentos() {
  const [pendentes, setPendentes] = useState([]);
  const [pagos, setPagos] = useState([]);

  const [formaPagamento, setFormaPagamento] = useState({});

  const [mostrarConfirmacao, setMostrarConfirmacao] = useState({});
  useEffect(() => {
    buscarPendentes();
  }, []);

  const [resumoFinanceiro, np] = useState({
    recebidoMes: 0,
    pendente: 0,
    clientesDevedores: 0,
    concluidos: 0,
  });

  const recebidoNoMes = pagos.reduce((total, item) => {
    return total + Number(item.valor || 0);
  }, 0);

  async function buscarPendentes() {
    const { data, error } = await supabase
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
      .eq('pagamento', 'Pendente')
      .neq('status_agendamento', 'cancelado')
      .order('data', { ascending: true });

    if (error) {
      console.error('Erro ao buscar pendentes:', error);
      return;
    }

    setPendentes(data || []);
  }

  async function registrarPagamento(agendamentoId, tipoPagamento) {
    if (!agendamentoId || !tipoPagamento) return;

    const { error } = await supabase
      .from('agendamentos')
      .update({
        pagamento: tipoPagamento,
        data_pagamento: new Date().toISOString(),
      })
      .eq('id', agendamentoId);

    if (error) {
      console.error('Erro ao registrar pagamento:', error);
      return;
    }

    await buscarPendentes();

    setFormaPagamento({});
    setMostrarConfirmacao({});
  }

  return (
    <>
      <Header title="Pagamentos" voltarPara="/financeiro-menu" />

      <main className="main">
        <div className="main-container">
          <div className="container-formulario">
            <div className="border-primary/30pb-1 mb-8 border-b">
              <h1 className="flex gap-2 text-primary">
                <ReceiptText className="text-secondary" size={24} />
                Pagamentos pendentes
              </h1>

              <p className="mt-1 text-sm text-cinza/80">
                Selecione a forma de pagamento para registrar o recebimento.
              </p>
            </div>
            <div className="mb-5 flex justify-end">
              <Link
                to="/agenda"
                className="btn-icone flex h-10 w-auto items-center justify-center gap-1 rounded border border-secondary px-2 text-sm font-medium text-secondary hover:bg-primary/5 hover:text-primary"
                aria-label="Voltar para Agenda"
              >
                <ArrowLeft size={18} />
                Voltar para Agenda
              </Link>
            </div>

            <section className="">
              <div className="mb-2 flex items-center gap-4">
                <h2 className="text-primary">Recebimentos pendentes</h2>

                <span className="rounded-full bg-danger/10 px-3 py-1 text-sm font-medium text-danger">
                  {pendentes.length}
                </span>
              </div>

              {pendentes.length === 0 ? (
                <div className="rounded-xl bg-success/10 p-5 text-center">
                  <p className="font-medium text-green-700">
                    Todos os pagamentos estão em dia.
                  </p>

                  <p className="mt-1 text-sm text-success">
                    Não existem recebimentos pendentes no momento.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {pendentes.map((item) => (
                    <div
                      key={item.id}
                      className="border-primary/30bg-white rounded-xl border p-4 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-primary">
                            {item.clientes?.nome || 'Cliente sem nome'}
                          </p>

                          <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                            <Scissors
                              size={15}
                              className="font-bold text-secondary"
                            />
                            {item.servico}
                          </p>
                        </div>

                        <p className="flex items-center gap-1 whitespace-nowrap font-semibold text-red-600">
                          <BadgeDollarSign size={17} />

                          {Number(item.valor || 0).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </p>
                      </div>

                      <p className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                        <CalendarDays
                          size={15}
                          className="font-bold text-secondary"
                        />

                        {new Date(item.data + 'T12:00:00').toLocaleDateString(
                          'pt-BR'
                        )}

                        <span className="font-bold text-secondary">•</span>

                        {item.horario}
                      </p>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                          className="input-padrao w-full cursor-pointer sm:max-w-[240px]"
                          value={formaPagamento[item.id] || ''}
                          onChange={(e) => {
                            setFormaPagamento((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }));

                            setMostrarConfirmacao((prev) => ({
                              ...prev,
                              [item.id]: Boolean(e.target.value),
                            }));
                          }}
                        >
                          <option value="">Selecione o pagamento</option>
                          <option value="Pix">Pix</option>
                          <option value="Cartão">Cartão</option>
                          <option value="Dinheiro">Dinheiro</option>
                        </select>

                        {mostrarConfirmacao[item.id] && (
                          <button
                            type="button"
                            onClick={() =>
                              registrarPagamento(
                                item.id,
                                formaPagamento[item.id]
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary"
                          >
                            <SquareCheckBig size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export default Pagamentos;
