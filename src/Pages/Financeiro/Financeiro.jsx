import Header from '../../Componentes/Header/Header.jsx';
import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabaseClient.js';
import {
  Save,
  SquareCheckBig,
  SquareScissorsIcon,
  CreditCard,
  Scissors,
  CalendarDays,
  Wallet,
  UserRound,
  BadgeCheck,
  CircleAlert,
  BadgeDollarSign,
} from 'lucide-react';

function Financeiro() {
  const [pendentes, setPendentes] = useState([]);
  const [pagos, setPagos] = useState([]);

  const [formaPagamento, setFormaPagamento] = useState({});

  const [mostrarConfirmacao, setMostrarConfirmacao] = useState({});
  useEffect(() => {
    buscarPendentes();
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
      status_agendamento,
      clientes (
        nome,
        telefone
      )
    `
      )
      .neq('status_agendamento', 'cancelado')
      .neq('pagamento', 'Pendente')
      .order('data', { ascending: false })
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

    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      .toISOString()
      .split('T')[0];

    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];

    const { data, error } = await supabase
      .from('agendamentos')
      .select('id, valor, pagamento, status_agendamento, cliente_id')
      .neq('status_agendamento', 'cancelado')
      .gte('data', primeiroDiaMes)
      .lte('data', ultimoDiaMes);

    if (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      return;
    }

    const registros = data || [];

    const recebidos = registros.filter((item) => item.pagamento !== 'Pendente');

    const pendentes = registros.filter((item) => item.pagamento === 'Pendente');

    const recebidoMes = recebidos.reduce(
      (total, item) => total + Number(item.valor || 0),
      0
    );

    const pendente = pendentes.reduce(
      (total, item) => total + Number(item.valor || 0),
      0
    );
    const pagamentosRegistrados = recebidos.length;

    const clientesDevedores = new Set(pendentes.map((item) => item.cliente_id))
      .size;

    const concluidos = registros.filter(
      (item) => item.status_agendamento === 'concluido'
    ).length;

    setResumoFinanceiro({
      recebidoMes,
      pendente,
      clientesDevedores,
      concluidos: pagamentosRegistrados,
    });
  }

  async function registrarPagamento(agendamentoId, tipoPagamento) {
    if (!agendamentoId || !tipoPagamento) return;

    const { error } = await supabase
      .from('agendamentos')
      .update({ pagamento: tipoPagamento })
      .eq('id', agendamentoId);

    if (error) {
      console.error('Erro ao registrar pagamento:', error);
      return;
    }

    await buscarPendentes();
    await buscarPagos();
    await buscarResumoFinanceiro();

    setFormaPagamento({});
    setMostrarConfirmacao({});
  }

  const mesAtual = new Date().toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <div className="mx-auto mt-6 w-full max-w-[1250px] rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <h1 className="mb-1 text-2xl font-medium uppercase text-primary">
            Financeiro
          </h1>
          <p className="text-sm font-medium capitalize text-secondary">
            {mesAtual}
          </p>
          <p className="mb-6 text-sm text-gray-500">
            Resumo de recebimentos, pendências e pagamentos dos atendimentos.
          </p>

          <div className="mx-auto w-full max-w-[1200px] p-4">
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Card 1 com refinamento de UI/UX */}
              <div className="flex cursor-pointer flex-row items-center justify-between rounded-2xl border border-violet-300 bg-white p-5 shadow-sm transition-all duration-200 hover:border-violet-300 hover:shadow-md md:flex-col md:items-start md:justify-start">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  {/* Ícone ganha um fundinho suave da cor do tema */}
                  <span className="flex items-center justify-center rounded-lg bg-green-50 p-1.5">
                    <Wallet className="text-primary" size={20} />
                  </span>
                  Recebido no mês
                </p>
                {/* O valor numérico fica em um tom escuro neutro e elegante */}
                <h2 className="whitespace-nowrap text-xl font-bold tracking-tight text-primary md:mt-3 md:text-2xl">
                  {resumoFinanceiro.recebidoMes.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </h2>
              </div>

              {/* Card 2: Pendente no mês */}
              <div className="flex cursor-pointer flex-row items-center justify-between rounded-2xl border border-violet-300 bg-white p-5 shadow shadow-sm transition-all duration-200 hover:border-violet-300 hover:shadow-md md:flex-col md:items-start md:justify-start">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <span className="flex items-center justify-center rounded-lg bg-green-50 p-1.5">
                    <CircleAlert className="text-primary" size={20} />
                  </span>
                  Pendente no mês
                </p>
                <h2 className="whitespace-nowrap text-xl font-bold tracking-tight text-red-600 md:mt-3 md:text-2xl">
                  {resumoFinanceiro.pendente.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </h2>
              </div>

              {/* Card 3: Clientes com pendências */}
              <div className="flex cursor-pointer flex-row items-center justify-between rounded-2xl border border-violet-300 bg-white p-5 shadow shadow-sm transition-all duration-200 hover:border-violet-300 hover:shadow-md md:flex-col md:items-start md:justify-start">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <span className="flex items-center justify-center rounded-lg bg-green-50 p-1.5">
                    <UserRound className="text-primary" size={20} />
                  </span>
                  Clientes com pendências
                </p>
                <h2 className="whitespace-nowrap text-xl font-bold tracking-tight text-primary md:mt-3 md:text-2xl">
                  {resumoFinanceiro.clientesDevedores}
                </h2>
              </div>

              {/* Card 4: Pagamentos registrados */}
              <div className="flex cursor-pointer flex-row items-center justify-between rounded-2xl border border-violet-300 bg-white p-5 shadow shadow-sm transition-all duration-200 hover:border-violet-300 hover:shadow-md md:flex-col md:items-start md:justify-start">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <span className="flex items-center justify-center rounded-lg bg-green-50 p-1.5">
                    <BadgeCheck className="text-primary" text-bold size={20} />
                  </span>
                  Pagamentos registrados
                </p>
                <h2 className="whitespace-nowrap text-xl font-bold tracking-tight text-primary md:mt-3 md:text-2xl">
                  {resumoFinanceiro.concluidos}
                </h2>
              </div>
            </div>
          </div>
          <section className="mt-10">
            <div className="mb-4">
              <h2 className="text-xl font-medium text-primary">
                Pendências de pagamento
              </h2>
            </div>

            <div className="rounded-2xl border border-violet-400 bg-white p-5 shadow-sm">
              {/* <input
                type="text"
                placeholder="Buscar cliente..."
                className="input-padrao mb-4 w-full max-w-[350px]"
              /> */}
              {/* COBRANÇAS PENDENTES */}

              <p className="mb-4 text-sm text-gray-500">
                Selecione a forma de pagamento para registrar o recebimento
              </p>

              {pendentes.length === 0 ? (
                <p className="text-md rounded-lg bg-secondary p-3 text-center font-medium uppercase text-white">
                  Todos os pagamentos estão em dia.
                </p>
              ) : (
                <div className="space-y-3">
                  {pendentes.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-gray-300 p-3"
                    >
                      <p className="font-medium text-primary">
                        {item.clientes?.nome || 'Cliente sem nome'}
                      </p>

                      <div className="mt-2 space-y-1">
                        <p className="flex items-center gap-2 text-xs text-gray-500">
                          <CalendarDays size={14} className="text-primary" />
                          {new Date(item.data + 'T12:00:00').toLocaleDateString(
                            'pt-BR'
                          )}
                          {' • '}
                          {item.horario}
                        </p>

                        <p className="flex items-center gap-2 text-sm text-gray-500">
                          <Scissors size={15} className="text-primary" />
                          {item.servico}
                        </p>

                        <p className="flex items-center gap-2 font-medium text-primary">
                          <BadgeDollarSign size={15} />
                          {Number(item.valor || 0).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </p>
                      </div>
                      <select
                        className="input-padrao mt-3 flex max-w-[220px] cursor-pointer hover:bg-secondary hover:text-white"
                        value={formaPagamento[item.id] || ''}
                        onChange={(e) => {
                          setFormaPagamento((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }));

                          setMostrarConfirmacao((prev) => ({
                            ...prev,
                            [item.id]: !!e.target.value,
                          }));
                        }}
                      >
                        <option value="">Selecione o pagamento</option>
                        <option value="Pix">Pix</option>
                        <option value="Cartão">Cartão</option>
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Pendente">Pendente</option>
                      </select>
                      {mostrarConfirmacao[item.id] && (
                        <button
                          type="button"
                          onClick={() =>
                            registrarPagamento(item.id, formaPagamento[item.id])
                          }
                          className="rounded-md p-2 text-green-600 transition hover:bg-green-200"
                          title="Confirme pagamento"
                        >
                          <SquareCheckBig size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <div className="mx-auto w-full max-w-[1200px] p-4">
            <h2 className="mb-4 mt-10 text-xl font-medium text-primary">
              Últimos 10 pagamentos
            </h2>

            {pagos.length === 0 ? (
              <div className="rounded-2xl border border-secondary bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Nenhum pagamento encontrado.
                </p>
              </div>
            ) : (
              <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-4">
                {pagos.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-primary bg-white p-6 shadow-sm"
                  >
                    <p className="flex items-center gap-2 font-medium text-primary">
                      <UserRound size={18} className="text-secondary" />
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
                        {new Date(item.data + 'T12:00:00').toLocaleDateString(
                          'pt-BR'
                        )}
                        {' • '}
                        {item.horario}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Financeiro;
