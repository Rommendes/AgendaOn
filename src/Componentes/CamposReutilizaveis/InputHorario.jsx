import React from 'react';

export default function InputHorario({ value, onChange }) {
  const formatarHorario = (valor) => {
    const v = valor.replace(/\D/g, '').slice(0, 4);
    const hora = v.slice(0, 2);
    const minuto = v.slice(2, 4);
    return [hora, minuto].filter(Boolean).join(':');
  };

  const handleChange = (e) => {
    onChange(formatarHorario(e.target.value));
  };

  return (
    <input
      type="text"
      placeholder="hh:mm"
      value={formatarHorario(value)}
      onChange={handleChange}
      className="input-padrao py-[0.5] px-2 text-left  "
    />
  );
}
