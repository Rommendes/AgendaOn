import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../Componentes/Header/Header.jsx';
import { supabase } from '../../api/supabaseClient.js';
import {
  mensagemLembrete,
  abrirWhatsApp,
  copiarTexto,
} from '../../utils/whatsapp.jsx';
import { createLogger } from '../../lib/logger.js';
import { BellRing, Send } from 'lucide-react';
const logger = createLogger('LembreteAgendamentos');

function hojeISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
const soDigitos = (t) => (t ?? '').toString().replace(/\D/g, '');
const horaBR = (h) => (typeof h === 'string' ? h.slice(0, 5) : '-');

// compara "HH:mm" entre [inicio, fim]
function horaDentroIntervalo(hhmm, inicio, fim) {
  const toNum = (s) => {
    const [h, m] = (s || '00:00').split(':').map(Number);
    return h * 60 + m;
  };
  const t = toNum(hhmm);
  return t >= toNum(inicio) && t <= toNum(fim);
}

export default function LembreteAgendamentos() {
  const [dataBase, setDataBase] = useState(hojeISO());
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFim, setHoraFim] = useState('20:00');

  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState({}); // id -> true/false
  const [status, setStatus] = useState({}); // id -> "enviado" | "copiado"

  // Busca os agendamentos do DIA (filtraremos as horas no frontend)
  useEffect(() => {
    (async () => {
      setCarregando(true);
      try {
        let { data, error } = await supabase
          .from('agendamentos')
          .select(
            `
            id, data, horario, servico, obs, cliente_id,
            clientes ( id, nome, telefone )
          `
          )
          .eq('data', dataBase)
          .order('horario', { ascending: true });

        if (error) throw error;
        setLista(data || []);
      } catch (e) {
        logger.error(e);
        setLista([]);
      } finally {
        setCarregando(false);
      }
    })();
  }, [dataBase]);

  // Filtro pelo intervalo de horário
  const filtrada = useMemo(() => {
    return (lista || []).filter((a) =>
      horaDentroIntervalo(a.horario || '00:00', horaInicio, horaFim)
    );
  }, [lista, horaInicio, horaFim]);

  async function enviarUm(ag) {
    const id = ag.id;
    setEnviando((s) => ({ ...s, [id]: true }));
    try {
      const nome = ag.clientes?.nome || 'Cliente';
      const telefone = soDigitos(ag.clientes?.telefone || '');
      const texto = mensagemLembrete({
        nome,
        servico: ag.servico || '',
        data: new Date(ag.data + 'T12:00:00').toLocaleDateString('pt-BR'),
        hora: horaBR(ag.horario),
        observacoes: ag.obs || '',
      });

      if (telefone) {
        abrirWhatsApp(telefone, texto);
        setStatus((s) => ({ ...s, [id]: 'enviado' }));
      } else {
        await copiarTexto(texto);
        setStatus((s) => ({ ...s, [id]: 'copiado' }));
        alert(`Telefone ausente para ${nome}. Mensagem copiada.`);
      }
    } catch (e) {
      logger.error(e);
      alert('Não foi possível preparar o lembrete.');
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

  const intervaloInvalido = horaInicio > horaFim; // simples: garante início <= fim

  return (
    <>
      <Header
        title="Lembretes de Agendamentos"
        voltarPara="/comunicacao-menu"
      />
      <div className="main">
        <div className="main-container">
          <div className="container-formulario">
            <div className="mb-4 text-primary">
              <h1 className="flex gap-2 text-primary">
                <BellRing size={25} className="text-secondary" />
                Lembretes de Agendamentos
              </h1>
              <p className="text-cinza/80">
                Lembre seu cliente do agendamento.
              </p>
            </div>
            <div className="container-formulario">
              {/* Filtros */}
              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="col-span-1">
                  <label className="text-sm text-cinza/80">Dia</label>
                  <input
                    type="date"
                    value={dataBase}
                    onChange={(e) => setDataBase(e.target.value)}
                    className="input-padrao"
                  />
                </div>

                <div>
                  <label className="text-sm text-cinza/80">Hora inicial</label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="input-padrao"
                  />
                </div>

                <div>
                  <label className="text-sm text-cinza/80">Hora final</label>
                  <input
                    type="time"
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
                    className="input-padrao"
                  />
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <p
                  className={`text-sm ${intervaloInvalido ? 'text-red-600' : 'text-cinza/80'}`}
                >
                  {intervaloInvalido
                    ? '⚠️ Hora inicial deve ser menor ou igual à hora final.'
                    : `Exibindo agendamentos entre ${horaInicio} e ${horaFim}.`}
                </p>
                <button
                  type="button"
                  onClick={enviarTodos}
                  className="btn btn-alt inline-flex items-center gap-2 transition hover:bg-secondary/10"
                  disabled={
                    carregando || filtrada.length === 0 || intervaloInvalido
                  }
                  title="Enviar lembrete para todos listados"
                >
                  <Send size={18} className="shrink-0 text-secondary" />
                  <span className="text-primary">Enviar todos</span>
                </button>
              </div>

              {/* Tabela (desktop) */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[700px] border text-left">
                  <thead className="bg-alternativo/10 text-sm font-bold uppercase text-primary">
                    <tr>
                      <th className="border p-2">Cliente</th>
                      <th className="border p-2">Serviço</th>
                      <th className="border p-2">Data</th>
                      <th className="border p-2">Hora</th>
                      {/* <th className="border p-2">Obs.</th> */}
                      <th className="border p-2">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carregando ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-4 text-center text-sm text-cinza/80"
                        >
                          Carregando…
                        </td>
                      </tr>
                    ) : filtrada.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-4 text-center text-sm text-cinza/80"
                        >
                          Nenhum agendamento no intervalo.
                        </td>
                      </tr>
                    ) : (
                      filtrada.map((ag) => (
                        <tr key={ag.id} className="border">
                          <td className="p-2">{ag.clientes?.nome || '-'}</td>
                          <td className="p-2">{ag.servico || '-'}</td>
                          <td className="p-2">
                            {new Date(ag.data + 'T12:00:00').toLocaleDateString(
                              'pt-BR'
                            )}
                          </td>
                          <td className="p-2">{horaBR(ag.horario)}</td>
                          {/* <td className="p-2">{ag.obs || '-'}</td> */}
                          <td className="p-2">
                            <button
                              type="button"
                              onClick={() => enviarUm(ag)}
                              disabled={!!enviando[ag.id]}
                              className={`btn inline-flex items-center gap-2 transition hover:bg-secondary/20 ${
                                enviando[ag.id] ? 'btn-gray' : 'btn-alt'
                              }`}
                              title="Enviar lembrete."
                            >
                              {enviando[ag.id] ? (
                                'Enviando...'
                              ) : (
                                <>
                                  <BellRing
                                    size={18}
                                    className="text-secondary"
                                  />
                                  <span className="text-primary">Lembrete</span>
                                </>
                              )}
                            </button>

                            {status[ag.id] && (
                              <span
                                className={`ml-2 text-xs ${
                                  status[ag.id] === 'enviado'
                                    ? 'text-emerald-700'
                                    : 'text-cinza/80'
                                }`}
                              >
                                {status[ag.id] === 'enviado'
                                  ? 'Enviado'
                                  : 'Copiado'}
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
                  <div className="rounded-lg border bg-white p-3 text-center text-sm text-cinza/80 shadow">
                    Carregando…
                  </div>
                ) : filtrada.length === 0 ? (
                  <div className="rounded-lg border bg-white p-3 text-center text-sm text-cinza/80 shadow">
                    Nenhum agendamento no intervalo.
                  </div>
                ) : (
                  filtrada.map((ag) => (
                    <div
                      key={ag.id}
                      className="rounded-lg border bg-white p-3 shadow"
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800">
                          {ag.clientes?.nome || '-'}
                        </h2>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-cinza/80">
                        <p>
                          <strong>Serviço:</strong> {ag.servico || '-'}
                        </p>
                        <p>
                          <strong>Data:</strong>{' '}
                          {new Date(ag.data + 'T12:00:00').toLocaleDateString(
                            'pt-BR'
                          )}
                        </p>
                        <p>
                          <strong>Hora:</strong> {horaBR(ag.horario)}
                        </p>
                        {ag.obs && (
                          <p>
                            <strong>Obs.:</strong> {ag.obs}
                          </p>
                        )}
                      </div>
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => enviarUm(ag)}
                          disabled={!!enviando[ag.id]}
                          className={`btn inline-flex w-full items-center justify-center gap-2 ${
                            enviando[ag.id] ? 'btn-gray' : 'btn-alt'
                          }`}
                        >
                          {enviando[ag.id] ? (
                            'Enviando...'
                          ) : (
                            <>
                              <BellRing
                                size={18}
                                className="shrink-0 text-secondary"
                              />
                              <span className="text-primary">Lembrete</span>
                            </>
                          )}
                        </button>
                        {status[ag.id] && (
                          <p
                            className={`mt-1 text-xs ${
                              status[ag.id] === 'enviado'
                                ? 'text-emerald-700'
                                : 'text-cinza/80'
                            }`}
                          >
                            {status[ag.id] === 'enviado'
                              ? 'Enviado'
                              : 'Copiado'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
