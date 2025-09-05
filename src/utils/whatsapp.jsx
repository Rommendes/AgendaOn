// =======================
// utils/whatsapp.jsx
// =======================

// Coloque no topo (escopo de módulo, fora das funções):
let WA_POPUP = null;

// pequeno util
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/** Helpers básicos */

function buildWaUrl(numero, textoPuro) {
  const digitos = soDigitos(numero);
  const numeroE164 = digitos.startsWith("55") ? digitos : `55${digitos}`;
  return `https://wa.me/${numeroE164}?text=${encodeURIComponent(textoPuro)}`;
}


function limpa(str) {
  return (str ?? "").toString().trim();
}
function soDigitos(str) {
  return limpa(str).replace(/\D/g, "");
}
function formatarValorBR(valor) {
  if (valor == null || valor === "") return "";
  if (typeof valor === "number") return `R$ ${valor.toFixed(2).replace(".", ",")}`;
  const num = Number(String(valor).replace(/[^\d,.-]/g, "").replace(",", "."));
  return Number.isFinite(num) ? `R$ ${num.toFixed(2).replace(".", ",")}` : limpa(valor);
}


 /** Copia texto para a área de transferência (fallback quando não há telefone) */
 export function copiarTexto(textoPuro) {
  return navigator.clipboard.writeText(textoPuro);
}

export function abrirWhatsApp(numero, textoPuro, reuse = true) {
  const url = buildWaUrl(numero, textoPuro);
  try {
    if (reuse && WA_POPUP && !WA_POPUP.closed) {
      WA_POPUP.location.href = url;  // navegar na mesma aba
      WA_POPUP.focus();
      return WA_POPUP;
    }
    // abre/renova a aba nomeada
    WA_POPUP = window.open(url, "wa_bulk", "noopener,noreferrer");
    if (WA_POPUP) WA_POPUP.focus();
    return WA_POPUP || null;
  } catch {
    return null;
  }
}

/* =======================
   Modelos de mensagem
   (sempre retornam TEXTO PURO — sem encode)
   ======================= */

/** COBRANÇA */
export function mensagemCobranca({
  nome,
  servico,
  data,
  hora,
  valor,
  formaPagamento,
  linkPagamento,
  observacoes
}) {
  const _nome = limpa(nome) || "Cliente";
  const _servico = limpa(servico);
  const _data = limpa(data);
  const _hora = limpa(hora);
  const _valor = formatarValorBR(valor);
  const _fp = limpa(formaPagamento);
  const _link = limpa(linkPagamento);
  const _obs = limpa(observacoes);

  return [
    `💰 Olá, *${_nome}*!`,
    ``,
    `Consta em nosso sistema um pagamento pendente referente a:`,
    `• Serviço: *${_servico}*`,
    _data ? `• Data: *${_data}*` : "",
    _hora ? `• Horário: *${_hora}*` : "",
    _valor ? `• Valor: *${_valor}*${_fp ? ` (${_fp})` : ""}` : "",
    _link ? `• Pagamento online: ${_link}` : "",
    _obs ? `📝 Observações: ${_obs}` : "",
    ``,
    `Por favor, nos confirme o pagamento para mantermos seu cadastro em dia.`,
    `Obrigada! 💇‍♀️`
  ].filter(Boolean).join("\n");
}

/** LEMBRETE DE AGENDAMENTO */
export function mensagemLembrete({ nome, servico, data, hora, observacoes } = {}) {
  const _nome = limpa(nome) || "Cliente";
  const _servico = limpa(servico);
  const _data = limpa(data);
  const _hora = limpa(hora);
  const _obs = limpa(observacoes);

  return [
    `⏰ Olá, *${_nome}*!`,
    ``,
    `Passando para lembrar do seu agendamento:`,
    `• Serviço: *${_servico}*`,
    _data ? `• Data: *${_data}*` : "",
    _hora ? `• Horário: *${_hora}*` : "",
    _obs ? `📝 Observações: ${_obs}` : "",
    ``,
    `Aguardamos você! 💇‍♀️💅`,
    `*Salão Sandro e Carmem*`
  ].filter(Boolean).join("\n");
}

/* =======================
   Funções reutilizáveis para LEMBRETES
   ======================= */

/** Monta o texto do lembrete a partir de um objeto "agendamento" */
export function montarTextoLembreteDeAgendamento(ag) {
  const nome = ag?.clientes?.nome || ag?.cliente_nome || "Cliente";
  const servico = ag?.servico || "";
  const dataBR = ag?.data
    ? new Date(ag.data + "T12:00:00").toLocaleDateString("pt-BR")
    : (ag?.data_formatada || "");
  const hora = (ag?.horario || ag?.hora || "").toString().slice(0, 5);
  const observacoes = ag?.obs || ag?.observacoes || "";

  return mensagemLembrete({
    nome,
    servico,
    data: dataBR,
    hora,
    observacoes,
  });
}

/**
 * Envia 1 lembrete:
 * - Se tiver telefone: abre WhatsApp com a mensagem
 * - Se não tiver: copia a mensagem para a área de transferência
 * Retorna "enviado" | "copiado"
 */
export async function enviarLembreteDeAgendamento(ag) {
  const telefone = (ag?.clientes?.telefone || ag?.telefone || "").toString();
  const texto = montarTextoLembreteDeAgendamento(ag);
  const temTelefone = telefone && soDigitos(telefone).length >= 10;

  if (temTelefone) {
    abrirWhatsApp(telefone, texto);
    return "enviado";
  } else {
    await copiarTexto(texto);
    return "copiado";
  }
}

/**
 * Envia lembretes em lote (com pequena pausa entre cada envio
 * para reduzir bloqueio de pop-ups pelo navegador).
 * Retorna { enviados, copiados }.
 */
export async function enviarLembretesEmLote(lista, { intervalMs = 1600, copiarSemTelefone = false } = {}) {
  const itens = Array.isArray(lista) ? lista : [];
  let enviados = 0, copiados = 0;
  const faltandoTelefone = [];


  // primeiro clique abriu a 1ª aba; nas próximas apenas navegamos
  for (const ag of itens) {
    const telefone = (ag?.clientes?.telefone || ag?.telefone || "").toString();
    const msg = montarTextoLembreteDeAgendamento(ag);
    const temTelefone = telefone && telefone.replace(/\D/g, "").length >= 10;

    if (temTelefone) {
      // tenta navegar na mesma aba
      const win = abrirWhatsApp(telefone, msg, /*reuse*/ true);
      if (win) {
        enviados++;
        // dá tempo do WhatsApp carregar antes do próximo
        await sleep(intervalMs);
      } else {
        // bloqueado totalmente -> salva para ação manual
        faltandoTelefone.push({ nome: ag?.clientes?.nome || "Cliente", mensagem: msg });
        await sleep(200);
      }
    } else {
      // sem telefone
      faltandoTelefone.push({ nome: ag?.clientes?.nome || "Cliente", mensagem: msg });

      if (copiarSemTelefone) {
        try {
          await navigator.clipboard.writeText(msg);
          copiados++;
        } catch {
          // clipboard pode falhar sem gesto do usuário — segue para ação manual
        }
      }
      await sleep(120);
    }
  }

  return { enviados, copiados, faltandoTelefone }

}
export const montarMensagemCobranca = mensagemCobranca;