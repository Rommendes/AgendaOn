import React, { useState } from "react";
import { montarMensagemCobranca, abrirWhatsApp } from "../../utils/whatsapp.jsx";
import { apenasNumeros } from "../Utilitarios/formadores.js"; 
// ⚠️ ajuste o caminho se necessário. Se der erro, me diga onde está o formadores.js.

export default function BotaoEnviarCobranca({
  agendamento,
  atualizarStatus,
  status,
  label = "Enviar cobrança",
  className = "",
  disabled: disabledExternamente = false, // ✅ NOVO
}) {
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);

  const disabledFinal = enviando || status === "enviado" || disabledExternamente;

  const handleClick = async () => {
    if (disabledFinal) return; // ✅ proteção extra

    setEnviando(true);
    setMensagem("");
    setErro(false);

    try {
      const cliente = agendamento?.clientes || {};
      const nome = cliente?.nome || "Cliente";

      // ✅ TELEFONE SEGURO
      const tel = apenasNumeros(cliente?.telefone);
      if (tel.length !== 11 && !(tel.length === 13 && tel.startsWith("55"))) {
        setErro(true);
        setMensagem("Cliente sem telefone válido.");
        return;
      }

      const numeroE164 = tel.startsWith("55") ? tel : `55${tel}`;

      const payload = {
        nome,
        servico: agendamento?.servico || agendamento?.serviço || "",
        data: agendamento?.data_formatada || agendamento?.data || "",
        hora: agendamento?.horario || agendamento?.hora || "",
        valor:
          agendamento?.valor_formatado ||
          (agendamento?.valor != null ? `R$ ${Number(agendamento.valor).toFixed(2)}` : ""),
        formaPagamento: agendamento?.forma_pagamento || agendamento?.pagamento || "",
        linkPagamento: agendamento?.link_pagamento || "",
        observacoes: agendamento?.obs || agendamento?.observacoes || "",
      };

      const textoEncoded = montarMensagemCobranca(payload);
      abrirWhatsApp(numeroE164, textoEncoded);

      atualizarStatus?.(agendamento.id, "enviado");
      setMensagem("Abrimos o WhatsApp com a mensagem pronta.");
    } catch (e) {
      console.error(e);
      setErro(true);
      setMensagem("Não foi possível abrir o WhatsApp.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 items-start">
      <button
        type="button"
        className={`px-3 py-1 rounded text-white text-sm ${
          disabledFinal ? "bg-emerald-600 text-white cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
        } ${className}`}
        onClick={handleClick}
        disabled={disabledFinal}
      >
        {status === "enviado"
          ? "Enviado"
          : enviando
          ? "Abrindo..."
          : disabledExternamente
          ? "Sem telefone"
          : label}
      </button>

      {mensagem && (
        <p className={`text-xs ${erro ? "text-red-600" : "text-green-600"}`}>{mensagem}</p>
      )}
    </div>
  );
}
