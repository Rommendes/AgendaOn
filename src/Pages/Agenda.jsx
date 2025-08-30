import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import { Pencil, Trash2, Save } from "lucide-react";

import InputData from "../Componentes/CamposReutilizaveis/InputData"
import InputHorario from "../Componentes/CamposReutilizaveis/InputHorario";
import Header from "../Componentes/Header/Header";

import { enviarLembretesEmLote, enviarLembreteDeAgendamento } from "../utils/whatsapp"; 
function formatarValor(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

const AgendaAtendimento = () => {
  const [clientes, setClientes] = useState([]);
  const [novoAgendamento, setNovoAgendamento] = useState({
    data: "",
    horario: "",
    cliente_id: "",
    servico: "",
    valor: "",
    pagamento: "",
    obs: "",
  });
  const [agendamentos, setAgendamentos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [formEdicao, setFormEdicao] = useState({
    horario: "",
    servico: "",
    valor: "",
    pagamento: "",
    obs: ""
  });
  {/**
  useEffect(() => {
    const buscarClientes = async () => {
      const { data, error } = await supabase.from("clientes").select("id, nome");
      if (error) console.error("Erro ao buscar clientes:", error);
      else setClientes(data);
    };
    buscarClientes();
  }, []);

  useEffect(() => {
    const buscarAgendamentos = async () => {
      const { data, error } = await supabase
        .from("agendamentos")
        .select(`
          id, data, horario, servico, valor, pagamento, obs, cliente_id,
          clientes (id, nome, telefone )
        `)
        .order("data", { ascending: true })
        .order("horario", { ascending: true });
      if (error) console.error("Erro ao buscar agendamentos:", error);
      else setAgendamentos(data);
    };
    buscarAgendamentos();
  }, []);
 
 */}

 useEffect(() => {
  const buscarAgendamentos = async () => {
    const { data, error } = await supabase
      .from("agendamentos")
      .select(`
        id, data, horario, servico, valor, pagamento, obs, cliente_id,
        clientes ( id, nome, telefone )
      `)
      .order("data", { ascending: true })
      .order("horario", { ascending: true });
    if (error) console.error("Erro ao buscar agendamentos:", error);
    else setAgendamentos(data);
  };
  buscarAgendamentos();
}, []);

  
  function converterDataParaISO(dataBr) {
    const [dia, mes, ano] = dataBr.split("/");
    return `${ano}-${mes}-${dia}`;
  }

  const salvarAgendamento = async () => {
    const { data, horario, cliente_id, servico, valor, pagamento } = novoAgendamento;

    if (!data || !horario || !cliente_id || !servico || !valor || !pagamento) {
      alert("Por favor, preencha todos os campos obrigatórios: data, horário, cliente, serviço, valor e forma de pagamento.");
      return;
    }

    const valorComPonto = valor.replace(",", ".");
    const valorConvertido = parseFloat(valorComPonto);
    if (isNaN(valorConvertido)) {
      alert("O valor informado é inválido. Use números (ex: 25.00 ou 25,00).");
      return;
    }

    const dataConvertida = converterDataParaISO(data);

    const agendamentoFinal = {
      ...novoAgendamento,
      data: dataConvertida,
      valor: valorConvertido,
    };

    const { error } = await supabase.from("agendamentos").insert([agendamentoFinal]);

    if (error) {
      console.error("Erro ao salvar agendamento:", error);
      alert("Erro ao salvar agendamento. Verifique os dados e tente novamente.");
    } else {
      setNovoAgendamento({
        data: "",
        horario: "",
        cliente_id: "",
        servico: "",
        valor: "",
        pagamento: "",
        obs: "",
      });
      location.reload();
    }
  };

  const iniciarEdicao = (agendamento) => {
    setEditandoId(agendamento.id);
    setFormEdicao({
      horario: agendamento.horario,
      servico: agendamento.servico,
      valor: agendamento.valor,
      pagamento: agendamento.pagamento,
      obs: agendamento.obs
    });
  };

  const atualizarCampoEdicao = (campo, valor) => {
    setFormEdicao((prev) => ({ ...prev, [campo]: valor }));
  };

  const salvarEdicao = async (id) => {
    const valorConvertido = parseFloat(formEdicao.valor.replace(",", "."));
    if (isNaN(valorConvertido)) {
      alert("O valor informado é inválido. Use números (ex: 25.00 ou 25,00).");
      return;
    }

    const { error } = await supabase
      .from("agendamentos")
      .update({ ...formEdicao, valor: valorConvertido })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar agendamento:", error);
      alert("Erro ao atualizar. Verifique os dados.");
    } else {
      alert("Agendamento atualizado com sucesso!");
      setEditandoId(null);
      location.reload();
    }
  };

  const excluirAgendamento = async (id) => {
    const { error } = await supabase.from("agendamentos").delete().eq("id", id);
    if (error) console.error("Erro ao excluir:", error);
    else {
      alert("Agendamento excluído com sucesso!");
      location.reload();
    }
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



  
  return (
    <div className="container mx-auto p-4">

    <Header/>

{/* 🟡 FORMULÁRIO DE NOVO AGENDAMENTO */}

<div className="w-full max-w-[100%] mx-auto border border-violet-200 p-4 rounded-lg bg-gray-50 shadow-lg">
<h3 className="text-lg font-bold text-primary mb-4">Novo Agendamento</h3>

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
onChange={(e) => setNovoAgendamento({ ...novoAgendamento, cliente_id: e.target.value })}
className="input-padrao"
>
<option value="">Selecione um cliente</option>
{clientes.map((cliente) => (
  <option key={cliente.id} value={cliente.id}>
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
<option value="tintura">Tintura</option>
<option value="Corte">Corte</option>
<option value="escova progressiva">Escova progressiva</option>
<option value="butox">Butox</option>
<option value="manicure">Manicure</option>
<option value="maquiagem">Maquiagem</option>
<option value="sobrancelha">Sobrancelha</option>
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
{/* Pagamento */}
<div className="flex flex-col">
<label className="text-sm text-gray-700 mb-1">Forma de Pagamento</label>
<select
value={novoAgendamento.pagamento}
onChange={(e) => setNovoAgendamento({ ...novoAgendamento, pagamento: e.target.value })}
className="input-padrao"
>
<option value="" >Selecione</option>
<option value="Dinheiro">Dinheiro</option>
<option value="Cartão">Cartão</option>
<option value="Pix">Pix</option>
<option value="Não pagou">Não pagou</option>
</select>
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
className="bg-secondary px-4 py-2 rounded hover:bg-alternativo text-white shadow flex items-center gap-2 mt-5"
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
    
  <div className="flex items-center justify-between">
  <h2 className="text-xl font-bold text-primary mb-0 relative">{diaSemana}</h2>
  <button
    type="button"
    onClick={async () => {
      if (!agendamentosDoDia?.length) return;
     const { enviados, copiados, faltandoTelefone } =
  await enviarLembretesEmLote(agendamentosDoDia, { intervalMs: 2000, copiarSemTelefone: false });

alert(
  `Lembretes: ${enviados} enviados no WhatsApp` +
  (copiados ? `, ${copiados} copiados` : "") +
  (faltandoTelefone?.length ? `\n${faltandoTelefone.length} sem telefone (veja Console).` : "")
);

// opcional: mostra no console quem ficou sem telefone
if (faltandoTelefone?.length) {
  console.table(
    faltandoTelefone.map(f => ({ nome: f.nome, mensagem: f.mensagem }))
  );
}

    }}
    className="btn btn-alt"
    title="Enviar lembretes para todos deste dia"
  >
    ⏰ Enviar lembretes do dia
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
          <th className="border p-2">Pagamento</th>
          <th className="border p-2 min-w-[180px] text-center">Observações</th>
          <th className="border p-2">Ações</th>
        </tr>
      </thead>
      <tbody>
        {/* 🔴 LISTAGEM DOS AGENDAMENTOS DO DIA */}
        {agendamentosDoDia.map((agendamento) => (
          <tr key={agendamento.id} className="border">

            <td className="border-2 px-4 py-3">
            {new Date(agendamento.data + "T12:00:00").toLocaleDateString("pt-BR")}
            </td>

            <td className="p-2 border">
              {editandoId === agendamento.id ? (
                <input
                  value={formEdicao.horario}
                  onChange={(e) => atualizarCampoEdicao("horario", e.target.value)}
                  className="border p-1 rounded"
                />
              ) : (
                agendamento.horario
              )}
            </td>
            <td className="border-2 p-2 min-w-[250px] text-left ">{agendamento.clientes?.nome || "Sem nome"}</td>
            <td className="border px-2 py-3 text-left">
              {editandoId === agendamento.id ? (
                <input
                  value={formEdicao.servico}
                  onChange={(e) => atualizarCampoEdicao("servico", e.target.value)}
                  className="border p-1 rounded"
                />
              ) : (
                agendamento.servico
              )}
            </td>
            <td className="p-2 border">
              {editandoId === agendamento.id ? (
                <input
                  value={formEdicao.valor}
                  onChange={(e) => atualizarCampoEdicao("valor", e.target.value)}
                  className="border p-1 rounded"
                />
              ) : (
                formatarValor(agendamento.valor)
              )}
            </td>
            <td className="p-2 border">
              {editandoId === agendamento.id ? (
                <input
                  value={formEdicao.pagamento}
                  onChange={(e) => atualizarCampoEdicao("pagamento", e.target.value)}
                  className="border p-1 rounded"
                />
              ) : (
                agendamento.pagamento
              )}
            </td>
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
        {editandoId === agendamento.id ? (
  <button
    type="button"
    onClick={() => salvarEdicao(agendamento.id)}
    className="btn btn-green"
    title="Salvar edição"
  >
    <Save size={18} />
    <span className="hidden sm:inline">Salvar</span>
  </button>
) : (
  <td>
  <button
    type="button"
    onClick={() => iniciarEdicao(agendamento)}
    className="btn btn-yellow"
    title="Editar agendamento"
  >
    
    <Pencil size={18} />
    <span className="hidden sm:inline">Editar</span>
  </button>
  </td>
)}
<td>
<button
  type="button"
  onClick={() => excluirAgendamento(agendamento.id)}
  className="btn btn-red"
  title="Excluir agendamento"
>
  <Trash2 size={18} />
  <span className="hidden sm:inline">Excluir</span>
</button>
</td>

          </tr>
        ))}
      </tbody>
    </table>
    </div>
  </div>
))}
 </div>
</div>

    
  );
};

export default AgendaAtendimento;

