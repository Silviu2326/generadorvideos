import React from 'react';
import { useEditorStore } from '../../store/editorStore';

export const InspectorPanel: React.FC = () => {
  const selectedClipId = useEditorStore((state) => state.selectedClipId);

  if (!selectedClipId) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-gray-500 bg-gray-50">
        <p>Ningún clip seleccionado</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Inspector</h2>
      </div>
      
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Volumen */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="volume" className="text-sm font-medium text-gray-700">
              Volumen
            </label>
            <span className="text-xs text-gray-500">100%</span>
          </div>
          <input
            id="volume"
            type="range"
            min="0"
            max="100"
            defaultValue="100"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Opacidad */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="opacity" className="text-sm font-medium text-gray-700">
              Opacidad
            </label>
            <span className="text-xs text-gray-500">100%</span>
          </div>
          <input
            id="opacity"
            type="range"
            min="0"
            max="100"
            defaultValue="100"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Posición */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Posición
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">X</span>
              <input
                type="number"
                placeholder="0"
                className="w-full pl-6 pr-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">Y</span>
              <input
                type="number"
                placeholder="0"
                className="w-full pl-6 pr-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
