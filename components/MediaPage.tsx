import React, { useState, useEffect } from 'react';
import { 
  Search, Upload, Grid, List, Folder as FolderIcon, Filter, 
  MoreVertical, Film, Image as ImageIcon, Music, 
  File, ChevronRight, Star, Clock, Trash2, HardDrive,
  Info, Download, Share2, Tag, ChevronDown, CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { MediaAsset, Folder } from '../types';

const SMART_BINS = [
  { id: 'fav', name: 'Favoritos', icon: Star, color: 'text-yellow-500' },
  { id: 'recent', name: 'Añadido Recientemente', icon: Clock, color: 'text-blue-400' },
  { id: 'deleted', name: 'Papelera', icon: Trash2, color: 'text-red-400' },
];

const MediaPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsData, foldersData] = await Promise.all([
          api.media.getAll(),
          api.media.getFolders()
        ]);
        setAssets(assetsData);
        setFolders(foldersData);
      } catch (error) {
        console.error("Error fetching media:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived state
  const filteredAssets = assets.filter(asset => {
    const matchesFolder = selectedFolder === 'all' || asset.folderId === selectedFolder;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const lastSelectedAsset = assets.find(a => a.id === selectedAssets[selectedAssets.length - 1]);

  const toggleSelection = (id: string, multi: boolean) => {
    if (multi) {
      setSelectedAssets(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
    } else {
      setSelectedAssets([id]);
    }
  };

  const handleDelete = async () => {
      if (selectedAssets.length === 0) return;
      if (!confirm('¿Estás seguro de que deseas eliminar los elementos seleccionados?')) return;

      try {
          await Promise.all(selectedAssets.map(id => api.media.delete(id)));
          setAssets(prev => prev.filter(a => !selectedAssets.includes(a.id)));
          setSelectedAssets([]);
      } catch (error) {
          console.error("Error deleting assets:", error);
          alert("Error al eliminar elementos.");
      }
  };

  const handleImport = async () => {
      // Simulation of file input and upload
      // In a real app, we would open a file dialog, get the file, upload it via FormData
      // Here we just create a mock asset entry
      const name = prompt("Nombre del archivo a simular:");
      if (!name) return;

      const type = name.endsWith('.mp4') ? 'video' : name.endsWith('.mp3') ? 'audio' : 'image';
      
      const newAssetData: Omit<MediaAsset, 'id' | 'date'> = {
          name,
          type: type as any,
          size: '5 MB',
          folderId: selectedFolder === 'all' ? 'cam-a' : selectedFolder, // Default to a folder
          // ... other mock metadata
      };

      try {
          const newAsset = await api.media.create(newAssetData);
          setAssets(prev => [...prev, newAsset]);
      } catch (error) {
          console.error("Error creating asset:", error);
      }
  };

  const AssetIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'video': return <Film size={16} />;
      case 'audio': return <Music size={16} />;
      case 'image': return <ImageIcon size={16} />;
      default: return <File size={16} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-gray-300 overflow-hidden font-sans">
      
      {/* 1. LEFT SIDEBAR: BINS & FOLDERS */}
      <div className="w-64 bg-[#09090b] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-4 border-b border-white/5">
           <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
             <HardDrive size={16} className="text-primary-500" /> 
             Media Pool
           </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
           {/* Folders */}
           <div className="space-y-1">
             <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Carpetas</p>
             {folders.map(folder => (
               <button
                 key={folder.id}
                 onClick={() => setSelectedFolder(folder.id)}
                 className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                   selectedFolder === folder.id 
                     ? 'bg-primary-600/10 text-primary-400 font-medium' 
                     : 'text-gray-400 hover:text-white hover:bg-white/5'
                 }`}
               >
                 {/* Map icon string to component if needed, or use default FolderIcon */}
                 <FolderIcon size={16} className={selectedFolder === folder.id ? 'text-primary-500' : 'text-gray-500'} />
                 {folder.name}
               </button>
             ))}
           </div>

           {/* Smart Bins */}
           <div className="space-y-1">
             <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Smart Bins</p>
             {SMART_BINS.map(bin => (
               <button
                 key={bin.id}
                 className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
               >
                 <bin.icon size={16} className={bin.color} />
                 {bin.name}
               </button>
             ))}
           </div>
        </div>

        {/* Storage Meter */}
        <div className="p-4 border-t border-white/5">
            <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-400">Almacenamiento</span>
                <span className="text-white font-mono">45%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-1">
                <div className="w-[45%] h-full bg-gradient-to-r from-primary-600 to-indigo-400"></div>
            </div>
            <span className="text-[10px] text-gray-500">450GB de 1TB usados</span>
        </div>
      </div>


      {/* 2. MAIN CONTENT: ASSET GRID/LIST */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#050505]">
        
        {/* Toolbar */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#09090b]">
           <div className="flex items-center gap-4 flex-1">
               <div className="relative group max-w-md w-full">
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-white transition-colors" />
                   <input 
                      type="text" 
                      placeholder="Buscar medios..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#121214] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-colors"
                   />
               </div>
               
               <div className="h-6 w-px bg-white/10 mx-2"></div>

               <button className="flex items-center gap-2 text-gray-400 hover:text-white text-sm px-3 py-1.5 rounded hover:bg-white/5 transition-colors">
                   <Filter size={16} />
                   <span>Filtrar</span>
                   <ChevronDown size={14} />
               </button>
           </div>

           <div className="flex items-center gap-3">
               <div className="bg-[#121214] border border-white/10 rounded-lg p-0.5 flex">
                   <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                   >
                       <Grid size={16} />
                   </button>
                   <button 
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                   >
                       <List size={16} />
                   </button>
               </div>
               
               <button 
                 onClick={handleImport}
                 className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all"
               >
                   <Upload size={16} />
                   Importar
               </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar" onClick={() => setSelectedAssets([])}>
            
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredAssets.map(asset => {
                        const isSelected = selectedAssets.includes(asset.id);
                        return (
                            <div 
                                key={asset.id}
                                onClick={(e) => { e.stopPropagation(); toggleSelection(asset.id, e.ctrlKey || e.metaKey); }}
                                className={`group relative bg-[#0E0E10] border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:bg-[#18181b] ${
                                    isSelected ? 'border-primary-500 ring-1 ring-primary-500/50' : 'border-white/5 hover:border-white/20'
                                }`}
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video bg-[#000] relative overflow-hidden">
                                    {asset.thumbnail ? (
                                        <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#18181b]">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                                                <AssetIcon type={asset.type} />
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Type Badge */}
                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-white font-medium flex items-center gap-1">
                                        <AssetIcon type={asset.type} />
                                    </div>

                                    {/* Duration Badge */}
                                    {asset.duration && (
                                        <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-300">
                                            {asset.duration}
                                        </div>
                                    )}

                                    {/* Selection Check */}
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 text-primary-500 bg-black/50 rounded-full">
                                            <CheckCircle2 size={18} fill="black" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-3">
                                    <h4 className="text-sm font-medium text-gray-200 truncate mb-1" title={asset.name}>{asset.name}</h4>
                                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                                        <span>{asset.resolution || asset.codec || asset.size}</span>
                                        <span>{asset.date}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="min-w-full inline-block align-middle">
                    <div className="border border-white/5 rounded-lg overflow-hidden bg-[#0E0E10]">
                        <table className="min-w-full divide-y divide-white/5">
                            <thead className="bg-[#121214]">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider w-10"></th>
                                    <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nombre</th>
                                    <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tipo</th>
                                    <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Resolución</th>
                                    <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">FPS</th>
                                    <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Codec</th>
                                    <th scope="col" className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tamaño</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredAssets.map((asset) => (
                                    <tr 
                                        key={asset.id}
                                        onClick={(e) => { e.stopPropagation(); toggleSelection(asset.id, e.ctrlKey || e.metaKey); }}
                                        className={`hover:bg-white/5 cursor-pointer transition-colors ${selectedAssets.includes(asset.id) ? 'bg-primary-900/20' : ''}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <AssetIcon type={asset.type} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs font-medium text-white">{asset.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">{asset.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">{asset.resolution || '--'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">{asset.fps || '--'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">{asset.codec || '--'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 text-right font-mono">{asset.size}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </div>


      {/* 3. RIGHT SIDEBAR: INSPECTOR */}
      {lastSelectedAsset && (
          <div className="w-80 bg-[#09090b] border-l border-white/5 flex flex-col shrink-0 animate-in slide-in-from-right-10 duration-200">
             <div className="p-5 border-b border-white/5">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                     <Info size={14} /> Metadatos
                 </h3>
                 <button onClick={handleDelete} className="text-red-500 text-xs ml-auto hover:text-red-400">Eliminar</button>
             </div>

             <div className="flex-1 overflow-y-auto p-5 space-y-6">
                 {/* Preview */}
                 <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/10 shadow-lg">
                     {lastSelectedAsset.thumbnail ? (
                         <img src={lastSelectedAsset.thumbnail} className="w-full h-full object-cover" />
                     ) : (
                         <div className="w-full h-full flex items-center justify-center">
                             <AssetIcon type={lastSelectedAsset.type} />
                         </div>
                     )}
                 </div>

                 {/* Basic Info */}
                 <div>
                     <h4 className="text-base font-medium text-white mb-1 break-words leading-tight">{lastSelectedAsset.name}</h4>
                     <p className="text-xs text-gray-500 mb-4">{lastSelectedAsset.folderId === 'all' ? 'Carpeta Raíz' : folders.find(f => f.id === lastSelectedAsset.folderId)?.name}</p>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#18181b] p-2 rounded border border-white/5">
                            <span className="block text-[10px] text-gray-500 mb-0.5">Tipo</span>
                            <span className="block text-xs text-white capitalize">{lastSelectedAsset.type}</span>
                        </div>
                        <div className="bg-[#18181b] p-2 rounded border border-white/5">
                            <span className="block text-[10px] text-gray-500 mb-0.5">Tamaño</span>
                            <span className="block text-xs text-white">{lastSelectedAsset.size}</span>
                        </div>
                     </div>
                 </div>

                 {/* Technical Specs */}
                 <div className="space-y-3 pt-4 border-t border-white/5">
                     <h5 className="text-[10px] font-bold text-gray-500 uppercase">Especificaciones Técnicas</h5>
                     <div className="space-y-2">
                         <div className="flex justify-between text-xs">
                             <span className="text-gray-400">Duración</span>
                             <span className="text-white font-mono">{lastSelectedAsset.duration || '--:--'}</span>
                         </div>
                         <div className="flex justify-between text-xs">
                             <span className="text-gray-400">Resolución</span>
                             <span className="text-white font-mono">{lastSelectedAsset.resolution || 'N/A'}</span>
                         </div>
                         <div className="flex justify-between text-xs">
                             <span className="text-gray-400">Frame Rate</span>
                             <span className="text-white font-mono">{lastSelectedAsset.fps ? `${lastSelectedAsset.fps} fps` : 'N/A'}</span>
                         </div>
                         <div className="flex justify-between text-xs">
                             <span className="text-gray-400">Codec</span>
                             <span className="text-white font-mono">{lastSelectedAsset.codec || 'N/A'}</span>
                         </div>
                         <div className="flex justify-between text-xs">
                             <span className="text-gray-400">Fecha Creación</span>
                             <span className="text-white">{lastSelectedAsset.date}</span>
                         </div>
                     </div>
                 </div>

                 {/* Tags */}
                 <div className="pt-4 border-t border-white/5">
                     <h5 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Etiquetas</h5>
                     <div className="flex flex-wrap gap-2">
                         <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-300 border border-white/5 flex items-center gap-1">
                            <Tag size={10} /> Shoot A
                         </span>
                         <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-300 border border-white/5 flex items-center gap-1">
                            <Tag size={10} /> Tokyo
                         </span>
                         <button className="px-2 py-1 bg-transparent border border-dashed border-gray-600 rounded text-[10px] text-gray-500 hover:text-white hover:border-gray-400">
                             + Add Tag
                         </button>
                     </div>
                 </div>
             </div>

             <div className="p-4 border-t border-white/5 bg-[#0e0e10]">
                 <div className="grid grid-cols-2 gap-3">
                     <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-lg border border-white/5 transition-colors">
                         <Share2 size={14} /> Compartir
                     </button>
                     <button className="flex items-center justify-center gap-2 px-3 py-2 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 text-xs font-medium rounded-lg border border-primary-500/20 transition-colors">
                         <Download size={14} /> Descargar
                     </button>
                 </div>
             </div>
          </div>
      )}

    </div>
  );
};

export default MediaPage;