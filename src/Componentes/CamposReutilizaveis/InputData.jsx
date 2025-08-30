import React from 'react';

export default function InputData({ value, onChange }) {
  const formatarData = (valor) => {
    const v = valor.replace(/\D/g, '').slice(0, 8);
    const dia = v.slice(0, 2);
    const mes = v.slice(2, 4);
    const ano = v.slice(4, 8);
    return [dia, mes, ano].filter(Boolean).join('/');
  };

  const handleChange = (e) => {
    onChange(formatarData(e.target.value));
  };

  return (
    <input
      type="text"
      placeholder="dd/mm/aaaa"
      value={formatarData(value)}
      onChange={handleChange}
      className="input-padrao px-1 text-left"
    />
  );
}
