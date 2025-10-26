import React from 'react';

export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-5 w-5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-30"></span>
        <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500/70"></span>
      </span>
      <span className="text-slate-300">{label}</span>
    </div>
  );
}