import { Fragment, useEffect, useState, useMemo } from 'react';
import { supabase } from '../../api/supabaseClient';
import Header from '../../Componentes/Header/Header';
import { enviarLembreteDeAgendamento } from '../../utils/whatsapp';
import {
  Hourglass,
  RotateCcw,
  ChevronDown,
  Trash2,
  Loader2,
} from 'lucide-react';

const HistoricoLembretes = () => {
  const [lembretes, setLembretes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [clienteAberto, setClienteAberto] = useState(null);
  const [limpandoHistorico, setLimpandoHistorico] = useState(false);

  useEffect(() => {
    const buscarHistorico = async () => {
      setCarregando(true);

      const { data, error } = await supabase
        .from('lembretes_enviados')
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
        .eq('tipo', 'lembrete_agendamento')
        .order('enviado_em', { ascending: false });

      if (error) {
        console.error('Erro ao buscar histórico:', error);
      } else {
        setLembretes(data || []);
      }

      setCarregando(false);
    };

    buscarHistorico();
  }, []);

  const formatarDataHora = (data) => {
    if (!data) return '';

    return new Date(data).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };
  const traduzirTipo = (tipo) => {
    if (tipo === 'lembrete_agendamento') return 'Lembrete de atendimento';
    return tipo;
  };

  const traduzirStatus = (status) => {
    if (status === 'aberto_whatsapp') return 'Enviado via WhatsApp';
    return status;
  };

  const clientesAgrupados = useMemo(() => {
    const grupos = {};

    lembretes.forEach((lembrete) => {
      const nomeNormalizado = (lembrete.cliente_nome || '')
        .trim()
        .toLocaleLowerCase('pt-BR');

      const chave =
        nomeNormalizado ||
        lembrete.telefone ||
        lembrete.cliente_id ||
        `registro-${lembrete.id}`;

      if (!grupos[chave]) {
        grupos[chave] = {
          chave,
          clienteId: lembrete.cliente_id,
          nome: lembrete.cliente_nome || 'Cliente sem nome',
          telefone: lembrete.telefone,
          quantidade: 0,
          ultimoEnvio: lembrete.enviado_em,
          lembretes: [],
        };
      }

      grupos[chave].quantidade += 1;
      grupos[chave].lembretes.push(lembrete);

      if (new Date(lembrete.enviado_em) > new Date(grupos[chave].ultimoEnvio)) {
        grupos[chave].ultimoEnvio = lembrete.enviado_em;
      }
    });

    return Object.values(grupos).sort(
      (a, b) => new Date(b.ultimoEnvio) - new Date(a.ultimoEnvio)
    );
  }, [lembretes]);

  const limparHistoricosAntigos = async () => {
    const confirmou = window.confirm(
      'Deseja excluir os lembretes enviados há mais de 90 dias e os registros sem agendamento? Essa ação não poderá ser desfeita.'
    );

    if (!confirmou) return;

    setLimpandoHistorico(true);

    try {
      const limiteDeNoventaDias = new Date();
      limiteDeNoventaDias.setDate(limiteDeNoventaDias.getDate() - 90);

      const idsParaExcluir = lembretes
        .filter((lembrete) => {
          const dataEnvio = new Date(lembrete.enviado_em);

          const antigo =
            !Number.isNaN(dataEnvio.getTime()) &&
            dataEnvio < limiteDeNoventaDias;

          const semAgendamento = !lembrete.agendamentos;

          return antigo || semAgendamento;
        })
        .map((lembrete) => lembrete.id);

      if (idsParaExcluir.length === 0) {
        alert('Nenhum histórico antigo foi encontrado.');
        return;
      }

      const { error } = await supabase
        .from('lembretes_enviados')
        .delete()
        .in('id', idsParaExcluir);

      if (error) {
        console.error('Erro ao limpar histórico:', error);
        alert('Não foi possível limpar o histórico.');
        return;
      }

      setLembretes((anteriores) =>
        anteriores.filter((lembrete) => !idsParaExcluir.includes(lembrete.id))
      );

      setClienteAberto(null);

      alert(
        `${idsParaExcluir.length} ${
          idsParaExcluir.length === 1
            ? 'registro foi removido'
            : 'registros foram removidos'
        }.`
      );
    } finally {
      setLimpandoHistorico(false);
    }
  };

  return (
    <>
      <Header title="Lembretes enviados" voltarPara="/comunicacao-menu" />
      <div className="main">
        <div className="main-container">
          <div className="container-formulario">
            {/* <div>
              <h1 className="mb-4 flex gap-2 text-primary">
                <Hourglass size={24} className="text-secondary" />
                Histórico de lembretes enviados
              </h1>
            </div> */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="flex items-center gap-2 text-primary">
                <Hourglass size={24} className="shrink-0 text-secondary" />
                Histórico de lembretes enviados
              </h1>

              <button
                type="button"
                onClick={limparHistoricosAntigos}
                disabled={limpandoHistorico}
                className="inline-flex items-center justify-center gap-2 self-end rounded-lg border border-danger px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
              >
                {limpandoHistorico ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Trash2 size={17} />
                )}

                {limpandoHistorico ? 'Limpando...' : 'Limpar antigos'}
              </button>
            </div>
            {carregando ? (
              <p className="text-cinza/80">Carregando histórico...</p>
            ) : lembretes.length === 0 ? (
              <p className="text-cinza/80">Nenhum lembrete registrado ainda.</p>
            ) : (
              <div className="overflow-x-auto rounded border border-cinza/30 bg-white">
                <table className="w-full min-w-[700px] border-separate border-spacing-0">
                  <thead className="bg-alternativo/10 text-xs uppercase text-primary">
                    <tr>
                      <th className="border-b border-cinza/30 px-3 py-3 text-left">
                        Cliente
                      </th>

                      <th className="border-b border-cinza/30 px-3 py-3 text-center">
                        Lembretes enviados
                      </th>

                      <th className="border-b border-cinza/30 px-3 py-3 text-left">
                        Último envio
                      </th>

                      <th className="border-b border-cinza/30 px-3 py-3 text-center">
                        Detalhes
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {clientesAgrupados.map((grupo) => {
                      const aberto = clienteAberto === grupo.chave;

                      return (
                        <Fragment key={grupo.chave}>
                          <tr className="bg-white transition hover:bg-alternativo/5">
                            <td className="border-b border-cinza/30 px-3 py-3 text-sm font-medium text-primary">
                              {grupo.nome}
                            </td>

                            <td className="border-b border-cinza/30 px-3 py-3 text-center">
                              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                                {grupo.quantidade}
                              </span>
                            </td>

                            <td className="border-b border-cinza/30 px-3 py-3 text-sm text-cinza">
                              {formatarDataHora(grupo.ultimoEnvio)}
                            </td>

                            <td className="border-b border-cinza/30 px-3 py-3 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setClienteAberto(aberto ? null : grupo.chave)
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-secondary text-secondary transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                                title={
                                  aberto ? 'Fechar detalhes' : 'Ver detalhes'
                                }
                                aria-label={
                                  aberto ? 'Fechar detalhes' : 'Ver detalhes'
                                }
                              >
                                <ChevronDown
                                  size={20}
                                  className={`transition-transform ${
                                    aberto ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                            </td>
                          </tr>

                          {aberto && (
                            <tr>
                              <td
                                colSpan={4}
                                className="border-b border-cinza/30 bg-gray-50 p-3"
                              >
                                <div className="space-y-2">
                                  {grupo.lembretes.map((item) => (
                                    <div
                                      key={item.id}
                                      className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 rounded-lg border border-cinza/20 bg-white p-3 text-sm"
                                    >
                                      <div>
                                        <p className="font-medium text-primary">
                                          {item.agendamentos?.servico ||
                                            'Serviço não disponível'}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                          Horário:{' '}
                                          {item.agendamentos?.horario || '-'}
                                        </p>
                                      </div>

                                      <p className="whitespace-nowrap text-cinza">
                                        {formatarDataHora(item.enviado_em)}
                                      </p>

                                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                                        Enviado
                                      </span>

                                      <button
                                        type="button"
                                        disabled={
                                          !item.agendamentos || !item.telefone
                                        }
                                        onClick={() => {
                                          const agendamento = {
                                            ...item.agendamentos,
                                            clientes: {
                                              nome: item.cliente_nome,
                                              telefone: item.telefone,
                                            },
                                          };

                                          enviarLembreteDeAgendamento(
                                            agendamento
                                          );
                                        }}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-secondary text-secondary transition hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
                                        title="Reenviar lembrete"
                                        aria-label="Reenviar lembrete"
                                      >
                                        <RotateCcw size={18} />
                                      </button>
                                    </div>
                                  ))}
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
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoricoLembretes;
