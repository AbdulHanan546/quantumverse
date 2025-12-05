import React  from 'react';
import type { ChangeEvent } from 'react';

interface InputProps {
  label?: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  name?: string;
}

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  name,
}: InputProps) {
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
