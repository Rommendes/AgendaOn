//export const apenasNumeros = (valor) =>
  //String(valor || "").replace(/\D/g, "");
export const apenasNumeros = (valor) => String(valor ?? "").replace(/\D/g, "");

export const whatsappLink = (telefone) => {
  const v = apenasNumeros(telefone);
  if (v.length !== 11) return null;
  return `https://wa.me/55${v}`;
};

// (99) 99999-9999
export const formatarTelefoneBR = (valor) => {
  const digits = apenasNumeros(valor).slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

// 12345-678
export const formatarCEP = (valor) => {
  const digits = apenasNumeros(valor).slice(0, 8);

  if (digits.length <= 5) return digits;
  
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

// Exibição: dd/mm/aaaa (aceita ISO "YYYY-MM-DD")
export const formatarDataBR = (iso) => {
  if (!iso) return "";
  // evita bug de fuso horário
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
};

