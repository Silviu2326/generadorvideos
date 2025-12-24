import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl font-light text-white tracking-tight">
          Hola, <span className="font-normal text-white">Alex</span>
        </h2>
        <p className="text-gray-500 text-sm mt-1">Aquí tienes el resumen de tu producción hoy.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs text-gray-400 font-medium">Sistema Operativo</span>
        </div>
      </div>
    </header>
  );
};

export default Header;