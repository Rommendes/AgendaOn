import { createLogger } from "../lib/logger";
const logger = createLogger("WhatsApp");

const NUMERO_WHATS_SALAO = import.meta.env.VITE_NUMERO_WHATS_SALAO

export function validarE164BR(numero) {
  const digitos = (numero ?? "").toString().replace(/\D/g, ""); // só números

  if (!digitos.startsWith("55")) {
    logger.warn("⚠️ Número inválido (sem DDI 55):", numero);
    return { ok: false, motivo: "falta o código do país (55)" };
  }

  const semDDI = digitos.slice(2); // tira os dois primeiros (55)
  if (semDDI.length !== 11) {
    logger.warn("⚠️ Número inválido (tamanho após DDI):", numero, "len:", semDDI.length);
    return { ok: false, motivo: `esperado 11 dígitos após DDI, veio ${semDDI.length}` };
  }

  if (semDDI[2] !== "9") {
    logger.warn("⚠️ Número inválido (sem 9º dígito):", numero);
    return { ok: false, motivo: "faltando o 9º dígito do celular" };
  }

  logger.info("✅ Número do salão válido:", digitos);
  return { ok: true };
}

// Checa ao carregar o app
const check = validarE164BR(NUMERO_WHATS_SALAO);
if (!check.ok) {
  
} else {
 
}

export const ENVIADOS_NA_SESSAO = new Set();
let WA_POPUP = null;


/* Helpers */
export function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
export function soDigitos(str) { return (str ?? "").toString().replace(/\D/g, ""); }
export function limpa(str) { return (str ?? "").toString().trim(); }
export function buildWaUrl(numero, textoPuro) {
  const digitos = soDigitos(numero);
  const numeroE164 = digitos.startsWith("55") ? digitos : `55${digitos}`;
  return `https://wa.me/${numeroE164}?text=${encodeURIComponent(textoPuro ?? "")}`;
}

/* WhatsApp popup */
export function abrirWhatsApp(numero, textoPuro, reuse = true) {
  const url = buildWaUrl(numero, textoPuro);
  try {
    if (reuse && WA_POPUP && !WA_POPUP.closed) {
      WA_POPUP.location.href = url;
      WA_POPUP.focus();
      return WA_POPUP;
    }
    WA_POPUP = window.open(url, "wa_bulk", "noopener,noreferrer");
    if (WA_POPUP) WA_POPUP.focus();
    return WA_POPUP || null;
  } catch {
    return null;
  }
}

/* Links de ação (confirmar/reagendar/cancelar) */
export function criarLinksDeAcoes({ nome, data, hora }) {
  if (!NUMERO_WHATS_SALAO) return null;
  const _nome = limpa(nome) || "Cliente";
  const _data = limpa(data);
  const _hora = limpa(hora);
  const partes = [];
  if (_data) partes.push(`dia ${_data}`);
  if (_hora) partes.push(`às ${_hora}`);
  const quando = partes.length ? ` ${partes.join(" ")}` : "";
  return {
    confirmar: buildWaUrl(NUMERO_WHATS_SALAO, `Olá! Confirmo meu atendimento${quando}. (${_nome})`),
    reagendar: buildWaUrl(NUMERO_WHATS_SALAO, `Olá! Gostaria de remarcar meu atendimento${quando}. (${_nome})`),
    cancelar:  buildWaUrl(NUMERO_WHATS_SALAO, `Olá! Preciso cancelar meu atendimento${quando}. (${_nome})`),
  };
}

/* Mensagens: LEMBRETE */
export function mensagemLembrete({ nome, servico, data, hora, observacoes }) {
  const _nome = limpa(nome) || "Cliente";
  const _servico = limpa(servico);
  const _data = limpa(data);
  const _hora = limpa(hora);
  const _obs = limpa(observacoes);
  const acoes = criarLinksDeAcoes({ nome: _nome, data: _data, hora: _hora });

  const blocoAcoes =
    acoes && (_data || _hora)
      ? [
          `Por favor, escolha uma opção:`,
          `✅ Confirmar: ${acoes.confirmar}`,
          `🔁 Reagendar: ${acoes.reagendar}`,
          `❌ Cancelar: ${acoes.cancelar}`,
          ``,
          `Se preferir, responda esta mensagem com *CONFIRMAR*, *REAGENDAR* ou *CANCELAR*.`,
          ``,
        ].join("\n")
      : "";

  return [
    `⏰ Olá, *${_nome}*!`,
    ``,
    `Passando para lembrar do seu agendamento:`,
    _servico ? `• Serviço: *${_servico}*` : "",
    _data ? `• Data: *${_data}*` : "",
    _hora ? `• Horário: *${_hora}*` : "",
    _obs ? `📝 Observações: ${_obs}` : "",
    ``,
    blocoAcoes,
    `Aguardamos você! 💇‍♀️💅`,
    `*Carmem Studio*`,
  ].filter(Boolean).join("\n");
}

export function montarTextoLembreteDeAgendamento(ag) {
  const nome = ag?.clientes?.nome || ag?.cliente_nome || "Cliente";
  const servico = ag?.servico || "";
  const dataBR = ag?.data
    ? new Date(`${ag.data}T12:00:00`).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
    : ag?.data_formatada || "";
  const hora = (ag?.horario || ag?.hora || "").toString().slice(0, 5);
  const observacoes = ag?.obs || ag?.observacoes || "";
  return mensagemLembrete({ nome, servico, data: dataBR, hora, observacoes });
}

/* Mensagens: COBRANÇA */
function formatarValorBR(valor) {
  const num = Number(valor ?? 0);
  try { return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
  catch { return `R$ ${num.toFixed(2)}`.replace(".", ","); }
}
export function mensagemCobranca({
  nome, servico, valor, vencimento, data, hora, observacoes, linkPagamento, pix,
} = {}) {
  const _nome = limpa(nome) || "Cliente";
  const _servico = limpa(servico);
  const _valor = formatarValorBR(valor);
  const _venc = limpa(vencimento);
  const _data = limpa(data);
  const _hora = limpa(hora);
  const _obs = limpa(observacoes);
  const _link = limpa(linkPagamento);
  const _pix = typeof pix === "string" ? pix.trim() : "";
  return [
    `💳 Olá, *${_nome}*!`,
    ``,
    `Segue a cobrança referente ao atendimento:`,
    _servico ? `• Serviço: *${_servico}*` : "",
    `• Valor: *${_valor}*`,
    _venc ? `• Vencimento: *${_venc}*` : "",
    _data ? `• Data do atendimento: *${_data}*` : "",
    _hora ? `• Horário: *${_hora}*` : "",
    _obs ? `📝 Observações: ${_obs}` : "",
    ``,
    _link ? `👉 Pagar agora: ${_link}` : "",
    _pix ? `🔑 Chave PIX: ${_pix}` : "",
    !_link && !_pix ? `Formas de pagamento: PIX, dinheiro ou cartão na recepção.` : "",
    ``,
    `Qualquer dúvida, estamos à disposição!`,
    `*Salão Sandro e Carmem*`,
  ].filter(Boolean).join("\n");
}
export const montarMensagemCobranca = mensagemCobranca;

/* Envio individual / em lote */
export async function copiarTexto(texto) {
  try { await navigator.clipboard.writeText(texto); return true; }
  catch { return false; }
}
export async function enviarLembreteDeAgendamento(ag) {
  const telefone = (ag?.clientes?.telefone || ag?.telefone || "").toString();
  const texto = montarTextoLembreteDeAgendamento(ag);
  const temTelefone = telefone && soDigitos(telefone).length >= 10;
  if (temTelefone) { abrirWhatsApp(telefone, texto); return "enviado"; }
  await copiarTexto(texto); return "copiado";
}
export async function enviarLembretesEmLote(lista, { intervalMs = 1600, copiarSemTelefone = false } = {}) {
  const itens = Array.isArray(lista) ? lista : [];
  let enviados = 0, copiados = 0;
  const faltandoTelefone = [];
  for (const ag of itens) {
    const telefone = (ag?.clientes?.telefone || ag?.telefone || "").toString();
    const msg = montarTextoLembreteDeAgendamento(ag);
    const temTelefone = telefone && soDigitos(telefone).length >= 10;
    if (temTelefone) {
      const win = abrirWhatsApp(telefone, msg, true);
      if (win) { enviados++; await sleep(intervalMs); }
      else { faltandoTelefone.push({ nome: ag?.clientes?.nome || "Cliente", mensagem: msg }); await sleep(200); }
    } else {
      faltandoTelefone.push({ nome: ag?.clientes?.nome || "Cliente", mensagem: msg });
      if (copiarSemTelefone) { if (await copiarTexto(msg)) copiados++; }
      await sleep(120);
    }
  }
  return { enviados, copiados, faltandoTelefone };
}
