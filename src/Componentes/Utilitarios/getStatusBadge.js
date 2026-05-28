const getStatusBadge = (status, pagamento) => {
  const pagamentoNormalizado = (pagamento || '').toUpperCase();

  if (status === 'Concluído' && pagamentoNormalizado === 'PENDENTE') {
    return {
      label: 'Pendente',
      style: 'bg-red-300 text-red-700',
    };
  }

  if (status === 'Concluído') {
    return {
      label: 'Concluído',
      style: 'bg-green-300 text-green-800',
    };
  }

  if (status === 'Agendado') {
    return {
      label: 'Agendado',
      style: 'bg-blue-300 text-blue-800',
    };
  }

  return {
    label: 'Cancelado',
    style: 'bg-gray-300 text-gray-800',
  };
};
export default getStatusBadge;
