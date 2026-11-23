import React, { useState } from 'react';
import {
  montarMensagemCobranca,
  abrirWhatsApp,
} from '../../utils/whatsapp.jsx';
import { apenasNumeros } from '../Utilitarios/formadores.js';
import { supabase } from '../../api/supabaseClient.js';
import { Check, Loader2, PhoneOff, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BotaoEnviarCobranca({
  agendamento,
  atualizarStatus,
  status,
  label = 'Enviar cobrança',
  className = '',
  disabled: disabledExternamente = false, // ✅ NOVO
}) {
  const { empresaId, loadingEmpresa, erroEmpresa } = useAuth();
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  const disabledFinal =
    enviando || status === 'enviado' || disabledExternamente;

  // const handleClick = async () => {
  //   if (disabledFinal) return; // ✅ proteção extra

  //   setEnviando(true);
  //   setMensagem('');
  //   setErro(false);

  //   try {
  //     const cliente = agendamento?.clientes || {};
  //     const nome = cliente?.nome || 'Cliente';

  //     // ✅ TELEFONE SEGURO
  //     const tel = apenasNumeros(cliente?.telefone);
  //     if (tel.length !== 11 && !(tel.length === 13 && tel.startsWith('55'))) {
  //       setErro(true);
  //       setMensagem('Cliente sem telefone válido.');
  //       return;
  //     }

  //     const numeroE164 = tel.startsWith('55') ? tel : `55${tel}`;

  //     const payload = {
  //       nome,
  //       servico: agendamento?.servico || agendamento?.serviço || '',
  //       data: agendamento?.data_formatada || agendamento?.data || '',
  //       hora: agendamento?.horario || agendamento?.hora || '',
  //       valor: Number(agendamento?.valor || 0),
  //       formaPagamento:
  //         agendamento?.forma_pagamento || agendamento?.pagamento || '',
  //       linkPagamento: agendamento?.link_pagamento || '',
  //       observacoes: agendamento?.obs || agendamento?.observacoes || '',
  //     };

  //     const textoEncoded = montarMensagemCobranca(payload);
  //     abrirWhatsApp(numeroE164, textoEncoded);

  //     const { data: historicoSalvo, error: erroHistorico } = await supabase
  //       .from('lembretes_enviados')
  //       .insert([
  //         {
  //           agendamento_id: agendamento.id,
  //           cliente_id: agendamento.cliente_id,
  //           cliente_nome: nome,
  //           telefone: numeroE164,
  //           mensagem: textoEncoded,
  //           tipo: 'cobranca_pendente',
  //           status: 'aberto_whatsapp',
  //         },
  //       ])
  //       .select();

  //     if (erroHistorico) {
  //       console.error('Erro ao salvar histórico da cobrança:', erroHistorico);
  //     } else {
  //       console.log('Histórico da cobrança salvo:', historicoSalvo);
  //     }

  //     atualizarStatus?.(agendamento.id, 'enviado');
  //     setMensagem('');
  //   } catch (e) {
  //     console.error(e);
  //     setErro(true);
  //     setMensagem('Não foi possível abrir o WhatsApp.');
  //   } finally {
  //     setEnviando(false);
  //   }
  // };
  const handleClick = async () => {
    if (disabledFinal) return;

    setMensagem('');
    setErro(false);

    if (loadingEmpresa || erroEmpresa || !empresaId) {
      setErro(true);
      setMensagem(
        loadingEmpresa
          ? 'Aguarde o carregamento dos dados do salão.'
          : erroEmpresa || 'Não foi possível identificar o salão.'
      );
      return;
    }

    if (agendamento?.empresa_id && agendamento.empresa_id !== empresaId) {
      setErro(true);
      setMensagem('Este agendamento pertence a outro salão.');
      return;
    }

    if (!agendamento?.id || !agendamento?.cliente_id) {
      setErro(true);
      setMensagem('Agendamento sem identificação do atendimento ou cliente.');
      return;
    }

    setEnviando(true);

    try {
      const cliente = agendamento.clientes || {};
      const nome = cliente.nome || 'Cliente';

      const tel = apenasNumeros(cliente.telefone || '');

      if (tel.length !== 11 && !(tel.length === 13 && tel.startsWith('55'))) {
        setErro(true);
        setMensagem('Cliente sem telefone válido.');
        return;
      }

      const numeroE164 = tel.length === 13 ? tel : `55${tel}`;

      const payload = {
        nome,
        servico: agendamento.servico || agendamento.serviço || '',
        data: agendamento.data_formatada || agendamento.data || '',
        hora: agendamento.horario || agendamento.hora || '',
        valor: Number(agendamento.valor || 0),
        formaPagamento:
          agendamento.forma_pagamento || agendamento.pagamento || '',
        linkPagamento: agendamento.link_pagamento || '',
        observacoes: agendamento.obs || agendamento.observacoes || '',
      };

      const textoEncoded = montarMensagemCobranca(payload);
      const janela = abrirWhatsApp(numeroE164, textoEncoded);

      if (!janela) {
        setErro(true);
        setMensagem(
          'Não foi possível confirmar a abertura do WhatsApp. Verifique se o navegador bloqueou a janela.'
        );
        return;
      }

      const { error: erroHistorico } = await supabase
        .from('lembretes_enviados')
        .insert([
          {
            empresa_id: empresaId,
            agendamento_id: agendamento.id,
            cliente_id: agendamento.cliente_id,
            cliente_nome: nome,
            telefone: numeroE164,
            mensagem: textoEncoded,
            tipo: 'cobranca_pendente',
            status: 'aberto_whatsapp',
          },
        ]);

      // Mantém o controle atual do botão após abrir o WhatsApp.
      atualizarStatus?.(agendamento.id, 'enviado');

      if (erroHistorico) {
        console.error('Erro ao salvar histórico da cobrança:', erroHistorico);
        setErro(true);
        setMensagem(
          'O WhatsApp foi aberto, mas não foi possível salvar o histórico.'
        );
        return;
      }

      setMensagem('');
    } catch (error) {
      console.error('Erro no fluxo da cobrança:', error);
      setErro(true);
      setMensagem('Não foi possível concluir a operação. Confira o histórico.');
    } finally {
      setEnviando(false);
    }
  };
  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        className={`btn-icone inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white shadow-sm transition ${
          status === 'enviado'
            ? 'cursor-not-allowed border-green-600 text-green-600'
            : disabledExternamente
              ? 'cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400'
              : enviando
                ? 'cursor-wait border-secondary text-secondary'
                : 'border-secondary text-secondary hover:border-primary hover:bg-primary/5 hover:text-primary'
        } ${className}`}
        onClick={handleClick}
        disabled={disabledFinal}
        title={
          status === 'enviado'
            ? 'Cobrança enviada'
            : enviando
              ? 'Abrindo WhatsApp'
              : disabledExternamente
                ? 'Cliente sem telefone válido'
                : label
        }
        aria-label={
          status === 'enviado'
            ? 'Cobrança enviada'
            : enviando
              ? 'Abrindo WhatsApp'
              : disabledExternamente
                ? 'Cliente sem telefone válido'
                : label
        }
      >
        {status === 'enviado' ? (
          <Check size={20} />
        ) : enviando ? (
          <Loader2 className="animate-spin" size={20} />
        ) : disabledExternamente ? (
          <PhoneOff size={20} />
        ) : (
          <Send size={20} className="" />
        )}
      </button>
      {mensagem && (
        <p className={`text-xs ${erro ? 'text-red-600' : 'text-green-600'}`}>
          {mensagem}
        </p>
      )}
    </div>
  );
}
