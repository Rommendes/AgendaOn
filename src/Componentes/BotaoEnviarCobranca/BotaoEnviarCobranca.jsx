import React, { useState } from 'react';
import {
  montarMensagemCobranca,
  abrirWhatsApp,
} from '../../utils/whatsapp.jsx';
import { apenasNumeros } from '../Utilitarios/formadores.js';
import { supase } from '../../api/supabaseClient.js';
export default function BotaoEnviarCobranca({
  agendamento,
  atualizarStatus,
  status,
  label = 'Enviar cobrança',
  className = '',
  disabled: disabledExternamente = false, // ✅ NOVO
}) {
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  const disabledFinal =
    enviando || status === 'enviado' || disabledExternamente;

  const handleClick = async () => {
    if (disabledFinal) return; // ✅ proteção extra

    setEnviando(true);
    setMensagem('');
    setErro(false);

    try {
      const cliente = agendamento?.clientes || {};
      const nome = cliente?.nome || 'Cliente';

      // ✅ TELEFONE SEGURO
      const tel = apenasNumeros(cliente?.telefone);
      if (tel.length !== 11 && !(tel.length === 13 && tel.startsWith('55'))) {
        setErro(true);
        setMensagem('Cliente sem telefone válido.');
        return;
      }

      const numeroE164 = tel.startsWith('55') ? tel : `55${tel}`;

      const payload = {
        nome,
        servico: agendamento?.servico || agendamento?.serviço || '',
        data: agendamento?.data_formatada || agendamento?.data || '',
        hora: agendamento?.horario || agendamento?.hora || '',
        valor: Number(agendamento?.valor || 0),
        formaPagamento:
          agendamento?.forma_pagamento || agendamento?.pagamento || '',
        linkPagamento: agendamento?.link_pagamento || '',
        observacoes: agendamento?.obs || agendamento?.observacoes || '',
      };

      const textoEncoded = montarMensagemCobranca(payload);
      abrirWhatsApp(numeroE164, textoEncoded);

      atualizarStatus?.(agendamento.id, 'enviado');
      setMensagem('Abrimos o WhatsApp com a mensagem pronta.');
    } catch (e) {
      console.error(e);
      setErro(true);
      setMensagem('Não foi possível abrir o WhatsApp.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        className={`rounded px-3 py-1 text-sm text-white ${
          disabledFinal
            ? 'cursor-not-allowed bg-emerald-600 text-white'
            : 'bg-green-600 hover:bg-green-700'
        } ${className}`}
        onClick={handleClick}
        disabled={disabledFinal}
      >
        {status === 'enviado'
          ? 'Enviado'
          : enviando
            ? 'Abrindo...'
            : disabledExternamente
              ? 'Sem telefone'
              : label}
      </button>

      {mensagem && (
        <p className={`text-xs ${erro ? 'text-red-600' : 'text-green-600'}`}>
          {mensagem}
        </p>
      )}
    </div>
  );
}
