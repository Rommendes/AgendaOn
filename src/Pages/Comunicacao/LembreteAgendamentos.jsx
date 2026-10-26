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
            <div className="container-formulario mb-4 rounded-lg border border-primary/30 bg-white p-4 shadow-sm">
              {/* Filtros */}
              <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                <div className="col-span-2 md:col-span-1">
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

              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p
                  className={`text-sm ${
                    intervaloInvalido ? 'text-red-600' : 'text-cinza/80'
                  }`}
                >
                  {intervaloInvalido
                    ? 'Hora inicial deve ser menor ou igual à hora final.'
                    : `Exibindo agendamentos entre ${horaInicio} e ${horaFim}.`}
                </p>

                <button
                  type="button"
                  onClick={enviarTodos}
                  disabled={
                    carregando || filtrada.length === 0 || intervaloInvalido
                  }
                  className="btn-icone inline-flex h-10 w-auto items-center justify-center gap-2 self-end rounded border border-secondary px-3 text-sm font-medium text-secondary transition hover:bg-secondary/10 disabled:cursor-not-allowed disabled:border-primary disabled:text-primary disabled:hover:bg-transparent"
                  title={
                    filtrada.length === 0
                      ? 'Nenhum agendamento disponível para envio'
                      : 'Enviar lembretes para todos os clientes listados'
                  }
                >
                  <BellRing size={18} className="shrink-0" />
                  Enviar lembretes
                  <BellRing size={18} className="shrink-0" />
                </button>
              </div>
              {/* Tabela (desktop) */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[700px] border border-primary/30 text-left">
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

              <div className="grid gap-3 md:hidden">
                {carregando ? (
                  <div className="rounded-lg border border-primary/30 bg-white p-4 text-center text-sm text-cinza/80 shadow-sm">
                    Carregando…
                  </div>
                ) : filtrada.length === 0 ? (
                  <div className="rounded-lg border border-primary/30 bg-white p-4 text-center text-sm text-cinza/80 shadow-sm">
                    Nenhum agendamento no intervalo.
                  </div>
                ) : (
                  filtrada.map((ag) => (
                    <div
                      key={ag.id}
                      className="rounded-lg border border-primary/30 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-cinza/70">Cliente</p>

                          <h2 className="font-semibold text-primary">
                            {ag.clientes?.nome || '-'}
                          </h2>
                        </div>

                        {status[ag.id] && (
                          <span
                            className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${
                              status[ag.id] === 'enviado'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-cinza'
                            }`}
                          >
                            {status[ag.id] === 'enviado'
                              ? 'Enviado'
                              : 'Copiado'}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="col-span-2">
                          <p className="text-xs text-cinza/70">Serviço</p>

                          <p className="text-cinza">{ag.servico || '-'}</p>
                        </div>

                        <div>
                          <p className="text-xs text-cinza/70">Data</p>

                          <p className="text-cinza">
                            {new Date(`${ag.data}T12:00:00`).toLocaleDateString(
                              'pt-BR'
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-cinza/70">Horário</p>

                          <p className="font-medium text-primary">
                            {horaBR(ag.horario)}
                          </p>
                        </div>

                        {ag.obs && (
                          <div className="col-span-2">
                            <p className="text-xs text-cinza/70">Observações</p>

                            <p className="break-words text-cinza">{ag.obs}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex justify-end border-t border-cinza/20 pt-3">
                        <button
                          type="button"
                          onClick={() => enviarUm(ag)}
                          disabled={Boolean(enviando[ag.id])}
                          className="btn-icone inline-flex h-10 w-auto items-center justify-center gap-2 self-end rounded border border-secondary px-3 text-sm font-medium text-secondary transition hover:bg-secondary/10 disabled:cursor-not-allowed disabled:border-primary disabled:text-primary disabled:hover:bg-transparent"
                          title={`Enviar lembrete para ${
                            ag.clientes?.nome || 'o cliente'
                          }`}
                        >
                          <BellRing size={18} className="shrink-0" />

                          {enviando[ag.id] ? 'Enviando...' : 'Enviar lembrete'}
                        </button>
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
