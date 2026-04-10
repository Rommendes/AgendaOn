import { useEffect, useState,Fragment } from "react";
import { supabase } from "../api/supabaseClient";
import { X, BadgeDollarSign, SquareCheckBig, Pencil, Trash2, Save, Clock, ClipboardPlusIcon} from "lucide-react";

import InputData from "../Componentes/CamposReutilizaveis/InputData"
import InputHorario from "../Componentes/CamposReutilizaveis/InputHorario";
import Header from "../Componentes/Header/Header";
import { enviarLembretesEmLote, enviarLembreteDeAgendamento } from "../utils/whatsapp"; 
import { createLogger } from "../lib/logger"; 
const logger = createLogger("Agendamentos");

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
  mensagem: "",
  onConfirm: null,
});
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState({});
  const [novoAgendamento, setNovoAgendamento] = useState({
    data: "",
    horario: "",
    cliente_id: "",
    servico: "",
    valor: "",
    obs: "",
  });
  const [agendamentos, setAgendamentos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [formEdicao, setFormEdicao] = useState({
    data: "",
    cliente_id:"",
    horario: "",
    servico: "",
    valor: "",
    pagamento: "",
    obs: ""
  });
  const [mensagemSistema, setMensagemSistema] = useState({
  aberta: false,
  tipo: "",
  texto: "",
});

const alterarStatus = async (id, novoStatus) => {
  const mapaStatus = {
    Agendado: "agendado",
    Concluído: "concluido",
    Cancelado: "cancelado",
  };

  const statusParaSalvar = mapaStatus[novoStatus] || "agendado";

  const { data, error } = await supabase
    .from("agendamentos")
    .update({ status_agendamento: statusParaSalvar })
    .eq("id", id)
    .select();

  if (error) {
    logger.error("Erro ao atualizar status:", error);
    mostrarMensagem("Erro ao atualizar status do atendimento.");
    return;
  }

    console.log("Status atualizado no banco:", data);


setStatusLocal((prev) => ({
  ...prev,
  [id]: novoStatus,
}));


const agendamentoAtual = agendamentos.find((item) => item.id === id);

console.log("Agendamento atual:", agendamentoAtual);
console.log("Pagamento atual:", agendamentoAtual?.pagamento);

if (novoStatus === "Concluído") {
  if (!agendamentoAtual?.pagamento) {
    setLinhaPagamentoAberta(id);
  } else {
    setLinhaPagamentoAberta(null);
  }
}
}

 useEffect(() => {
  const buscarAgendamentos = async () => {
    const { data, error } = await supabase
      .from("agendamentos")
      .select(`
        id, data, horario, servico, valor, pagamento, obs, cliente_id, status_agendamento,
        clientes ( id, nome, telefone )
      `)
      .order("data", { ascending: false })
      .order("horario", { ascending: true });
    if (error){
        logger.error("Erro ao buscar agendamentos:", error);
   
    } else {
        setAgendamentos(data || []);
      }
     
  };
  buscarAgendamentos();
}, []);

useEffect(() => {
  const buscarClientes = async () => {
    const { data, error } = await supabase.
    from("clientes")
    .select("id, nome, telefone");

    if (error) {
      logger.error("Erro ao buscar clientes:", error);
    } else {
      // Verifique se os dados estão corretos
      setClientes(data || []);
    }
  };
  
  buscarClientes();
}, []);

  function converterDataParaISO(dataBr) {
    const [dia, mes, ano] = dataBr.split("/");
    return `${ano}-${mes}-${dia}`;
  }
const salvarAgendamento = async () => {
  const { data, horario, cliente_id, servico, valor } = novoAgendamento;

  if (!data || !horario || !cliente_id || !servico || !valor) {
    mostrarMensagem("Por favor, preencha os campos obrigatórios: data, horário, cliente, serviço e valor.");
    return;
  }

  const valorComPonto = valor.replace(",", ".");
  const valorConvertido = parseFloat(valorComPonto);

  if (isNaN(valorConvertido)) {
    mostrarMensagem("O valor informado é inválido. Use números (ex: 25.00 ou 25,00).");
    return;
  }

  const dataConvertida = converterDataParaISO(data);

  const agendamentoFinal = {
    data: dataConvertida,
    horario,
    cliente_id,
    servico,
    valor: valorConvertido,
    pagamento: "",
    obs: novoAgendamento.obs || "",
  };

  const { error } = await supabase.from("agendamentos").insert([agendamentoFinal]);

  if (error) {
    logger.error("Erro ao salvar agendamento:", error);
    mostrarMensagem("Erro ao salvar agendamento. Verifique os dados e tente novamente.");
  } else {
    setNovoAgendamento({
      data: "",
      horario: "",
      cliente_id: "",
      servico: "",
      valor: "",
      obs: "",
    });
    location.reload();
  }
};


const iniciarEdicao = (agendamento) => {
  setEditandoId(agendamento.id);
  setFormEdicao({
   data: agendamento.data
  ? new Date(agendamento.data + "T12:00:00").toLocaleDateString("pt-BR")
  : "",
    cliente_id: String(agendamento.cliente_id ?? ""),
    horario: agendamento.horario || "",
    servico: agendamento.servico || "",
    valor: String(agendamento.valor * 100),
    valorFormatado: formatarMoeda(String(agendamento.valor * 100)),
    pagamento: agendamento.pagamento || "",
    obs: agendamento.obs || "",
  });
};
const formatarMoeda = (valor) => {
  const numero = valor.replace(/\D/g, "");

  const numeroFloat = Number(numero) / 100;

  return numeroFloat.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};



  
const salvarEdicao = async (id) => {
  const valorEmCentavos = String(formEdicao.valor ?? "").replace(/\D/g, "");
  const valorConvertido = Number(valorEmCentavos) / 100;

  if (!formEdicao.data) {
    mostrarMensagem("erro", "Selecione a data.");
    return;
  }

  if (!formEdicao.horario || !formEdicao.horario.trim()) {
    mostrarMensagem("erro", "Selecione o horário.");
    return;
  }

  if (!formEdicao.cliente_id) {
    mostrarMensagem("erro", "Selecione o cliente.");
    return;
  }

  if (!formEdicao.servico || !formEdicao.servico.trim()) {
    mostrarMensagem("erro", "Selecione o serviço.");
    return;
  }

  if (Number.isNaN(valorConvertido) || valorConvertido <= 0) {
    mostrarMensagem("erro", "Informe um valor válido.");
    return;
  }

  const clienteIdValue = String(formEdicao.cliente_id);
  const dataIso = converterDataParaISO(formEdicao.data);

  const { error } = await supabase
    .from("agendamentos")
    .update({
      data: dataIso,
      cliente_id: clienteIdValue,
      horario: formEdicao.horario,
      servico: formEdicao.servico.trim(),
      valor: valorConvertido,
      pagamento: formEdicao.pagamento,
      obs: formEdicao.obs,
    })
    .eq("id", id);

  if (error) {
    logger.error(error);
    mostrarMensagem("erro", "Erro ao atualizar agendamento.");
    return;
  }

  const clienteObj =
    clientes.find((c) => String(c.id) === String(formEdicao.cliente_id)) || null;

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
  mostrarMensagem("sucesso", "Agendamento atualizado com sucesso!");
};
const atualizarCampoEdicao = (campo, valor) => {
    setFormEdicao((prev) => ({ ...prev, [campo]: valor }));
  };

  const excluirAgendamento = async (id) => {
  const { error } = await supabase
    .from("agendamentos")
    .delete()
    .eq("id", id);

  if (error) {
    mostrarMensagem("erro", "Erro ao excluir agendamento.");
    return;
  }

  setAgendamentos((prev) => prev.filter((item) => item.id !== id));

  mostrarMensagem("sucesso", "Agendamento excluído com sucesso!");
};

  const capitalizePrimeiraLetra = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getDiaSemanaComData = (dataISO) => {
    const data = new Date(dataISO + "T12:00:00");
    const diaSemana = data.toLocaleDateString("pt-BR", {
      weekday: "long",
    });
    const dataFormatada = data.toLocaleDateString("pt-BR");
    return `${capitalizePrimeiraLetra(diaSemana)} - ${dataFormatada}`;
  };

  const agendamentosAgrupadosPorDiaSemana = agendamentos.reduce((acc, agendamento) => {
    const diaSemana = getDiaSemanaComData(agendamento.data);
    if (!acc[diaSemana]) {
      acc[diaSemana] = [];
    }
    acc[diaSemana].push(agendamento);
    return acc;
  }, {});

  const salvarPagamento = async (id) => {
  const pagamento = pagamentoSelecionado[id];

  if (!pagamento) {
    mostrarMensagem("erro", "Selecione a forma de pagamento.");
    return;
  }

  abrirConfirmacao(`Deseja salvar o pagamento como "${pagamento}"?`, async () => {
    const { error } = await supabase
      .from("agendamentos")
      .update({ pagamento })
      .eq("id", id);

    if (error) {
      logger.error("Erro ao salvar pagamento:", error);
      mostrarMensagem("erro", "Erro ao salvar pagamento.");
      return;
    }

    setAgendamentos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, pagamento } : item
      )
    );

    setLinhaPagamentoAberta(null);
    mostrarMensagem("sucesso", "Pagamento salvo com sucesso!");
  });
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
  //  setTimeout(() => {
  //   setMensagemSistema({
  //     aberta: false,
  //     tipo: "",
  //     texto: "",
  //   });
  // }, 3000);
};
{/*Editar pagamento*/}
const editarPagamento = (agendamento) => {
  setPagamentoSelecionado((prev) => ({
    ...prev,
    [agendamento.id]: agendamento.pagamento || "",
  }));

  setLinhaPagamentoAberta(agendamento.id);
};
  return (
    <div className="container mx-auto p-4">

    <Header/>

{/* 🟡 FORMULÁRIO DE NOVO AGENDAMENTO */}

<div className="w-full max-w-[100%] mx-auto border border-violet-200 p-4 rounded-lg bg-gray-50 shadow-lg">
<h3 className="text-lg font-normal text-primary mb-4 flex gap-2">
  <ClipboardPlusIcon className="text-secondary "/>
  Novo Agendamento</h3>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

{/* Data e Horário */}

<div className="flex flex-col sm:flex-row gap-4 w-full">
{/* 🗓️ Data */}
<div className="w-full">
<label className="text-sm text-gray-700">Data</label>

<InputData
value={novoAgendamento.data}
onChange={(val) => setNovoAgendamento({ ...novoAgendamento, data: val })}

/>

</div>

{/* ⏰ Horário */}
<div className="w-full">
<label className="text-sm text-gray-700">Horário</label>
<InputHorario
value={novoAgendamento.horario}
onChange={(val) => setNovoAgendamento({ ...novoAgendamento, horario: val })}
className="w-full border px-3 py-2 rounded bg-white text-gray-600 text-sm"
/>
</div>
</div>


{/* Cliente */}
<div className="flex flex-col">
<label className="text-sm mb-1">Cliente</label>



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
<label className="text-sm mb-1">Serviço</label>
<select
value={novoAgendamento.servico}
onChange={(e) => setNovoAgendamento({ ...novoAgendamento, servico: e.target.value })}
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
<label className="text-sm mb-1">Valor</label>
<input
type="text"
placeholder="Valor"
value={novoAgendamento.valor}
onChange={(e) => setNovoAgendamento({ ...novoAgendamento, valor: e.target.value })}
className="input-padrao"
/>
</div>

{/* Observações */}
<div className="flex flex-col ">
<label className="text-sm mb-1">Observações</label>
<textarea
type="text"
placeholder="Observações"
value={novoAgendamento.obs}
onChange={(e) => setNovoAgendamento({ ...novoAgendamento, obs: e.target.value })}
className="input-padrao resize-none h-[38px]"
/>
</div>

</div>
<button
onClick={salvarAgendamento}
className="bg-secondary px-4 py-2 rounded hover:bg-alternativo text-primary shadow flex items-center gap-2 mt-5"
>
<Save size={20} />
<span className="hidden sm:inline">Salvar</span>
</button>
</div>


{/* 🔵 AGRUPAMENTO POR DIA DA SEMANA */}

<div className="w-full max-w-[100%] mx-auto pt-2 px-4  border border-[rgba(128,128,128,0.3)] p-4 rounded-lg bg-gray-50 shadow-lg mt-5">

{Object.entries(agendamentosAgrupadosPorDiaSemana).map(([diaSemana, agendamentosDoDia]) => (
  <div key={diaSemana} className=" pt-5 pb-5 ">

    {/**<h2 className="text-xl font-bold text-primary mb-0  relative pb-[-4px]  "> {diaSemana} </h2> */}
    
  <div className="flex items-center justify-between ">
  <h2 className="text-xl font-normal text-primary mb-0 relative">{diaSemana}</h2>
  
  {/* 🟡 ENVIAR Lembrete */}
  <button 
    type="button"
    onClick={async () => {
      if (!agendamentosDoDia?.length) return;
     const { enviados, copiados, faltandoTelefone } =
  await enviarLembretesEmLote(agendamentosDoDia, { intervalMs: 2000, copiarSemTelefone: false });

mostrarMensagem(
  `Lembretes: ${enviados} enviados no WhatsApp` +
  (copiados ? `, ${copiados} copiados` : "") +
  (faltandoTelefone?.length ? `\n${faltandoTelefone.length} sem telefone (veja Console).` : "")
);

if (faltandoTelefone?.length) {
  console.table(
    faltandoTelefone.map(f => ({ nome: f.nome, mensagem: f.mensagem }))
  );
}

    }}
    className="btn btn-lembrete-primary mb-2 gap-2 bg-primary text-white font-normal px-4 py-2 rounded-lg hover:bg-secondary transition"
    title="Enviar lembretes para todos deste dia"
  >
    <Clock size={24}/>
  Enviar lembrete
    {/*⏰ Enviar lembrete*/}
  </button>
</div>

  <div className="overflow-x-auto">
    <table className="w-full border min-w-[700px]">
      <thead className="bg-gray-100 text-sm uppercase text-cinza font-bold ">
        <tr className="overflow-x-auto">
          <th className="border p-2">Data</th>
          <th className="border p-2">Horário</th>
          <th className="border p-2 min-w-[180px] text-center">Cliente</th>
          <th className="border p-2">Serviço</th>
          <th className="border p-2">Valor</th>
          <th className="border p-2">status</th>
          {/* <th className="border p-2">Pagamento</th> */}
          <th className="border p-2 min-w-[180px] text-center">Obs</th>
          <th className="border p-2">Ações</th>
        </tr>
      </thead>

      <tbody>
        {/* 🔴 LISTAGEM DOS AGENDAMENTOS DO DIA */}
        {agendamentosDoDia.map((agendamento) => (
          <Fragment key={agendamento.id}>
          <tr key={agendamento.id} className="border">
  {/* Data */}

<td className="border-2 p-2 min-w-[100px] text-left">
  {editandoId === agendamento.id ? (
    <InputData
      value={formEdicao.data || ""}
      onChange={(val) => atualizarCampoEdicao("data", val)}
    />
  ) : (
    new Date(agendamento.data + "T12:00:00").toLocaleDateString("pt-BR")
  )}
</td>
  {/* Horário */}
  <td className="border-2 p-2 min-w-[100px] text-left">
  {editandoId === agendamento.id ? (
    <input
      type="time"
      value={formEdicao.horario || ""}
      onChange={(e) => {
        console.log("Novo horário:", e.target.value);
        setFormEdicao((prev) => ({
          ...prev,
          horario: e.target.value,
        }));
      }}
      className="border p-1 rounded w-full"
    />
  ) : (
    agendamento.horario
  )}
</td>

  {/* Cliente */}
  <td className="border-2 p-2 min-w-[180px] text-left ">
    {editandoId === agendamento.id ? (
      <select
        value={formEdicao.cliente_id || ""}
        onChange={(e) => atualizarCampoEdicao("cliente_id", e.target.value)}
        className="border p-1 rounded w-full"
      >
        <option value="">Selecione um cliente</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>{c.nome}</option>
        ))}
      </select>
    ) : (
      agendamento.clientes?.nome || "Sem nome"
    )}
  </td>

  {/* Serviço */}

<td className="border px-2 p-2 min-w-[180px] text-left">
  {editandoId === agendamento.id ? (
    <select
      value={formEdicao.servico || ""}
      onChange={(e) => atualizarCampoEdicao("servico", e.target.value)}
      className="border p-1 rounded w-full"
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
  ) : (
    agendamento.servico
  )}
</td>
  {/* Valor */}
  <td className="p-2 border">
  {editandoId === agendamento.id ? (
    <input
      value={formEdicao.valorFormatado || ""}
      onChange={(e) => {
        const somenteNumeros = e.target.value.replace(/\D/g, "");

        setFormEdicao((prev) => ({
          ...prev,
          valor: somenteNumeros,
          valorFormatado: formatarMoeda(somenteNumeros),
        }));
      }}
      className="border p-1 rounded"
    />
  ) : (
    formatarValor(agendamento.valor)
  )}
</td>




<td className="p-2 border text-center">
  {(() => {
    const status =
      statusLocal[agendamento.id] ||
      (agendamento.status_agendamento === "concluido"
        ? "Concluído"
        : agendamento.status_agendamento === "cancelado"
        ? "Cancelado"
        : "Agendado");

    const pagamentoNormalizado = (agendamento.pagamento || "").toUpperCase();

    if (status === "Concluído" && pagamentoNormalizado === "PENDENTE") {
      return (
        <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">
          Pendente
        </span>
      );
    }

    if (status === "Concluído") {
      return (
        <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">
          Concluído
        </span>
      );
    }

    if (status === "Agendado") {
      return (
        <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">
          Agendado
        </span>
      );
    }

    return (
      <span className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold">
        Cancelado
      </span>
    );
  })()}
</td>

  {/* Observações */}
  <td className="border-2 p-2 min-w-[250px] text-left ">
    {editandoId === agendamento.id ? (
      <input
        value={formEdicao.obs}
        onChange={(e) => atualizarCampoEdicao("obs", e.target.value)}
        className="border p-1 rounded"
      />
    ) : (
      agendamento.obs
    )}
  </td>

  {/* Ações */}
  <td className="p-2 flex gap-2">
    {editandoId === agendamento.id ? (
      <button
      type="button"
        onClick={() => salvarEdicao(agendamento.id)}
        className="text-green-600"
        title="Salvar"
      >
        {/*💙*/}
        <SquareCheckBig size={20} />
      </button>
    ) : (
      <button
      type="button"
        onClick={() => iniciarEdicao(agendamento)}
        className="text-yellow-600"
        title="Editar"
      >
        <Pencil size={20} />
      </button>
    )}
    <button
    type="button"
      onClick={() => excluirAgendamento(agendamento.id)}
      className="text-red-600"
      title="Excluir atendimento"
    >
      <Trash2 size={20} />
    </button>
    
    <button
  type="button"
  onClick={() => alterarStatus(agendamento.id, "Concluído")}
  className="text-green-700 hover:text-green-800"
  title="Concluir atendimento"
>
  <Save size={20}/>
</button>

<button
  type="button"
  onClick={() => alterarStatus(agendamento.id, "Cancelado")}
  className="text-red-600 hover:text-red-700"
  title="Cancelar atendimento"
>
  <X size={24} className=""/>
</button>
     <button
            type="button"
            onClick={() => editarPagamento(agendamento)}
            className="text-primary hover:text-alternativo"
            title="Editar pagamento"
          >
         {/*♥️ */}   <BadgeDollarSign size={20}/>
          </button>
  </td>
</tr>

{/**Pagamento */}

 {linhaPagamentoAberta === agendamento.id && (
  <tr>
    <td colSpan="8" className="bg-blue-50 px-4 py-4 border-b">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        
        <div className="flex items-center gap-2">
          <span className="text-base">💰</span>
          <span className="font-medium text-primary">Registrar pagamento</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full">
          <select
            className="input-padrao max-w-[180px]"
            value={pagamentoSelecionado[agendamento.id] || ""}
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
            <option value="Dinheiro">Dinheiro</option>
            <option value="Pendente">Pendente</option>
          </select>

          <button
            type="button"
            className={`btn ${
              pagamentoSelecionado[agendamento.id]
                ? "btn-green"
                : "btn-gray cursor-not-allowed"
            }`}
            onClick={() => salvarPagamento(agendamento.id)}
            disabled={!pagamentoSelecionado[agendamento.id]}
          >
            Confirmar pagamento
          </button>
       
        </div>
      </div>
    </td>
  </tr>
)}

</Fragment>
        ))}

      </tbody>
    </table>
    </div>
  </div>
))}
 </div>

{/*Confirmação*/}
  {confirmacao.aberto && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg">
      <h2 className="text-lg font-semibold text-primary mb-4">
        Confirmação
      </h2>

      <p className="text-gray-700 mb-6">
        {confirmacao.mensagem}
      </p>

      <div className="flex justify-end gap-3">
        <button
          className="btn btn-gray"
          onClick={() =>
            setConfirmacao({ aberto: false, mensagem: "", onConfirm: null })
          }
        >
          Cancelar
        </button>

        <button
          className="btn btn-green"
          onClick={() => {
            confirmacao.onConfirm();
            setConfirmacao({ aberto: false, mensagem: "", onConfirm: null });
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
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-[90%] max-w-sm shadow-lg">

      <h2
        className={`text-lg font-semibold mb-3 ${
          mensagemSistema.tipo === "erro"
            ? "text-red-600"
            : "text-green-600"
        }`}
      >
        {mensagemSistema.tipo === "erro" ? "Atenção" : "Sucesso"}
      </h2>

      <p className="text-gray-700 mb-5">
        {mensagemSistema.texto}
      </p>

      <div className="flex justify-end">
        <button
          className={
            mensagemSistema.tipo === "erro"
              ? "btn btn-red"
              : "btn btn-green"
          }
          onClick={() =>
            setMensagemSistema({
              aberta: false,
              tipo: "",
              texto: "",
            })
          }
        >
          OK
        </button>
      </div>

    </div>
  </div>
)}
</div>

    
  );

}
export default AgendaAtendimento;

