export const apenasNumeros = (valor) =>
  String(valor || "").replace(/\D/g, "");

// (99) 99999-9999
export const mascararTelefoneBR = (valor) => {
  const digits = apenasNumeros(valor).slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

// 12345-678
export const mascararCEP = (valor) => {
  const digits = apenasNumeros(valor).slice(0, 8);

  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};
