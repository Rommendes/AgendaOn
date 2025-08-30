import React, { useEffect, useMemo, useState } from "react";
import Header from "../Componentes/Header/Header";
import { supabase } from "../api/supabaseClient";
import { mensagemLembrete, abrirWhatsApp, copiarTexto } from "../utils/whatsapp.jsx";

function hojeISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const soDigitos = (t) => (t ?? "").toString().replace(/\D/g, "");
const horaBR = (h) => (typeof h === "string" ? h.slice(0, 5) : "-");

// compara "HH:mm" entre [inicio, fim]
function horaDentroIntervalo(hhmm, inicio, fim) {
  const toNum = (s) => {
    const [h, m] = (s || "00:00").split(":").map(Number);
    return h * 60 + m;
  };
  const t = toNum(hhmm);
  return t >= toNum(inicio) && t <= toNum(fim);
}

export default function LembreteAgendamentos() {
  const [dataBase, setDataBase] = useState(hojeISO());
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFim, setHoraFim] = useState("20:00");
  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState({}); // id -> true/false
  const [status, setStatus] = useState({});     // id -> "enviado" | "copiado"

  // Busca os agendamentos do DIA (filtraremos as horas no frontend)
  useEffect(() => {
    (async () => {
      setCarregando(true);
      try {
        let { data, error } = await supabase
          .from("agendamentos")
          .select(`
            id, data, horario, servico, obs, cliente_id,
            clientes ( id, nome, telefone )
          `)
          .eq("data", dataBase)
          .order("horario", { ascending: true });

        if (error) throw error;
        setLista(data || []);
      } catch (e) {
        console.error(e);
        setLista([]);
      } finally {
        setCarregando(false);
      }
    })();
  }, [dataBase]);

  // Filtro por nome e intervalo de hora
  const filtrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (lista || [])
      .filter((a) => horaDentroIntervalo(a.horario || "00:00", horaInicio, horaFim))
      .filter((a) =>
        (a.clientes?.nome || "").toLowerCase().includes(termo)
      );
  }, [lista, busca, horaInicio, horaFim]);

  async function enviarUm(ag) {
    const id = ag.id;
    setEnviando((s) => ({ ...s, [id]: true }));
    try {
      const nome = ag.clientes?.nome || "Cliente";
      const telefone = soDigitos(ag.clientes?.telefone || "");
      const texto = mensagemLembrete({
        nome,
        servico: ag.servico || "",
        data: new Date(ag.data + "T12:00:00").toLocaleDateString("pt-BR"),
        hora: horaBR(ag.horario),
        observacoes: ag.obs || "",
      });

      if (telefone) {
        abrirWhatsApp(telefone, texto);
        setStatus((s) => ({ ...s, [id]: "enviado" }));
      } else {
        await copiarTexto(texto);
        setStatus((s) => ({ ...s, [id]: "copiado" }));
        alert(`Telefone ausente para ${nome}. Mensagem copiada.`);
      }
    } catch (e) {
      console.error(e);
      alert("Não foi possível preparar o lembrete.");
    } finally {
      setEnviando((s) => ({ ...s, [id]: false }));
    }
  }

  async function enviarTodos() {
    if (filtrada.length === 0) return;
    for (let i = 0; i < filtrada.length; i++) {
      // pequena pausa para reduzir bloqueio de pop-ups
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 300));
      // eslint-disable-next-line no-await-in-loop
      await enviarUm(filtrada[i]);
    }
  }

  const intervaloInvalido =
    horaInicio > horaFim; // simples: garante início <= fim

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Header />

      <div className="w-full max-w-[100%] mx-auto border border-[rgba(128,128,128,0.3)] p-4 rounded-lg bg-gray-50 shadow-lg">
        <h1 className="text-lg font-bold text-primary mb-3">Lembretes de Agendamentos</h1>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
          <div className="col-span-1">
            <label className="text-sm text-gray-700">Dia</label>
            <input
              type="date"
              value={dataBase}
              onChange={(e) => setDataBase(e.target.value)}
              className="input-padrao"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Hora inicial</label>
            <input
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="input-padrao"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Hora final</label>
            <input
              type="time"
              value={horaFim}
              onChange={(e) => setHoraFim(e.target.value)}
              className="input-padrao"
            />
          </div>

          <div className="col-span-1">
            <label className="text-sm text-gray-700">Buscar cliente</label>
            <input
              type="text"
              placeholder="Digite o nome"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="input-padrao"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className={`text-sm ${intervaloInvalido ? "text-red-600" : "text-gray-600"}`}>
            {intervaloInvalido
              ? "⚠️ Hora inicial deve ser menor ou igual à hora final."
              : `Exibindo agendamentos entre ${horaInicio} e ${horaFim}.`}
          </p>
          <button
            type="button"
            onClick={enviarTodos}
            className="btn btn-alt"
            disabled={carregando || filtrada.length === 0 || intervaloInvalido}
            title="Enviar lembrete para todos listados"
          >
            ⏰ Enviar todos
          </button>
        </div>

        {/* Tabela (desktop) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border min-w-[700px] text-left">
            <thead className="bg-gray-100 text-sm uppercase text-gray-600 font-bold">
              <tr>
                <th className="border p-2">Cliente</th>
                <th className="border p-2">Serviço</th>
                <th className="border p-2">Data</th>
                <th className="border p-2">Hora</th>
                <th className="border p-2">Obs.</th>
                <th className="border p-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-sm text-gray-600">
                    Carregando…
                  </td>
                </tr>
              ) : filtrada.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-sm text-gray-600">
                    Nenhum agendamento no intervalo.
                  </td>
                </tr>
              ) : (
                filtrada.map((ag) => (
                  <tr key={ag.id} className="border">
                    <td className="p-2">{ag.clientes?.nome || "-"}</td>
                    <td className="p-2">{ag.servico || "-"}</td>
                    <td className="p-2">
                      {new Date(ag.data + "T12:00:00").toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-2">{horaBR(ag.horario)}</td>
                    <td className="p-2">{ag.obs || "-"}</td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => enviarUm(ag)}
                        disabled={!!enviando[ag.id]}
                        className={`btn ${enviando[ag.id] ? "btn-gray" : "btn-alt"}`}
                      >
                        {enviando[ag.id] ? "Enviando..." : "⏰ Lembrete"}
                      </button>
                      {status[ag.id] && (
                        <span
                          className={`ml-2 text-xs ${
                            status[ag.id] === "enviado" ? "text-emerald-700" : "text-gray-600"
                          }`}
                        >
                          {status[ag.id] === "enviado" ? "Enviado" : "Copiado"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Cards (mobile) */}
        <div className="grid gap-3 sm:hidden">
          {carregando ? (
            <div className="border rounded-lg p-3 bg-white shadow text-center text-sm text-gray-600">
              Carregando…
            </div>
          ) : filtrada.length === 0 ? (
            <div className="border rounded-lg p-3 bg-white shadow text-center text-sm text-gray-600">
              Nenhum agendamento no intervalo.
            </div>
          ) : (
            filtrada.map((ag) => (
              <div key={ag.id} className="border rounded-lg p-3 bg-white shadow">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">{ag.clientes?.nome || "-"}</h2>
                </div>
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  <p><strong>Serviço:</strong> {ag.servico || "-"}</p>
                  <p>
                    <strong>Data:</strong>{" "}
                    {new Date(ag.data + "T12:00:00").toLocaleDateString("pt-BR")}
                  </p>
                  <p><strong>Hora:</strong> {horaBR(ag.horario)}</p>
                  {ag.obs && <p><strong>Obs.:</strong> {ag.obs}</p>}
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => enviarUm(ag)}
                    disabled={!!enviando[ag.id]}
                    className={`btn w-full ${enviando[ag.id] ? "btn-gray" : "btn-alt"}`}
                  >
                    {enviando[ag.id] ? "Enviando..." : "⏰ Lembrete"}
                  </button>
                  {status[ag.id] && (
                    <p
                      className={`mt-1 text-xs ${
                        status[ag.id] === "enviado" ? "text-emerald-700" : "text-gray-600"
                      }`}
                    >
                      {status[ag.id] === "enviado" ? "Enviado" : "Copiado"}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
