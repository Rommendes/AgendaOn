import Header from '../../Componentes/Header/Header.jsx';
import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabaseClient.js';
import { Link } from 'react-router-dom';
import {
  Save,
  CreditCard,
  Scissors,
  CalendarDays,
  Wallet,
  UserRound,
  BadgeCheck,
  CircleAlert,
  BadgeDollarSign,
  ChartNoAxesCombined,
} from 'lucide-react';

function ResumoFinanceiro() {
  const [pagos, setPagos] = useState([]);
  useEffect(() => {
    buscarPagos();
    buscarResumoFinanceiro();
  }, []);

  const [resumoFinanceiro, setResumoFinanceiro] = useState({
    recebidoMes: 0,
    pendente: 0,
    clientesDevedores: 0,
    concluidos: 0,
  });

  const recebidoNoMes = pagos.reduce((total, item) => {
    return total + Number(item.valor || 0);
  }, 0);

  async function buscarPagos() {
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
        data_pagamento,
        status_agendamento,
        clientes (
          nome,
          telefone
        )
      `
      )
      .neq('status_agendamento', 'cancelado')
      .neq('pagamento', 'Pendente')
      .not('data_pagamento', 'is', null)
      .order('data_pagamento', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Erro ao buscar pagamentos:', error);
      return;
    }

    setPagos(data || []);
  }

  /*BUSCAR RESUMO FINANCEIRO*/

  async function buscarResumoFinanceiro() {
    const hoje = new Date();

    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const primeiroDiaProximoMes = new Date(
      hoje.getFullYear(),
      hoje.getMonth() + 1,
      1
    );

    const dataInicialAgendamento = primeiroDiaMes.toISOString().split('T')[0];

    const dataFinalAgendamento = new Date(
      hoje.getFullYear(),
      hoje.getMonth() + 1,
      0
    )
      .toISOString()
      .split('T')[0];

    // Busca os agendamentos pendentes do mês
    const { data: agendamentosMes, error: erroAgendamentos } = await supabase
      .from('agendamentos')
      .select('id, valor, pagamento, cliente_id')
      .neq('status_agendamento', 'cancelado')
      .gte('data', dataInicialAgendamento)
      .lte('data', dataFinalAgendamento);

    if (erroAgendamentos) {
      console.error('Erro ao buscar os agendamentos do mês:', erroAgendamentos);
      return;
    }

    // Busca os pagamentos efetivamente registrados no mês
    const { data: pagamentosMes, error: erroPagamentos } = await supabase
      .from('agendamentos')
      .select('id, valor, pagamento, data_pagamento')
      .neq('status_agendamento', 'cancelado')
      .not('data_pagamento', 'is', null)
      .gte('data_pagamento', primeiroDiaMes.toISOString())
      .lt('data_pagamento', primeiroDiaProximoMes.toISOString());

    if (erroPagamentos) {
      console.error('Erro ao buscar os pagamentos do mês:', erroPagamentos);
      return;
    }

    const pendentes = (agendamentosMes || []).filter(
      (item) => item.pagamento === 'Pendente'
    );

    const recebidoMes = (pagamentosMes || []).reduce(
      (total, item) => total + Number(item.valor || 0),
      0
    );

    const pendente = pendentes.reduce(
      (total, item) => total + Number(item.valor || 0),
      0
    );

    const clientesDevedores = new Set(pendentes.map((item) => item.cliente_id))
      .size;

    const pagamentosRegistrados = (pagamentosMes || []).length;

    setResumoFinanceiro({
      recebidoMes,
      pendente,
      clientesDevedores,
      concluidos: pagamentosRegistrados,
    });
  }

  const mesAtual = new Date().toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <Header title="Resumo Financeiro" voltarPara="/financeiro-menu" />
      <div className="main">
        <div className="main-container">
          <div className="container-formulario">
            <h1 className="flex items-center gap-2 text-primary">
              <ChartNoAxesCombined className="text-secondary" />
              Resumo do mês atual
            </h1>

            <p className="mb-6 text-sm text-cinza/80">
              Resumo de recebimentos, pendências e pagamentos dos atendimentos.
            </p>
            <p className="border-b border-primary/30 text-sm font-bold uppercase text-secondary">
              {mesAtual}
            </p>
            <div className="conteudo-amplo">
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Card 1 com refinamento de UI/UX */}
                <div className="flex flex-row items-center justify-between rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm transition-all duration-200 hover:border-violet-300 hover:shadow-md md:flex-col md:items-start md:justify-start">
                  <p className="flex items-center gap-2 text-sm font-medium text-primary">
                    <span className="flex items-center justify-center rounded-lg p-1.5">
                      <Wallet className="text-secondary" size={24} />
                    </span>
                    Recebido no mês
                  </p>

                  <h2 className="whitespace-nowrap text-xl font-bold tracking-tight text-primary md:mt-3 md:text-2xl">
                    {resumoFinanceiro.recebidoMes.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </h2>
                </div>

                {/* Card 2: Pendente no mês */}
                <div className="flex flex-row items-center justify-between rounded-2xl border border-primary/30 bg-danger/5 p-5 shadow shadow-sm transition-all duration-200 hover:border-violet-300 hover:shadow-md md:flex-col md:items-start md:justify-start">
                  <p className="flex items-center gap-2 text-sm font-medium text-primary">
                    <span className="flex items-center justify-center rounded-lg p-1.5">
                      <CircleAlert className="text-secondary" size={24} />
                    </span>
                    Pendente no mês
                  </p>
                  <h2 className="whitespace-nowrap text-xl font-bold tracking-tight text-danger md:mt-3 md:text-2xl">
                    {resumoFinanceiro.pendente.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </h2>
                </div>

                {/* Card 3: Clientes com pendências */}
                <div className="flex flex-row items-center justify-between rounded-2xl border border-violet-300 bg-danger/5 p-5 shadow shadow-sm transition-all duration-200 hover:border-violet-300 hover:shadow-md md:flex-col md:items-start md:justify-start">
                  <p className="flex items-center gap-2 text-sm font-medium text-primary">
                    <span className="flex items-center justify-center rounded-lg p-1.5">
                      <UserRound className="text-secondary" size={24} />
                    </span>
                    Clientes com pendências no mês
                  </p>
                  <h2 className="whitespace-nowrap text-xl font-bold tracking-tight text-danger md:mt-3 md:text-2xl">
                    {resumoFinanceiro.clientesDevedores}
                  </h2>
                </div>

                {/* Card 4: Pagamentos registrados */}
                <div className="flex flex-row items-center justify-between rounded-2xl border border-violet-300 bg-success/5 p-5 shadow shadow-sm transition-all duration-200 hover:border-violet-300 hover:shadow-md md:flex-col md:items-start md:justify-start">
                  <p className="flex items-center gap-2 text-sm font-medium text-primary">
                    <span className="flex items-center justify-center rounded-lg p-1.5">
                      <BadgeCheck
                        className="text-bold text-secondary"
                        size={24}
                      />
                    </span>
                    Pagamentos registrados
                  </p>
                  <h2 className="whitespace-nowrap text-xl font-bold tracking-tight text-primary md:mt-3 md:text-2xl">
                    {resumoFinanceiro.concluidos}
                  </h2>
                </div>
              </div>
            </div>
            <section className="conteudo-amplo">
              <div className="rounded-2xl border border-primary/30 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-medium text-primary">
                      <CircleAlert
                        size={24}
                        className="shrink-0 text-secondary"
                      />
                      Pagamentos pendentes
                    </h2>

                    <p className="mt-2 text-sm text-cinza/70">
                      Consulte e registre pagamentos pendentes, inclusive de
                      meses anteriores.
                    </p>
                  </div>

                  <Link
                    to="/pagamentos"
                    className="btn-icone inline-flex h-10 w-fit shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-secondary px-3 text-sm font-medium text-secondary transition hover:bg-secondary/10 sm:self-auto"
                  >
                    <CreditCard size={18} />
                    Ver pagamentos pendentes
                  </Link>
                </div>
              </div>
            </section>

            <div className="mx-auto w-full max-w-[1200px] p-4">
              <h2 className="mb-4 mt-10 text-xl font-medium text-primary">
                Últimos 10 pagamentos
              </h2>

              {pagos.length === 0 ? (
                <div className="rounded-2xl border border-primary/30 bg-white p-6 shadow-sm">
                  <p className="text-sm text-gray-500">
                    Nenhum pagamento encontrado.
                  </p>
                </div>
              ) : (
                <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-4">
                  {pagos.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-primary/30 bg-white p-6 shadow-sm"
                    >
                      <p className="flex items-center gap-2 font-medium text-primary">
                        <UserRound
                          size={24}
                          className="font-bold text-secondary"
                        />
                        {item.clientes?.nome || 'Cliente sem nome'}
                      </p>

                      <div className="mt-2 space-y-1">
                        <p className="flex items-center gap-2 text-sm text-gray-500">
                          <CreditCard size={15} className="text-primary" />
                          {item.pagamento}
                        </p>

                        <p className="flex items-center gap-2 text-sm text-gray-500">
                          <Scissors size={15} className="text-primary" />
                          {item.servico}
                        </p>

                        <p className="flex items-center gap-2 font-medium text-primary">
                          <Wallet size={15} className="text-primary" />
                          {Number(item.valor || 0).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </p>
                        <p className="flex items-center gap-2 text-xs text-primary">
                          <CalendarDays size={14} />
                          {new Date(item.data_pagamento).toLocaleDateString(
                            'pt-BR'
                          )}
                          {' • '}
                          {new Date(item.data_pagamento).toLocaleTimeString(
                            'pt-BR',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResumoFinanceiro;
