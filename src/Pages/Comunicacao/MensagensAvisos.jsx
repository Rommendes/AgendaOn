import { useEffect, useMemo, useState } from 'react';
import {
  CircleAlert,
  CircleCheck,
  Eye,
  Loader2,
  Megaphone,
  Send,
  Users,
} from 'lucide-react';

import Header from '../../Componentes/Header/Header';
import { supabase } from '../../api/supabaseClient';

const tiposComunicacao = [
  { valor: 'aviso_importante', nome: 'Aviso importante' },
  { valor: 'promocao', nome: 'Promoção' },
  { valor: 'novidade', nome: 'Novidade' },
  { valor: 'atualizacao_servico', nome: 'Atualização de serviço' },
  { valor: 'mensagem_personalizada', nome: 'Mensagem personalizada' },
];

function prepararTelefoneWhatsapp(telefone) {
  const numeros = String(telefone || '').replace(/\D/g, '');

  if (numeros.startsWith('55') && [12, 13].includes(numeros.length)) {
    return numeros;
  }

  if ([10, 11].includes(numeros.length)) {
    return `55${numeros}`;
  }

  return null;
}

function MensagensAvisos() {
  const [clientes, setClientes] = useState([]);
  const [carregandoClientes, setCarregandoClientes] = useState(true);

  const [tipoComunicacao, setTipoComunicacao] = useState('aviso_importante');

  const [tipoDestinatario, setTipoDestinatario] = useState('todos');
  const [clientesSelecionados, setClientesSelecionados] = useState([]);

  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [filaEnvio, setFilaEnvio] = useState([]);
  const [proximoIndice, setProximoIndice] = useState(0);
  const [enviando, setEnviando] = useState(false);

  const [retorno, setRetorno] = useState({
    tipo: '',
    mensagem: '',
  });

  useEffect(() => {
    async function buscarClientes() {
      setCarregandoClientes(true);

      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, telefone')
        .order('nome', { ascending: true });

      if (error) {
        console.error('Erro ao buscar clientes:', error);
        setClientes([]);
      } else {
        setClientes(data || []);
      }

      setCarregandoClientes(false);
    }

    buscarClientes();
  }, []);

  const alternarCliente = (clienteId) => {
    setClientesSelecionados((anteriores) =>
      anteriores.includes(clienteId)
        ? anteriores.filter((id) => id !== clienteId)
        : [...anteriores, clienteId]
    );
  };

  const clienteDaPrevia = useMemo(() => {
    if (tipoDestinatario === 'selecionados') {
      return (
        clientes.find((cliente) => clientesSelecionados.includes(cliente.id)) ||
        null
      );
    }

    return clientes[0] || null;
  }, [clientes, clientesSelecionados, tipoDestinatario]);

  const mensagemDaPrevia = useMemo(() => {
    const nome = clienteDaPrevia?.nome || 'Nome da cliente';

    const textoPersonalizado = mensagem.replaceAll('{nome}', nome);

    return [titulo.trim(), textoPersonalizado.trim()]
      .filter(Boolean)
      .join('\n\n');
  }, [clienteDaPrevia, mensagem, titulo]);

  const quantidadeDestinatarios =
    tipoDestinatario === 'todos'
      ? clientes.length
      : clientesSelecionados.length;

  const montarMensagem = (cliente) => {
    const nome = cliente?.nome || 'Cliente';

    const corpoPersonalizado = mensagem.replaceAll('{nome}', nome).trim();

    return [titulo.trim(), corpoPersonalizado].filter(Boolean).join('\n\n');
  };

  const abrirConversaWhatsapp = async (cliente) => {
    const telefone = prepararTelefoneWhatsapp(cliente.telefone);

    if (!telefone) {
      return {
        abriu: false,
        erroRegistro: false,
      };
    }

    const texto = montarMensagem(cliente);

    const link = `https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`;

    const novaAba = window.open(link, '_blank');

    if (!novaAba) {
      setRetorno({
        tipo: 'erro',
        mensagem:
          'O navegador bloqueou a abertura do WhatsApp. Autorize os pop-ups e tente novamente.',
      });

      return {
        abriu: false,
        erroRegistro: false,
      };
    }

    const { error } = await supabase.from('lembretes_enviados').insert([
      {
        cliente_nome: cliente.nome,
        telefone: cliente.telefone,
        mensagem: texto,
        tipo: tipoComunicacao,
        status: 'aberto_whatsapp',
        enviado_em: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Erro ao registrar comunicação:', error);
    }

    return {
      abriu: true,
      erroRegistro: Boolean(error),
    };
  };

  const iniciarEnvio = async () => {
    setRetorno({
      tipo: '',
      mensagem: '',
    });

    if (!titulo.trim()) {
      setRetorno({
        tipo: 'erro',
        mensagem: 'Informe o título da comunicação.',
      });

      return;
    }

    if (!mensagem.trim()) {
      setRetorno({
        tipo: 'erro',
        mensagem: 'Escreva a mensagem antes de enviar.',
      });

      return;
    }

    const destinatarios =
      tipoDestinatario === 'todos'
        ? clientes
        : clientes.filter((cliente) =>
            clientesSelecionados.includes(cliente.id)
          );

    if (destinatarios.length === 0) {
      setRetorno({
        tipo: 'erro',
        mensagem: 'Selecione pelo menos um cliente.',
      });

      return;
    }

    const clientesValidos = destinatarios.filter((cliente) =>
      prepararTelefoneWhatsapp(cliente.telefone)
    );

    const clientesSemTelefone = destinatarios.length - clientesValidos.length;

    if (clientesValidos.length === 0) {
      setRetorno({
        tipo: 'erro',
        mensagem: 'Nenhum dos clientes selecionados possui telefone válido.',
      });

      return;
    }

    setFilaEnvio(clientesValidos);
    setProximoIndice(0);
    setEnviando(true);

    const resultado = await abrirConversaWhatsapp(clientesValidos[0]);

    setEnviando(false);

    if (!resultado.abriu) return;

    setProximoIndice(1);

    if (resultado.erroRegistro) {
      setRetorno({
        tipo: 'erro',
        mensagem:
          'O WhatsApp foi aberto, mas não foi possível registrar a comunicação no histórico.',
      });

      return;
    }

    setRetorno({
      tipo: 'informacao',
      mensagem:
        clientesSemTelefone > 0
          ? `${clientesSemTelefone} cliente(s) sem telefone válido foram ignorados.`
          : 'A primeira conversa foi aberta no WhatsApp.',
    });
  };

  const abrirProximoCliente = async () => {
    const cliente = filaEnvio[proximoIndice];

    if (!cliente) return;

    setEnviando(true);

    const resultado = await abrirConversaWhatsapp(cliente);

    setEnviando(false);

    if (!resultado.abriu) return;

    setProximoIndice((indice) => indice + 1);

    if (resultado.erroRegistro) {
      setRetorno({
        tipo: 'erro',
        mensagem:
          'O WhatsApp foi aberto, mas não foi possível registrar a comunicação no histórico.',
      });
    }
  };

  const finalizarEnvio = () => {
    const quantidade = filaEnvio.length;

    setFilaEnvio([]);
    setProximoIndice(0);

    setRetorno({
      tipo: 'sucesso',
      mensagem:
        quantidade === 1
          ? 'Comunicação preparada para 1 cliente.'
          : `Comunicações preparadas para ${quantidade} clientes.`,
    });
  };

  const cancelarFila = () => {
    setFilaEnvio([]);
    setProximoIndice(0);

    setRetorno({
      tipo: 'informacao',
      mensagem: 'Fila de envio cancelada.',
    });
  };

  return (
    <>
      <Header title="Mensagens e Avisos" voltarPara="/comunicacao-menu" />

      <div className="main">
        <div className="main-container">
          <div className="container-formulario">
            <div className="mb-6 border-b border-cinza/30 pb-4">
              <h1 className="flex items-center gap-2 text-primary">
                <Megaphone size={25} className="shrink-0 text-secondary" />
                Enviar mensagens e avisos
              </h1>

              <p className="mt-2 text-sm text-cinza/80">
                Envie avisos importantes, promoções, novidades ou mensagens
                personalizadas.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              {/* FORMULÁRIO */}
              <div className="space-y-5">
                {/* Tipo de comunicação */}
                <div>
                  <label
                    htmlFor="tipo-comunicacao"
                    className="mb-2 block font-medium text-primary"
                  >
                    Tipo de comunicação
                  </label>

                  <select
                    id="tipo-comunicacao"
                    value={tipoComunicacao}
                    onChange={(e) => setTipoComunicacao(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-cinza outline-none focus:border-secondary"
                  >
                    {tiposComunicacao.map((tipo) => (
                      <option key={tipo.valor} value={tipo.valor}>
                        {tipo.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destinatários */}
                <div>
                  <p className="mb-2 font-medium text-primary">Destinatários</p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <input
                        type="radio"
                        name="destinatarios"
                        value="todos"
                        checked={tipoDestinatario === 'todos'}
                        onChange={(e) => setTipoDestinatario(e.target.value)}
                        className="accent-secondary"
                      />

                      <span>Todos os clientes</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <input
                        type="radio"
                        name="destinatarios"
                        value="selecionados"
                        checked={tipoDestinatario === 'selecionados'}
                        onChange={(e) => setTipoDestinatario(e.target.value)}
                        className="accent-secondary"
                      />

                      <span>Clientes selecionados</span>
                    </label>
                  </div>
                </div>

                {/* Seleção dos clientes */}
                {tipoDestinatario === 'selecionados' && (
                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="flex items-center gap-2 font-medium text-primary">
                        <Users size={19} className="text-secondary" />
                        Selecione os clientes
                      </p>

                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {clientesSelecionados.length} selecionados
                      </span>
                    </div>

                    {carregandoClientes ? (
                      <p className="text-sm text-cinza/70">
                        Carregando clientes...
                      </p>
                    ) : (
                      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                        {clientes.map((cliente) => (
                          <label
                            key={cliente.id}
                            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2 hover:bg-primary/5"
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={clientesSelecionados.includes(
                                  cliente.id
                                )}
                                onChange={() => alternarCliente(cliente.id)}
                                className="accent-secondary"
                              />

                              <span className="text-sm text-primary">
                                {cliente.nome}
                              </span>
                            </div>

                            {!cliente.telefone && (
                              <span className="text-xs text-danger">
                                Sem telefone
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Título */}
                <div>
                  <label
                    htmlFor="titulo"
                    className="mb-2 block font-medium text-primary"
                  >
                    Título
                  </label>

                  <input
                    id="titulo"
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex.: Horário especial de atendimento"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-cinza outline-none focus:border-secondary"
                  />
                </div>

                {/* Mensagem */}
                <div>
                  <label
                    htmlFor="mensagem"
                    className="mb-2 block font-medium text-primary"
                  >
                    Mensagem
                  </label>

                  <textarea
                    id="mensagem"
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    rows={8}
                    placeholder={`Olá, {nome}!\n\nDigite aqui sua mensagem.`}
                    className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-3 text-cinza outline-none focus:border-secondary"
                  />

                  <p className="mt-2 text-xs text-cinza/70">
                    Use <strong className="text-secondary">{'{nome}'}</strong>{' '}
                    para inserir automaticamente o nome de cada cliente.
                  </p>
                </div>
              </div>

              {/* PRÉVIA */}
              <div>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 lg:sticky lg:top-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 font-semibold text-primary">
                      <Eye size={20} className="text-secondary" />
                      Prévia da mensagem
                    </h2>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
                      {quantidadeDestinatarios}{' '}
                      {quantidadeDestinatarios === 1
                        ? 'destinatário'
                        : 'destinatários'}
                    </span>
                  </div>

                  <div className="min-h-48 whitespace-pre-wrap rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-cinza shadow-sm">
                    {mensagemDaPrevia || (
                      <span className="text-cinza/50">
                        A prévia aparecerá aqui enquanto você escreve.
                      </span>
                    )}
                  </div>

                  {clienteDaPrevia && (
                    <p className="mt-3 text-xs text-cinza/70">
                      Prévia para: {clienteDaPrevia.nome}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RETORNO */}
        {retorno.mensagem && (
          <div
            className={`mt-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
              retorno.tipo === 'erro'
                ? 'border-red-200 bg-red-50 text-red-700'
                : retorno.tipo === 'sucesso'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-primary/20 bg-primary/5 text-primary'
            }`}
          >
            {retorno.tipo === 'sucesso' ? (
              <CircleCheck size={20} className="shrink-0" />
            ) : (
              <CircleAlert size={20} className="shrink-0" />
            )}

            <p>{retorno.mensagem}</p>
          </div>
        )}

        {/* FILA DE ENVIO */}
        {filaEnvio.length > 0 && (
          <div className="mt-6 rounded-xl border border-primary/20 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-primary">Fila de envio</p>

                <p className="mt-1 text-sm text-cinza/70">
                  {proximoIndice} de {filaEnvio.length} conversas abertas
                </p>

                {proximoIndice < filaEnvio.length && (
                  <p className="mt-1 text-sm text-cinza">
                    Próximo cliente: {filaEnvio[proximoIndice]?.nome}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelarFila}
                  disabled={enviando}
                  className="rounded-lg border border-cinza/30 px-4 py-2 text-sm font-medium text-cinza transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                {proximoIndice < filaEnvio.length ? (
                  <button
                    type="button"
                    onClick={abrirProximoCliente}
                    disabled={enviando}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {enviando ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                    Abrir próximo cliente
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={finalizarEnvio}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-medium text-white transition hover:bg-primary"
                  >
                    <CircleCheck size={18} />
                    Concluir
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BOTÃO INICIAL */}
        {filaEnvio.length === 0 && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={iniciarEnvio}
              disabled={enviando || carregandoClientes}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-3 font-medium text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? (
                <Loader2 size={19} className="animate-spin" />
              ) : (
                <Send size={19} />
              )}
              Enviar pelo WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default MensagensAvisos;
