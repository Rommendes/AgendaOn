import { useEffect, useMemo, useState } from "react";
import { supabase } from "../api/supabaseClient";
import Header from "../Componentes/Header/Header";
import { enviarLembretesEmLote, enviarLembreteDeAgendamento } from "../utils/whatsapp.jsx";

// --- helpers simples ---
function hojeISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10); // YYYY-MM-DD
}
function formatarBRDataISO(iso) {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR");
}
function formatarValorBR(v) {
  if (v == null) return "";
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : String(v);
}
// retorna { ano, semana } no padrão ISO
function getISOWeekInfo(dateISO) {
  const d = new Date(dateISO + "T12:00:00");
  // ISO week: quinta-feira como referência
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7; // 0=segunda
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstThursdayDayNr = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstThursdayDayNr + 3);
  const week = 1 + Math.round((target - firstThursday) / (7 * 24 * 3600 * 1000));
  return { ano: target.getFullYear(), semana: week };
}

export default function AgendaSemanal() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      setCarregando(true);
      const { data, error } = await supabase
        .from("agendamentos")
        .select(`
          id, data, horario, servico, valor, pagamento, obs, cliente_id,
          clientes ( id, nome, telefone )
        `)
        .gte("data", hojeISO())          // somente hoje em diante
        .order("data", { ascending: true })
        .order("horario", { ascending: true });

      if (error) {
        console.error("Erro ao buscar agendamentos:", error);
        setAgendamentos([]);
      } else {
        setAgendamentos(data || []);
      }
      setCarregando(false);
    })();
  }, []);

  // Agrupa por semana (ISO) e por dia
  const semanas = useMemo(() => {
    const mapa = new Map(); // chave: `${ano}-W${semana}`
    for (const ag of agendamentos) {
      const { ano, semana } = getISOWeekInfo(ag.data);
      const chave = `${ano}-W${String(semana).padStart(2, "0")}`;
      if (!mapa.has(chave)) mapa.set(chave, { ano, semana, dias: new Map() });
      const grupo = mapa.get(chave);

      // agrupar por dia
      if (!grupo.dias.has(ag.data)) grupo.dias.set(ag.data, []);
      grupo.dias.get(ag.data).push(ag);
    }

    // ordenar dias dentro da semana
    const array = Array.from(mapa.values()).map((sem) => {
      const diasOrdenados = Array.from(sem.dias.entries())
        .sort((a, b) => (a[0] < b[0] ? -1 : 1)); // por data asc
      return { ...sem, dias: diasOrdenados };
    });

    // ordenar semanas (a partir da atual, já vem asc)
    array.sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano;
      return a.semana - b.semana;
    });

    return array;
  }, [agendamentos]);

  return (
    <div className="container mx-auto p-4">
      <Header />
      <h1 className="text-xl font-bold text-primary mb-4">Agenda Semanal (atual e futura)</h1>

      {carregando && <div className="text-gray-600">Carregando…</div>}

      {!carregando && semanas.length === 0 && (
        <div className="text-gray-600">Não há agendamentos futuros.</div>
      )}

      {!carregando && semanas.map((sem) => (
        <div key={`${sem.ano}-${sem.semana}`} className="mb-8 border rounded-lg bg-white shadow">
          {/* Cabeçalho da semana */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-t-lg">
            <h2 className="font-semibold text-primary">
              Semana {sem.semana} de {sem.ano}
            </h2>
            {/* Botão: lembretes da semana inteira */}
            <button
              type="button"
              className="btn btn-primary"
              title="Enviar lembretes para todos desta semana"
              onClick={async () => {
                const listaSemana = sem.dias.flatMap(([_, ags]) => ags);
                const { enviados, copiados } = await enviarLembretesEmLote(listaSemana, { intervalMs: 2000 });
                alert(`Semana ${sem.semana}: ${enviados} enviados no WhatsApp${copiados ? `, ${copiados} copiados` : ""}.`);
              }}
            >
              ⏰ Lembretes da semana
            </button>
          </div>

          {/* Dias da semana */}
          <div className="p-3 space-y-6">
            {sem.dias.map(([dataISO, ags]) => (
              <div key={dataISO} className="border border-gray-200 rounded-md">
                {/* Cabeçalho do dia */}
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-t-md">
                  <div className="font-medium text-cinza">
                    {formatarBRDataISO(dataISO)}
                  </div>
                  <button
                    type="button"
                    className="btn btn-lembrete-secondary"
                    onClick={async () => {
                      const { enviados, copiados } = await enviarLembretesEmLote(ags, { intervalMs: 2000 });
                      alert(`${formatarBRDataISO(dataISO)}: ${enviados} enviados${copiados ? `, ${copiados} copiados` : ""}.`);
                    }}
                  >
                    ⏰ Lembretes do dia
                  </button>
                </div>

                {/* Lista do dia */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="bg-gray-100 text-sm uppercase text-cinza">
                        <th className="p-2 text-left">Hora</th>
                        <th className="p-2 text-left min-w-[180px]">Cliente</th>
                        <th className="p-2 text-left">Serviço</th>
                        <th className="p-2 text-right">Valor</th>
                        <th className="p-2 text-left">Obs</th>
                        <th className="p-2 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ags.map((ag) => (
                        <tr key={ag.id} className="border-t">
                          <td className="p-2">{ag.horario}</td>
                          <td className="p-2">{ag.clientes?.nome || "Sem nome"}</td>
                          <td className="p-2">{ag.servico || "-"}</td>
                          <td className="p-2 text-right">{formatarValorBR(ag.valor)}</td>
                          <td className="p-2">{ag.obs || "-"}</td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              className="btn btn-lembrete-primary"
                              onClick={async () => {
                                const r = await enviarLembreteDeAgendamento(ag);
                                if (r === "copiado") alert("Sem telefone. Mensagem copiada para a área de transferência.");
                              }}
                            >
                              ⏰ Lembrar cliente
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
      ))}
    </div>
  );
}
