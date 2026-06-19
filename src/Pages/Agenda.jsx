import StatusBadge from '../Componentes/StatusBadge/StatusBadge';
import getStatusBadge from '../Componentes/Utilitarios/getStatusBadge';
import { useEffect, useState, Fragment } from 'react';
import { supabase } from '../api/supabaseClient';
import {
  X,
  BadgeDollarSign,
  SquareCheckBig,
  Pencil,
  Trash2,
  Save,
  Clock,
  CircleOff,
  ClipboardPlusIcon,
} from 'lucide-react';

import InputData from '../Componentes/CamposReutilizaveis/InputData';
import InputHorario from '../Componentes/CamposReutilizaveis/InputHorario';
import Header from '../Componentes/Header/Header';
import {
  enviarLembreteDeAgendamento,
  montarTextoLembreteDeAgendamento,
} from '../utils/whatsapp';

import { createLogger } from '../lib/logger';
const logger = createLogger('Agendamentos');

function formatarValor(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

const AgendaAtendimento = () => {
  const [statusLocal, setStatusLocal] = useState({});
  const [clientes, setClientes] = useState([]);
  const [linhaPagamentoAberta, setLinhaPagamentoAberta] = useState(null);
  const [confirmacao, setConfirmacao] = useState({
    aberto: false,
    mensagem: '',
    onConfirm: null,
  });
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState({});
  const [novoAgendamento, setNovoAgendamento] = useState({
    data: '',
    horario: '',
    cliente_id: '',
    servico: '',
    valor: '',
    obs: '',
  });
  const [abrindoLembrete, setAbrindoLembrete] = useState(false);
  const [agendamentos, setAgendamentos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [formEdicao, setFormEdicao] = useState({
    data: '',
    cliente_id: '',
    horario: '',
    servico: '',
    valor: '',
    pagamento: '',
    obs: '',
  });
  const [mensagemSistema, setMensagemSistema] = useState({
    aberta: false,
    tipo: '',
    texto: '',
  });
  const [filaLembretes, setFilaLembretes] = useState({
    aberta: false,
    lista: [],
    indiceAtual: 0,
  });

  const alterarStatus = async (id, novoStatus) => {
    const mapaStatus = {
      Agendado: 'agendado',
      Concluído: 'concluido',
      Cancelado: 'cancelado',
    };

    const statusParaSalvar = mapaStatus[novoStatus] || 'agendado';

    const { data, error } = await supabase
      .from('agendamentos')
      .update({ status_agendamento: statusParaSalvar })
      .eq('id', id)
      .select();

    if (error) {
      logger.error('Erro ao atualizar status:', error);
      mostrarMensagem('Erro ao atualizar status do atendimento.');
      return;
    }
    setStatusLocal((prev) => ({
      ...prev,
      [id]: novoStatus,
    }));

    const agendamentoAtual = agendamentos.find((item) => item.id === id);

    if (novoStatus === 'Concluído') {
      const pagamentoAtual = agendamentoAtual?.pagamento;
      const precisaAbrirPagamento =
        !pagamentoAtual || pagamentoAtual === 'PENDENTE';

      if (precisaAbrirPagamento) {
        setLinhaPagamentoAberta(id);
      } else {
        setLinhaPagamentoAberta(null);
      }

      mostrarMensagem('sucesso', 'Atendimento concluído.');
    } else if (novoStatus === 'Cancelado') {
      setLinhaPagamentoAberta(null);
      mostrarMensagem('sucesso', 'Atendimento cancelado com sucesso.');
    }
  };

  const buscarAgendamentos = async () => {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(
        `
        id, data, horario, servico, valor, pagamento, obs, cliente_id, status_agendamento,
        clientes ( id, nome, telefone )
      `
      )
      .order('data', { ascending: false })
      .order('horario', { ascending: true });
    if (error) {
      logger.error('Erro ao buscar agendamentos:', error);
    } else {
      setAgendamentos(data || []);
    }
  };

  useEffect(() => {
    buscarAgendamentos();
  }, []);

  useEffect(() => {
    const buscarClientes = async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, telefone');

      if (error) {
        logger.error('Erro ao buscar clientes:', error);
      } else {
        // Verifique se os dados estão corretos
        setClientes(data || []);
      }
    };

    buscarClientes();
  }, []);

  function converterDataParaISO(dataBr) {
    const [dia, mes, ano] = dataBr.split('/');
    return `${ano}-${mes}-${dia}`;
  }

  const salvarAgendamento = async () => {
    const { data, horario, cliente_id, servico, valor } = novoAgendamento;

    if (!data || !horario || !cliente_id || !servico || !valor) {
      mostrarMensagem(
        'erro',
        'Preencha data, horário, cliente, serviço e valor.'
      );
      return;
    }

    const valorComPonto = String(valor).replace(',', '.');
    const valorConvertido = parseFloat(valorComPonto);

    if (isNaN(valorConvertido) || valorConvertido <= 0) {
      mostrarMensagem('erro', 'Valor inválido.');
      return;
    }

    const dataConvertida = converterDataParaISO(data);

    const agendamentoFinal = {
      data: dataConvertida,
      horario,
      cliente_id,
      servico,
      valor: valorConvertido,
      pagamento: '',
      obs: novoAgendamento.obs || '',
      status_agendamento: 'agendado',
    };

    const { data: novoRegistro, error } = await supabase
      .from('agendamentos')
      .insert([agendamentoFinal]);

    if (error) {
      logger.error('Erro ao salvar agendamento:', error);
      mostrarMensagem('erro', 'Erro ao salvar agendamento.');
      return;
    }

    await buscarAgendamentos();

    setNovoAgendamento({
      data: '',
      horario: '',
      cliente_id: '',
      servico: '',
      valor: '',
      obs: '',
    });

    mostrarMensagem('sucesso', 'Agendamento salvo com sucesso!');
  };

  const iniciarEdicao = (agendamento) => {
    setEditandoId(agendamento.id);
    setFormEdicao({
      data: agendamento.data
        ? new Date(agendamento.data + 'T12:00:00').toLocaleDateString('pt-BR')
        : '',
      cliente_id: String(agendamento.cliente_id ?? ''),
      horario: agendamento.horario || '',
      servico: agendamento.servico || '',
      valor: String(agendamento.valor * 100),
      valorFormatado: formatarMoeda(String(agendamento.valor * 100)),
      pagamento: agendamento.pagamento || '',
      obs: agendamento.obs || '',
    });
  };
  const formatarMoeda = (valor) => {
    const numero = valor.replace(/\D/g, '');

    const numeroFloat = Number(numero) / 100;

    return numeroFloat.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const salvarEdicao = async (id) => {
    const valorEmCentavos = String(formEdicao.valor ?? '').replace(/\D/g, '');
    const valorConvertido = Number(valorEmCentavos) / 100;

    if (!formEdicao.data) {
      mostrarMensagem('erro', 'Selecione a data.');
      return;
    }

    if (!formEdicao.horario || !formEdicao.horario.trim()) {
      mostrarMensagem('erro', 'Selecione o horário.');
      return;
    }

    if (!formEdicao.cliente_id) {
      mostrarMensagem('erro', 'Selecione o cliente.');
      return;
    }

    if (!formEdicao.servico || !formEdicao.servico.trim()) {
      mostrarMensagem('erro', 'Selecione o serviço.');
      return;
    }

    if (Number.isNaN(valorConvertido) || valorConvertido <= 0) {
      mostrarMensagem('erro', 'Informe um valor válido.');
      return;
    }

    const clienteIdValue = String(formEdicao.cliente_id);
    const dataIso = converterDataParaISO(formEdicao.data);

    const { error } = await supabase
      .from('agendamentos')
      .update({
        data: dataIso,
        cliente_id: clienteIdValue,
        horario: formEdicao.horario,
        servico: formEdicao.servico.trim(),
        valor: valorConvertido,
        pagamento: formEdicao.pagamento,
        obs: formEdicao.obs,
      })
      .eq('id', id);

    if (error) {
      logger.error(error);
      mostrarMensagem('erro', 'Erro ao atualizar agendamento.');
      return;
    }

    const clienteObj =
      clientes.find((c) => String(c.id) === String(formEdicao.cliente_id)) ||
      null;

    setAgendamentos((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              data: dataIso,
              cliente_id: clienteIdValue,
              horario: formEdicao.horario,
              servico: formEdicao.servico.trim(),
              valor: valorConvertido,
              pagamento: formEdicao.pagamento,
              obs: formEdicao.obs,
              clientes: clienteObj
                ? {
                    id: clienteObj.id,
                    nome: clienteObj.nome,
                    telefone: clienteObj.telefone ?? null,
                  }
                : a.clientes,
            }
          : a
      )
    );

    setEditandoId(null);
    mostrarMensagem('sucesso', 'Agendamento atualizado com sucesso!');
  };
  const atualizarCampoEdicao = (campo, valor) => {
    setFormEdicao((prev) => ({ ...prev, [campo]: valor }));
  };

  const excluirAgendamento = async (id) => {
    const { error } = await supabase.from('agendamentos').delete().eq('id', id);

    if (error) {
      mostrarMensagem('erro', 'Erro ao excluir agendamento.');
      return;
    }

    setAgendamentos((prev) => prev.filter((item) => item.id !== id));

    mostrarMensagem('sucesso', 'Agendamento excluído com sucesso!');
  };

  const capitalizePrimeiraLetra = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getDiaSemanaComData = (dataISO) => {
    const data = new Date(dataISO + 'T12:00:00');

    const diaSemana = data.toLocaleDateString('pt-BR', {
      weekday: 'long',
    });

    const dataFormatada = data.toLocaleDateString('pt-BR');

    return {
      diaSemana: capitalizePrimeiraLetra(diaSemana),
      dataFormatada,
    };
  };

  const agendamentosAgrupadosPorDiaSemana = agendamentos.reduce(
    (acc, agendamento) => {
      const data = agendamento.data;

      if (!acc[data]) {
        acc[data] = [];
      }

      acc[data].push(agendamento);
      return acc;
    },
    {}
  );
  const salvarPagamento = async (id) => {
    const pagamento = pagamentoSelecionado[id];

    if (!pagamento) {
      mostrarMensagem('erro', 'Selecione a forma de pagamento.');
      return;
    }

    abrirConfirmacao(
      `Deseja salvar o pagamento como "${pagamento}"?`,
      async () => {
        const { error } = await supabase
          .from('agendamentos')
          .update({ pagamento })
          .eq('id', id);

        if (error) {
          logger.error('Erro ao salvar pagamento:', error);
          mostrarMensagem('erro', 'Erro ao salvar pagamento.');
          return;
        }

        setAgendamentos((prev) =>
          prev.map((item) => (item.id === id ? { ...item, pagamento } : item))
        );

        setLinhaPagamentoAberta(null);
        mostrarMensagem('sucesso', 'Pagamento atualizado!');
      }
    );
  };

  const abrirConfirmacao = (mensagem, callback) => {
    setConfirmacao({
      aberto: true,
      mensagem,
      onConfirm: callback,
    });
  };

  const mostrarMensagem = (tipo, texto) => {
    setMensagemSistema({
      aberta: true,
      tipo,
      texto,
    });
  };
  {
    /*Editar pagamento*/
  }
  const editarPagamento = (agendamento) => {
    setPagamentoSelecionado((prev) => ({
      ...prev,
      [agendamento.id]: agendamento.pagamento || '',
    }));

    setLinhaPagamentoAberta(agendamento.id);
  };

  const iniciarFilaLembretes = async (lista) => {
    const listaComTelefone = lista.filter((ag) => ag?.clientes?.telefone);

    if (!listaComTelefone.length) {
      mostrarMensagem(
        'erro',
        'Nenhum cliente deste dia possui telefone cadastrado.'
      );
      return;
    }

    setFilaLembretes({
      aberta: true,
      lista: listaComTelefone,
      indiceAtual: 0,
    });

    await enviarLembreteDeAgendamento(listaComTelefone[0]);
    await salvarHistoricoLembrete(listaComTelefone[0]);
  };
  const tocarSomLeve = () => {
    try {
      const audio = new Audio('/sounds/click.mp3');
      audio.volume = 2.5;
      audio.play();
    } catch (error) {
      console.log('Som não pôde ser reproduzido.');
    }
  };

  const enviarProximoLembrete = async () => {
    if (abrindoLembrete) return;

    setAbrindoLembrete(true);

    await tocarSomLeve(); // 👈 aqui fica o som

    const proximoIndice = filaLembretes.indiceAtual + 1;
    const proximoAgendamento = filaLembretes.lista[proximoIndice];

    if (!proximoAgendamento) {
      setFilaLembretes({
        aberta: false,
        lista: [],
        indiceAtual: 0,
      });

      setAbrindoLembrete(false);
      mostrarMensagem('sucesso', 'Todos os lembretes foram abertos.');
      return;
    }

    setFilaLembretes((prev) => ({
      ...prev,
      indiceAtual: proximoIndice,
    }));

    await enviarLembreteDeAgendamento(proximoAgendamento);
    await salvarHistoricoLembrete(proximoAgendamento);

    setAbrindoLembrete(false);
  };

  const salvarHistoricoLembrete = async (agendamento) => {
    const mensagem = montarTextoLembreteDeAgendamento(agendamento);

    const { data, error } = await supabase
      .from('lembretes_enviados')
      .insert([
        {
          agendamento_id: agendamento.id,
          cliente_id: agendamento.cliente_id,
          cliente_nome: agendamento.clientes?.nome || 'Cliente',
          telefone: agendamento.clientes?.telefone || '',
          mensagem,
          tipo: 'lembrete_agendamento',
          status: 'aberto_whatsapp',
        },
      ])
      .select(
        `
        id,
        cliente_nome,
        telefone,
        mensagem,
        tipo,
        status,
        enviado_em,
        agendamentos (
          data,
          horario,
          servico,
          valor
        )
      `
      )
      .order('enviado_em', { ascending: false });

    if (error) {
      console.error('Erro ao salvar histórico:', error);
      mostrarMensagem('erro', 'Erro ao salvar histórico do lembrete.');
      return;
    }

    console.log('Histórico salvo com sucesso:', data);
  };

  return (
    <div className="container mx-auto p-4">
      <Header />

      {/* 🟡 FORMULÁRIO DE NOVO AGENDAMENTO */}

      <div className="mx-auto w-full max-w-[100%] rounded-2xl border border-violet-200 bg-white/80 p-5 shadow-sm">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-medium text-primary">
          <ClipboardPlusIcon className="text-secondary" />
          Novo Agendamento
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Data e Horário */}

          {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"> */}
          {/* 🗓️ Data */}
          <div className="flex flex-col">
            <label className="mb-1 text-[13px] font-normal text-gray-700">
              Data
            </label>

            <InputData
              value={novoAgendamento.data}
              onChange={(val) =>
                setNovoAgendamento({ ...novoAgendamento, data: val })
              }
            />
          </div>
          {/* ⏰ Horário */}
          <div className="flex flex-col">
            <label className="mb-1 text-[13px] font-normal text-gray-700">
              Horário
            </label>
            <InputHorario
              value={novoAgendamento.horario}
              onChange={(val) =>
                setNovoAgendamento({ ...novoAgendamento, horario: val })
              }
              className="w-full rounded border bg-white px-3 py-2 text-sm text-gray-600"
            />
          </div>

          {/* Cliente */}
          <div className="flex flex-col">
            <label className="mb-1 text-[13px] font-normal text-gray-700">
              Cliente
            </label>

            <select
              value={novoAgendamento.cliente_id}
              onChange={(e) => {
                const { value } = e.target;
                setNovoAgendamento((prev) => ({
                  ...prev,
                  cliente_id: value,
                }));
              }}
              className="input-padrao"
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={String(cliente.id)}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Serviço */}
          <div className="flex flex-col">
            <label className="mb-1 text-[13px] font-normal text-gray-700">
              Serviço
            </label>
            <select
              value={novoAgendamento.servico}
              onChange={(e) =>
                setNovoAgendamento({
                  ...novoAgendamento,
                  servico: e.target.value,
                })
              }
              className="input-padrao"
            >
              <option value="">Selecione</option>
              <option value="Tintura">Tintura</option>
              <option value="Corte">Corte</option>
              <option value="Escova progressiva">Escova Progressiva</option>
              <option value="Butox">Butox</option>
              <option value="Manicure">Manicure</option>
              <option value="Maquiagem">Maquiagem</option>
              <option value="Sobrancelha">Sobrancelha</option>
              <option value="Depilação">Depilação</option>
              <option value="Penteado festa">Penteado festa</option>
            </select>
          </div>

          {/* Valor */}
          <div className="flex flex-col">
            <label className="mb-1 text-[13px] font-normal text-gray-700">
              Valor
            </label>
            <input
              type="text"
              placeholder="Valor"
              value={novoAgendamento.valor}
              onChange={(e) =>
                setNovoAgendamento({
                  ...novoAgendamento,
                  valor: e.target.value,
                })
              }
              className="input-padrao"
            />
          </div>

          {/* Observações */}
          <div className="flex flex-col">
            <label className="mb-1 text-[13px] font-normal text-gray-700">
              Observações
            </label>
            <textarea
              type="text"
              placeholder="Observações"
              value={novoAgendamento.obs}
              onChange={(e) =>
                setNovoAgendamento({ ...novoAgendamento, obs: e.target.value })
              }
              className="input-padrao h-[38px] resize-none"
            />
          </div>
        </div>
        {/* <button
          onClick={salvarAgendamento}
          className="mt-5 flex items-center gap-2 rounded-full bg-secondary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-alternativo"
        >
          <Save size={20} />
          <span className="hidden sm:inline">Salvar</span>
        </button> */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={salvarAgendamento}
            className="flex items-center gap-2 rounded-full bg-secondary px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-alternativo"
          >
            <Save size={20} />
            <span className="hidden sm:inline">Salvar</span>
          </button>
        </div>
      </div>

      {/* 🔵 AGRUPAMENTO POR DIA DA SEMANA */}

      <div className="mx-auto mt-5 w-full max-w-[100%] rounded-lg border border-[rgba(128,128,128,0.3)] bg-gray-50 p-4 px-4 pt-2 shadow-lg">
        {Object.entries(agendamentosAgrupadosPorDiaSemana).map(
          ([data, agendamentosDoDia]) => {
            const { diaSemana, dataFormatada } = getDiaSemanaComData(data);

            return (
              <div
                key={diaSemana}
                className="mb-6 rounded-2xl bg-white/70 p-4 shadow-sm backdrop-blur-sm"
              >
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="relative mb-0 text-xl font-normal text-primary">
                      {diaSemana}
                    </h2>

                    <p className="text-sm text-gray-500">{dataFormatada}</p>
                    {/* 🟡 ENVIAR Lembrete */}
                  </div>

                  <button
                    type="button"
                    onClick={() => iniciarFilaLembretes(agendamentosDoDia)}
                    className="mb-2 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-secondary"
                    title="Enviar lembretes para todos deste dia"
                  >
                    <Clock size={20} />
                    Enviar lembrete
                  </button>
                </div>

                <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-gradient-to-b from-white to-violet-50/30">
                  <table className="w-full min-w-[820px] border-separate border-spacing-0">
                    <thead className="bg-violet-50 text-[11px] uppercase tracking-wide text-primary">
                      <tr className="overflow-x-auto">
                        <th className="w-full border-b border-violet-200 px-2 py-2 text-left font-semibold md:px-4 md:py-3">
                          Data
                        </th>
                        <th className="border-b border-violet-200 px-2 py-2 text-left font-semibold md:px-4 md:py-3">
                          Horário
                        </th>
                        <th className="mb-5 min-w-[180px] border-b border-violet-200 px-2 py-2 text-center font-semibold md:px-4 md:py-3">
                          Cliente
                        </th>
                        <th className="border-b border-violet-200 px-2 py-2 text-left font-semibold md:px-4 md:py-3">
                          Serviço
                        </th>
                        <th className="border-b border-violet-200 px-2 py-2 text-left font-semibold md:px-4 md:py-3">
                          Valor
                        </th>
                        <th className="border-b border-violet-200 px-2 py-2 text-left font-semibold md:px-4 md:py-3">
                          status
                        </th>
                        {/* <th className="border p-2">Pagamento</th> */}
                        <th className="min-w-[180px] border-b border-violet-200 px-2 py-2 text-center font-semibold md:px-4 md:py-3">
                          Obs
                        </th>
                        <th className="border-b border-violet-200 px-2 py-2 text-left font-semibold md:px-4 md:py-3">
                          Ações
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {/* 🔴 LISTAGEM DOS AGENDAMENTOS DO DIA */}
                      {agendamentosDoDia.map((agendamento) => {
                        const statusAtual =
                          statusLocal[agendamento.id] ||
                          (agendamento.status_agendamento === 'concluido'
                            ? 'Concluído'
                            : agendamento.status_agendamento === 'cancelado'
                              ? 'Cancelado'
                              : 'Agendado');
                        const badge = getStatusBadge(
                          statusAtual,
                          agendamento.pagamento
                        );
                        return (
                          <Fragment key={agendamento.id}>
                            <tr className="transition hover:bg-violet-50/60">
                              {/* Data */}
                              <td className="min-w-[100px] border-b border-gray-200 px-2 py-2 text-left text-sm md:px-4 md:py-3">
                                {editandoId === agendamento.id ? (
                                  <InputData
                                    value={formEdicao.data || ''}
                                    onChange={(val) =>
                                      atualizarCampoEdicao('data', val)
                                    }
                                  />
                                ) : (
                                  new Date(
                                    agendamento.data + 'T12:00:00'
                                  ).toLocaleDateString('pt-BR')
                                )}
                              </td>
                              {/* Horário */}
                              <td className="min-w-[100px] border-b border-gray-200 px-2 py-2 text-left text-sm md:px-4 md:py-3">
                                {editandoId === agendamento.id ? (
                                  <input
                                    type="time"
                                    value={formEdicao.horario || ''}
                                    onChange={(e) => {
                                      console.log(
                                        'Novo horário:',
                                        e.target.value
                                      );
                                      setFormEdicao((prev) => ({
                                        ...prev,
                                        horario: e.target.value,
                                      }));
                                    }}
                                    className="w-full rounded border p-1"
                                  />
                                ) : (
                                  agendamento.horario
                                )}
                              </td>

                              {/* Cliente */}
                              <td className="min-w-[100px] border-b border-gray-200 px-2 py-2 text-left text-sm md:px-4 md:py-3">
                                {editandoId === agendamento.id ? (
                                  <select
                                    value={formEdicao.cliente_id || ''}
                                    onChange={(e) =>
                                      atualizarCampoEdicao(
                                        'cliente_id',
                                        e.target.value
                                      )
                                    }
                                    className="w-full rounded border p-1"
                                  >
                                    <option value="">
                                      Selecione um cliente
                                    </option>
                                    {clientes.map((c) => (
                                      <option key={c.id} value={c.id}>
                                        {c.nome}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  agendamento.clientes?.nome || 'Sem nome'
                                )}
                              </td>

                              {/* Serviço */}

                              <td className="min-w-[100px] border-b border-gray-200 px-2 py-2 text-left text-sm md:px-4 md:py-3">
                                {editandoId === agendamento.id ? (
                                  <select
                                    value={formEdicao.servico || ''}
                                    onChange={(e) =>
                                      atualizarCampoEdicao(
                                        'servico',
                                        e.target.value
                                      )
                                    }
                                    className="w-full rounded border p-1"
                                  >
                                    <option value="">Selecione</option>
                                    <option value="Tintura">Tintura</option>
                                    <option value="Corte">Corte</option>
                                    <option value="Escova progressiva">
                                      Escova Progressiva
                                    </option>
                                    <option value="Butox">Butox</option>
                                    <option value="Manicure">Manicure</option>
                                    <option value="Maquiagem">Maquiagem</option>
                                    <option value="Sobrancelha">
                                      Sobrancelha
                                    </option>
                                    <option value="Depilação">Depilação</option>
                                    <option value="Penteado festa">
                                      Penteado festa
                                    </option>
                                  </select>
                                ) : (
                                  agendamento.servico
                                )}
                              </td>
                              {/* Valor */}
                              <td className="min-w-[100px] border-b border-gray-200 px-2 py-2 text-left text-sm md:px-4 md:py-3">
                                {editandoId === agendamento.id ? (
                                  <input
                                    value={formEdicao.valorFormatado || ''}
                                    onChange={(e) => {
                                      const somenteNumeros =
                                        e.target.value.replace(/\D/g, '');

                                      setFormEdicao((prev) => ({
                                        ...prev,
                                        valor: somenteNumeros,
                                        valorFormatado:
                                          formatarMoeda(somenteNumeros),
                                      }));
                                    }}
                                    className="rounded border p-1"
                                  />
                                ) : (
                                  formatarValor(agendamento.valor)
                                )}
                              </td>

                              <td className="min-w-[100px] border-b border-gray-200 px-2 py-2 text-left text-sm md:px-4 md:py-3">
                                <StatusBadge
                                  status={badge.label}
                                  style={badge.style}
                                />
                              </td>

                              {/* Observações */}
                              <td className="min-w-[100px] border-b border-gray-200 px-2 py-2 text-left text-sm md:px-4 md:py-3">
                                {editandoId === agendamento.id ? (
                                  <input
                                    value={formEdicao.obs}
                                    onChange={(e) =>
                                      atualizarCampoEdicao(
                                        'obs',
                                        e.target.value
                                      )
                                    }
                                    className="rounded border p-1"
                                  />
                                ) : (
                                  agendamento.obs
                                )}
                              </td>

                              {/* Ações */}

                              <td className="min-w-[180px] border-b border-gray-200 px-3 py-2 md:px-4 md:py-3">
                                <div className="flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gray-50 px-2 py-1">
                                  {editandoId === agendamento.id ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        salvarEdicao(agendamento.id)
                                      }
                                      className="text-green-600"
                                      title="Salvar"
                                    >
                                      <SquareCheckBig size={20} />
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => iniciarEdicao(agendamento)}
                                      className="rounded-md p-2 text-yellow-600 transition hover:bg-yellow-200"
                                      title="Editar"
                                    >
                                      <Pencil size={20} />
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      abrirConfirmacao(
                                        'Deseja realmente excluir este atendimento?',
                                        () => excluirAgendamento(agendamento.id)
                                      )
                                    }
                                    className="rounded-md p-2 text-red-600 transition hover:bg-red-200"
                                    title="Excluir atendimento"
                                  >
                                    <Trash2 size={20} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      alterarStatus(agendamento.id, 'Concluído')
                                    }
                                    className="rounded-md p-2 text-green-600 transition hover:bg-green-200"
                                    title="Concluir atendimento"
                                  >
                                    <Save size={20} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      alterarStatus(agendamento.id, 'Cancelado')
                                    }
                                    className="rounded-md p-2 text-gray-600 transition hover:bg-gray-200"
                                    title="Cancelar atendimento"
                                  >
                                    <CircleOff size={20} />
                                  </button>

                                  {statusAtual !== 'Cancelado' && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        editarPagamento(agendamento)
                                      }
                                      className="rounded-md p-2 text-primary transition hover:bg-blue-200"
                                      title="Editar pagamento"
                                    >
                                      <BadgeDollarSign size={20} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/**Pagamento */}

                            {linhaPagamentoAberta === agendamento.id && (
                              <tr>
                                <td
                                  colSpan="8"
                                  className="border-b bg-blue-50 px-4 py-4"
                                >
                                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">💰</span>
                                      <span className="font-medium text-primary">
                                        Registrar pagamento
                                      </span>
                                    </div>

                                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                                      <select
                                        className="input-padrao max-w-[180px]"
                                        value={
                                          pagamentoSelecionado[
                                            agendamento.id
                                          ] || ''
                                        }
                                        onChange={(e) =>
                                          setPagamentoSelecionado((prev) => ({
                                            ...prev,
                                            [agendamento.id]: e.target.value,
                                          }))
                                        }
                                      >
                                        <option value="">Selecione</option>
                                        <option value="Pix">Pix</option>
                                        <option value="Cartão">Cartão</option>
                                        <option value="Dinheiro">
                                          Dinheiro
                                        </option>
                                        <option value="Pendente">
                                          Pendente
                                        </option>
                                      </select>

                                      <button
                                        type="button"
                                        className={`btn ${
                                          pagamentoSelecionado[agendamento.id]
                                            ? 'btn-green'
                                            : 'btn-gray cursor-not-allowed'
                                        }`}
                                        onClick={() =>
                                          salvarPagamento(agendamento.id)
                                        }
                                        disabled={
                                          !pagamentoSelecionado[agendamento.id]
                                        }
                                      >
                                        Confirmar pagamento
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/*Confirmação*/}
      {confirmacao.aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[90%] max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-primary">
              Confirmação
            </h2>

            <p className="mb-6 text-gray-700">{confirmacao.mensagem}</p>

            <div className="flex justify-end gap-3">
              <button
                className="btn btn-gray"
                onClick={() =>
                  setConfirmacao({
                    aberto: false,
                    mensagem: '',
                    onConfirm: null,
                  })
                }
              >
                Cancelar
              </button>

              <button
                className="btn btn-green"
                onClick={() => {
                  confirmacao.onConfirm();
                  setConfirmacao({
                    aberto: false,
                    mensagem: '',
                    onConfirm: null,
                  });
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔵 MENSAGEM DO SISTEMA */}
      {mensagemSistema.aberta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-[90%] max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h2
              className={`mb-3 text-lg font-semibold ${
                mensagemSistema.tipo === 'erro'
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}
            >
              {mensagemSistema.tipo === 'erro' ? 'Atenção' : 'Sucesso'}
            </h2>

            <p className="mb-5 text-gray-700">{mensagemSistema.texto}</p>

            <div className="flex justify-end">
              <button
                className={
                  mensagemSistema.tipo === 'erro'
                    ? 'btn btn-red'
                    : 'btn btn-green'
                }
                onClick={() =>
                  setMensagemSistema({
                    aberta: false,
                    tipo: '',
                    texto: '',
                  })
                }
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {filaLembretes.aberta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[90%] max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-3 text-lg font-semibold text-primary">
              Fila de lembretes
            </h2>

            <p className="mb-4 text-gray-700">
              Lembrete <strong>{filaLembretes.indiceAtual + 1}</strong> de{' '}
              <strong>{filaLembretes.lista.length}</strong>
            </p>
            <div className="mb-5 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{
                  width: `${
                    ((filaLembretes.indiceAtual + 1) /
                      filaLembretes.lista.length) *
                    100
                  }%`,
                }}
              />
            </div>

            <div className="mb-6 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-gray-700">
                <span className="font-medium text-primary">Cliente:</span>{' '}
                {filaLembretes.lista[filaLembretes.indiceAtual]?.clientes?.nome}
              </p>

              <p className="text-gray-700">
                <span className="font-medium text-primary">Serviço:</span>{' '}
                {filaLembretes.lista[filaLembretes.indiceAtual]?.servico}
              </p>

              <p className="text-gray-700">
                <span className="font-medium text-primary">Horário:</span>{' '}
                {filaLembretes.lista[filaLembretes.indiceAtual]?.horario}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200"
                onClick={() =>
                  setFilaLembretes({
                    aberta: false,
                    lista: [],
                    indiceAtual: 0,
                  })
                }
              >
                Fechar
              </button>

              <button
                type="button"
                disabled={abrindoLembrete}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-white transition ${
                  abrindoLembrete
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-primary hover:bg-secondary'
                }`}
                onClick={enviarProximoLembrete}
              >
                {abrindoLembrete ? 'Abrindo...' : 'Próximo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AgendaAtendimento;
