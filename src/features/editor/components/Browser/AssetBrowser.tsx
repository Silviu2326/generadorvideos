import React, { useState } from 'react';

type Tab = 'media' | 'effects';

export const AssetBrowser: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('media');

  // Simulated assets for demonstration
  const mediaItems = Array.from({ length: 12 }, (_, i) => ({ id: i, type: 'video', name: `Clip ${i + 1}` }));
  const effectItems = Array.from({ length: 8 }, (_, i) => ({ id: i, type: 'effect', name: `Effect ${i + 1}` }));

  const items = activeTab === 'media' ? mediaItems : effectItems;

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white border-r border-gray-700">
      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'media'
              ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:bg-gray-800'
          }`}
          onClick={() => setActiveTab('media')}
        >
          Medios
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'effects'
              ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:bg-gray-800'
          }`}
          onClick={() => setActiveTab('effects')}
        >
          Efectos
        </button>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="aspect-square bg-gray-800 border border-gray-700 rounded hover:border-blue-500 cursor-pointer flex items-center justify-center relative group"
            >
              <div className="text-xs text-gray-400 font-mono">{item.name}</div>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                <span className="text-white text-xl">+</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
