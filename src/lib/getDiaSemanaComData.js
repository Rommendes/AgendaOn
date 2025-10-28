
export const getDiaSemanaComData = (data) => {
  if (!data) return "Data inválida";

  const diasDaSemana = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  const dataObj = new Date(data);
  if (isNaN(dataObj)) return "Data inválida";

  const diaSemana = diasDaSemana[dataObj.getDay()];
  const dataFormatada = dataObj.toLocaleDateString("pt-BR");

  return `${diaSemana} - ${dataFormatada}`;
};

