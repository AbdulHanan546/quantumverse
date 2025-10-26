import React from 'react';

export default function Input({ label, type = 'text', value, onChange, placeholder, autoComplete, name }) {
  return (
    <label className="block">
      {label && <div className="mb-2 text-sm text-slate-300">{label}</div>}
      <input
        className="input-base"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        name={name}
      />
    </label>
  );
}