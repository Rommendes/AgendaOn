import React, { useState } from "react";
import { montarMensagemCobranca, abrirWhatsApp } from "../../utils/whatsapp.jsx";

export default function BotaoEnviarCobranca({ agendamento, atualizarStatus, status, label="Enviar no WhatsApp", className="" }) {
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);

  const handleClick = async () => {
    setEnviando(true);
    setMensagem("");
    setErro(false);

    try {
      const cliente = agendamento?.clientes || {};
      const nome = cliente?.nome || "Cliente";
      const telefone = (cliente?.telefone || "").replace(/\D/g, ""); // só dígitos
      const numeroE164 = telefone.startsWith("55") ? telefone : `55${telefone}`;

      const payload = {
        nome,
        servico: agendamento?.servico || agendamento?.serviço || "",
        data: agendamento?.data_formatada || agendamento?.data || "",
        hora: agendamento?.horario || agendamento?.hora || "",
        valor: agendamento?.valor_formatado || (agendamento?.valor != null ? `R$ ${Number(agendamento.valor).toFixed(2)}` : ""),
        formaPagamento: agendamento?.forma_pagamento || agendamento?.pagamento || "",
        linkPagamento: agendamento?.link_pagamento || "",
        observacoes: agendamento?.obs || agendamento?.observacoes || ""
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
    <> 
    <div className="flex flex-col gap-1 items-start">
      <button
        className={`px-3 py-1 rounded ${enviando ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"} text-white text-sm`}
        onClick={handleClick}
        disabled={enviando || status === "enviado"}
      >
        {status === "enviado" ? "Enviado" : enviando ? "Abrindo..." : "Enviar no WhatsApp"}
      </button>
      {mensagem && (
        <p className={`text-xs ${erro ? "text-red-600" : "text-green-600"}`}>{mensagem}</p>
      )}
    </div>

      

    </>
  );
}