import React from 'react';
import { LayoutDashboard, FolderOpen, Film, Tv, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CURRENT_USER } from '../constants';
import { NavItem } from '../types';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Proyectos', icon: FolderOpen },
    { id: 'media', label: 'Medios', icon: Film },
    { id: 'channels', label: 'Canales', icon: Tv },
  ];

  const getPath = (id: string) => {
    switch (id) {
        case 'dashboard': return '/';
        case 'projects': return '/projects';
        case 'media': return '/media';
        case 'channels': return '/channels';
        default: return '/';
    }
  };

  const isActive = (id: string) => {
      const path = getPath(id);
      if (path === '/' && location.pathname === '/') return true;
      if (path !== '/' && location.pathname.startsWith(path)) return true;
      return false;
  };

  return (
    <div className="w-64 h-full min-h-screen bg-[#09090b] border-r border-white/5 flex flex-col justify-between fixed left-0 top-0 z-50">
      <div>
        {/* Logo Area */}
        <div className="p-6 flex items-center gap-3 mb-4 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            CS
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-white">CREATOR STUDIO</h1>
            <p className="text-[10px] text-gray-500">v2.4.0</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(getPath(item.id))}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(item.id)
                  ? 'bg-primary-600/10 text-primary-500 border-l-2 border-primary-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/5 space-y-4">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm">
          <Settings size={18} />
          Ajustes
        </button>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="relative">
                <img src={CURRENT_USER.avatar} alt="User" className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-500/30" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#09090b] rounded-full"></div>
            </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{CURRENT_USER.name}</p>
            <p className="text-xs text-gray-500 truncate">{CURRENT_USER.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;