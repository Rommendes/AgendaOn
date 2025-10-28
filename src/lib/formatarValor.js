export function formatarValor(valor) {
  const numero = parseFloat(valor);
  if (isNaN(numero)) return "R$ 0,00";
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}
