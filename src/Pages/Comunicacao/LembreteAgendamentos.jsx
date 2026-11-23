import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../Componentes/Header/Header.jsx';
import { supabase } from '../../api/supabaseClient.js';
import { useAuth } from '../../context/AuthContext';
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
  const { empresaId, loadingEmpresa, erroEmpresa } = useAuth();
  const [fila, setFila] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // Busca os agendamentos do DIA (filtraremos as horas no frontend)
  useEffect(() => {
    let ativo = true;

    setLista([]);
    setFila(null);
    setAviso('');

    if (!empresaId || loadingEmpresa || erroEmpresa || !dataBase) {
      setCarregando(false);
      return;
    }

    const buscar = async () => {
      setCarregando(true);

      try {
        const { data, error } = await supabase
          .from('agendamentos')
          .select(
            `
          id, empresa_id, data, horario, servico, obs, cliente_id,
          clientes (id, nome, telefone)
        `
          )
          .eq('empresa_id', empresaId)
          .eq('data', dataBase)
          .eq('status_agendamento', 'agendado')
          .order('horario', { ascending: true });

        if (error) throw error;

        if (ativo) setLista(data || []);
      } catch (error) {
        logger.error(error);

        if (ativo) {
          setAviso('Não foi possível buscar os agendamentos.');
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    buscar();

    return () => {
      ativo = false;
    };
  }, [dataBase, empresaId, loadingEmpresa, erroEmpresa]);

  // Filtro pelo intervalo de horário
  const filtrada = useMemo(() => {
    return (lista || []).filter((a) =>
      horaDentroIntervalo(a.horario || '00:00', horaInicio, horaFim)
    );
  }, [lista, horaInicio, horaFim]);

  async function enviarUm(ag) {
    if (enviando) return;

    if (loadingEmpresa || erroEmpresa || !empresaId) {
      setAviso(erroEmpresa || 'Aguarde o carregamento do salão.');
      return;
    }

    if (ag.empresa_id !== empresaId) {
      setAviso('O agendamento não pertence ao salão atual.');
      return;
    }

    setEnviando(true);
    setAviso('');

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

      const telefoneValido =
        telefone.length === 11 ||
        (telefone.length === 13 && telefone.startsWith('55'));

      if (!telefoneValido) {
        await copiarTexto(texto);
        setAviso(
          `Telefone inválido para ${nome}. Use “Pular cliente” para continuar.`
        );
        return;
      }

      const numero = telefone.length === 13 ? telefone : `55${telefone}`;
      const janela = abrirWhatsApp(numero, texto);

      if (!janela) {
        setAviso(
          'Não foi possível confirmar a abertura do WhatsApp. Confira o navegador antes de tentar novamente.'
        );
        return;
      }

      // Avança após abrir, evitando repetir a abertura se o histórico falhar.
      setFila((atual) =>
        atual ? { ...atual, indice: atual.indice + 1 } : atual
      );

      const { error } = await supabase.from('lembretes_enviados').insert([
        {
          empresa_id: empresaId,
          agendamento_id: ag.id,
          cliente_id: ag.cliente_id,
          cliente_nome: nome,
          telefone: numero,
          mensagem: texto,
          tipo: 'lembrete_agendamento',
          status: 'aberto_whatsapp',
        },
      ]);

      if (error) {
        logger.error(error);
        setAviso(
          `O WhatsApp de ${nome} foi aberto, mas o histórico não foi salvo.`
        );
        return;
      }

      setAviso(`Abertura do lembrete de ${nome} registrada no histórico.`);
    } catch (error) {
      logger.error(error);
      setAviso(
        'Não foi possível concluir a operação. Confira o WhatsApp e o histórico.'
      );
    } finally {
      setEnviando(false);
    }
  }

  function enviarTodos() {
    if (
      enviando ||
      loadingEmpresa ||
      erroEmpresa ||
      !empresaId ||
      !filtrada.length ||
      intervaloInvalido
    ) {
      return;
    }

    const listaDaFila = [...filtrada];

    setFila({ lista: listaDaFila, indice: 0 });
    enviarUm(listaDaFila[0]);
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
            <div className="mb-4 rounded-lg border border-primary/30 bg-white p-3 shadow-sm sm:p-4">
              {/* Filtros */}
              <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                <div className="col-span-2 min-w-0 md:col-span-1">
                  <label className="mb-1 block text-sm text-cinza/80">
                    Dia
                  </label>

                  <input
                    type="date"
                    value={dataBase}
                    onChange={(e) => setDataBase(e.target.value)}
                    className="input-padrao min-w-0 max-w-full"
                  />
                </div>

                <div className="min-w-0">
                  <label className="mb-1 block whitespace-nowrap text-sm text-cinza/80">
                    Hora inicial
                  </label>

                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="input-padrao min-w-0 max-w-full"
                  />
                </div>

                <div className="min-w-0">
                  <label className="mb-1 block whitespace-nowrap text-sm text-cinza/80">
                    Hora final
                  </label>

                  <input
                    type="time"
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
                    className="input-padrao min-w-0 max-w-full"
                  />
                </div>
              </div>

              <div className="mb-4">
                <p
                  className={`text-sm leading-5 ${
                    intervaloInvalido ? 'text-red-600' : 'text-cinza/80'
                  }`}
                >
                  {intervaloInvalido
                    ? 'Hora inicial deve ser menor ou igual à hora final.'
                    : `Exibindo agendamentos entre ${horaInicio} e ${horaFim}.`}
                </p>

                <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="min-w-0 flex-1 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <p className="text-sm font-semibold text-primary">
                      Clientes agendados para o dia:
                    </p>

                    {filtrada.length === 0 ? (
                      <p className="mt-1 text-sm text-cinza/70">
                        Nenhum cliente neste intervalo.
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-1">
                        {filtrada.map((agendamento) => (
                          <li
                            key={agendamento.id}
                            className="text-sm text-cinza"
                          >
                            {/* <span className="font-medium text-primary">
                              {agendamento.clientes?.nome || 'Cliente sem nome'}
                            </span>

                            {' — '} */}
                            <span className="font-semibold text-secondary">
                              {agendamento.horario
                                ? agendamento.horario.slice(0, 5)
                                : 'Horário não informado'}
                            </span>

                            {' — '}

                            <span className="font-medium text-primary">
                              {agendamento.clientes?.nome || 'Cliente sem nome'}
                            </span>

                            {' — '}

                            <span>
                              {agendamento.servico || 'Serviço não informado'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={enviarTodos}
                    disabled={
                      carregando ||
                      enviando ||
                      loadingEmpresa ||
                      !!erroEmpresa ||
                      !empresaId ||
                      !!fila ||
                      filtrada.length === 0 ||
                      intervaloInvalido
                    }
                    className="btn-icone inline-flex h-10 w-auto shrink-0 items-center justify-center gap-2 self-end whitespace-nowrap rounded border border-secondary px-3 text-sm font-medium text-secondary transition hover:bg-secondary/10 disabled:cursor-not-allowed disabled:border-secondary/40 disabled:text-secondary/40 disabled:hover:bg-transparent"
                    title={
                      filtrada.length === 0
                        ? 'Nenhum agendamento disponível para envio'
                        : 'Enviar lembretes para todos os clientes listados'
                    }
                  >
                    <BellRing size={18} className="shrink-0" />
                    <span>Enviar lembretes</span>
                  </button>
                </div>
              </div>
            </div>
            {/*Aqui*/}
            {(erroEmpresa || aviso) && (
              <p role="status" className="mb-3 text-sm text-primary">
                {erroEmpresa || aviso}
              </p>
            )}

            {fila && (
              <div className="rounded-lg border border-primary/20 bg-white p-4">
                {fila.indice < fila.lista.length ? (
                  <>
                    <p className="mb-3 text-sm text-primary">
                      Próximo:{' '}
                      {fila.lista[fila.indice].clientes?.nome || 'Cliente'}
                      {' — '}
                      {fila.indice + 1} de {fila.lista.length}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={enviando}
                        onClick={() => enviarUm(fila.lista[fila.indice])}
                        className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50"
                      >
                        {enviando ? 'Registrando...' : 'Próximo lembrete'}
                      </button>

                      <button
                        type="button"
                        disabled={enviando}
                        onClick={() =>
                          setFila((atual) =>
                            atual
                              ? { ...atual, indice: atual.indice + 1 }
                              : atual
                          )
                        }
                        className="rounded-lg border border-secondary px-4 py-2 text-secondary disabled:opacity-50"
                      >
                        Pular cliente
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-primary">
                    Fila concluída. Confira os avisos sobre o histórico.
                  </p>
                )}

                <button
                  type="button"
                  disabled={enviando}
                  onClick={() => setFila(null)}
                  className="mt-3 text-sm text-primary underline disabled:opacity-50"
                >
                  Fechar fila
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
