import React, { useState, useEffect } from 'react';
import { 
  Youtube, Instagram, Facebook, Video, 
  TrendingUp, Users, Eye, BarChart2, ArrowUpRight, ArrowDownRight,
  Plus, Heart, Zap, MoreHorizontal, MousePointerClick
} from 'lucide-react';
import { api } from '../services/api';
import { PlatformStats, ChartDataPoint, Post, Demographic, Country } from '../types';

// UI Configuration for Platforms
const PLATFORMS_CONFIG = [
    { id: 'all', name: 'Vista General', icon: BarChart2, color: 'text-white', bg: 'bg-white/10' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500', bg: 'bg-red-500/10', handle: '@CreatorStudio' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-500/10', handle: '@creator_studio' },
    { id: 'tiktok', name: 'TikTok', icon: Video, color: 'text-teal-400', bg: 'bg-teal-400/10', handle: '@creator.studio' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-500', bg: 'bg-blue-500/10', handle: 'Creator Studio' },
];

const ChannelsPage: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [stats, setStats] = useState<PlatformStats[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [demographics, setDemographics] = useState<Demographic[]>([]);
  const [topCountries, setTopCountries] = useState<Country[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch stats for the selected platform
        const statsData = await api.analytics.getStats(selectedPlatform);
        
        // Map icon strings to components if needed, or just rely on index/label if backend doesn't send icon component (it sends string usually)
        // Since my backend sends 'icon' as undefined/string, and frontend used imports, I'll map them manually here for now based on label or index
        // Or simply iterate and assign icons based on label matching for this demo
        const mappedStats = statsData.map((s: any) => {
            let Icon = Eye;
            if (s.label.includes('Seguidores')) Icon = Users;
            if (s.label.includes('Engagement')) Icon = MousePointerClick;
            if (s.label.includes('Ingresos')) Icon = Zap;
            return { ...s, icon: Icon };
        });
        setStats(mappedStats);

        // Fetch other data only once or when appropriate (here re-fetching all for simplicity on platform change or just load once)
        // In real app, chart/demographics might also filter by platform.
        if (chartData.length === 0) {
            const chart = await api.analytics.getChartData();
            setChartData(chart);
            
            const demo = await api.analytics.getDemographics();
            setDemographics(demo);
            
            const countries = await api.analytics.getTopCountries();
            setTopCountries(countries);
            
            const posts = await api.analytics.getRecentPosts();
            setRecentPosts(posts);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPlatform]);

  const PlatformIcon = ({ platform, size = 14 }: { platform: string, size?: number }) => {
      switch(platform) {
          case 'youtube': return <Youtube size={size} className="text-red-500" />;
          case 'instagram': return <Instagram size={size} className="text-pink-500" />;
          case 'tiktok': return <Video size={size} className="text-teal-400" />; 
          case 'facebook': return <Facebook size={size} className="text-blue-500" />;
          default: return <BarChart2 size={size} className="text-gray-400" />;
      }
  };

  // Helper to draw SVG path for the trend line
  const getPolylinePoints = () => {
    if (chartData.length === 0) return "";
    const width = 100 / (chartData.length - 1);
    return chartData.map((d, i) => `${i * width},${100 - d.ctr}`).join(' ');
  };

  return (
    <div className="flex h-screen bg-[#050505] text-gray-300 overflow-hidden font-sans">
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto custom-scrollbar p-6 lg:p-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
            <div>
                <h1 className="text-3xl font-light text-white tracking-tight">Canales & Distribución</h1>
                <p className="text-gray-500 text-sm mt-1">Analítica unificada y gestión de audiencias.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 bg-[#0E0E10] p-1.5 rounded-xl border border-white/5">
                 {PLATFORMS_CONFIG.map(p => (
                    <button 
                        key={p.id}
                        onClick={() => setSelectedPlatform(p.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedPlatform === p.id 
                            ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <p.icon size={16} className={selectedPlatform === p.id ? p.color : 'text-gray-500'} />
                        <span className="hidden md:inline">{p.name}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* 1. Dynamic KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-[#0E0E10] border border-white/5 p-5 rounded-xl hover:border-white/10 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                        {stat.icon && <stat.icon size={48} className={stat.color} />}
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            {stat.label}
                        </p>
                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-medium text-white tracking-tight">{stat.value}</span>
                            <div className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded mb-1.5 ${stat.trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
                                {stat.change}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* 2. Main Analytics Column */}
            <div className="xl:col-span-2 space-y-6">
                
                {/* Advanced Hybrid Chart */}
                <div className="bg-[#0E0E10] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                <TrendingUp size={18} className="text-primary-500" />
                                Rendimiento de Audiencia
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Comparativa de Vistas vs CTR en los últimos 14 días.</p>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500 font-medium">
                             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary-600"></div>Vistas</div>
                             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-700"></div>Subs</div>
                             <div className="flex items-center gap-2"><div className="w-3 h-0.5 rounded-full bg-yellow-500"></div>CTR %</div>
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div className="relative flex-1 w-full h-64 mt-4">
                        
                        {/* Bars Layer */}
                        <div className="absolute inset-0 flex items-end justify-between gap-2 px-2 z-10">
                            {chartData.map((data, i) => (
                                <div key={i} className="flex-1 h-full flex items-end justify-center gap-1 group relative">
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-50 pointer-events-none">
                                        <div className="bg-[#18181b] border border-white/10 text-white text-[10px] p-2 rounded-lg shadow-xl whitespace-nowrap">
                                            <div className="font-bold mb-1">Día {data.day}</div>
                                            <div className="flex justify-between gap-3 text-gray-400"><span>Vistas:</span> <span className="text-white font-mono">{data.views * 150}</span></div>
                                            <div className="flex justify-between gap-3 text-gray-400"><span>CTR:</span> <span className="text-yellow-400 font-mono">{data.ctr / 10}%</span></div>
                                        </div>
                                    </div>
                                    
                                    {/* Primary Bar (Views) */}
                                    <div 
                                        className="w-2 md:w-4 bg-gradient-to-t from-primary-900 to-primary-600 rounded-t-sm transition-all duration-300 group-hover:to-primary-400 shadow-[0_0_10px_rgba(79,70,229,0.1)]" 
                                        style={{ height: `${data.views}%` }}
                                    ></div>
                                    
                                    {/* Secondary Bar (Subs) */}
                                    <div 
                                        className="w-2 md:w-4 bg-gray-800 rounded-t-sm transition-all duration-300 group-hover:bg-gray-700" 
                                        style={{ height: `${data.subs}%` }}
                                    ></div>
                                </div>
                            ))}
                        </div>

                        {/* Trend Line Layer (SVG) */}
                        <div className="absolute inset-0 z-20 pointer-events-none px-4 pb-2"> {/* Padding to align with bars centers roughly */}
                            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                                {/* Glow Effect */}
                                <polyline 
                                    points={getPolylinePoints()} 
                                    fill="none" 
                                    stroke="rgba(234, 179, 8, 0.3)" 
                                    strokeWidth="4" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className="blur-sm"
                                />
                                {/* Main Line */}
                                <polyline 
                                    points={getPolylinePoints()} 
                                    fill="none" 
                                    stroke="#EAB308" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    vectorEffect="non-scaling-stroke" 
                                />
                                {/* Dots */}
                                {chartData.map((d, i) => {
                                    const width = 100 / (chartData.length - 1);
                                    return (
                                        <circle 
                                            key={i} 
                                            cx={i * width} 
                                            cy={100 - d.ctr} 
                                            r="1.5" 
                                            fill="#18181b" 
                                            stroke="#EAB308" 
                                            strokeWidth="1" 
                                            vectorEffect="non-scaling-stroke"
                                        />
                                    );
                                })}
                            </svg>
                        </div>

                    </div>
                    
                    {/* X Axis Labels */}
                    <div className="flex justify-between mt-4 text-[10px] text-gray-500 font-mono uppercase pt-4 border-t border-white/5">
                        <span>1 Oct</span>
                        <span>7 Oct</span>
                        <span>14 Oct</span>
                        <span>21 Oct</span>
                        <span>28 Oct</span>
                    </div>
                </div>

                {/* Split Row: Demographics & Recent */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Demographics */}
                    <div className="bg-[#0E0E10] border border-white/5 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Users size={16} className="text-primary-500" /> Demografía
                            </h3>
                            <button className="text-xs text-gray-500 hover:text-white"><MoreHorizontal size={16} /></button>
                        </div>
                        
                        <div className="space-y-5">
                            {demographics.map((demo, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-gray-400">{demo.label}</span>
                                        <span className="text-white font-mono">{demo.percent}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${demo.color}`} style={{ width: `${demo.percent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5">
                             <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">Top Países</h4>
                             <div className="grid grid-cols-2 gap-3">
                                 {topCountries.map((c, i) => (
                                     <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                                         <div className="flex items-center gap-2">
                                             <span className="text-base">{c.flag}</span>
                                             <span className="text-xs text-gray-300">{c.country}</span>
                                         </div>
                                         <span className="text-xs font-mono text-primary-400">{c.percent}%</span>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </div>

                    {/* Recent Posts List */}
                    <div className="bg-[#0E0E10] border border-white/5 rounded-2xl p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Últimos Posts</h3>
                            <button className="text-xs text-primary-400 font-bold hover:text-primary-300">VER TODO</button>
                        </div>
                        
                        <div className="flex-1 space-y-4">
                            {recentPosts.map(post => (
                                <div key={post.id} className="group flex items-center gap-4 p-3 rounded-xl bg-[#121214] border border-white/5 hover:border-white/20 transition-all cursor-pointer">
                                    <div className="relative w-16 h-12 shrink-0">
                                        <img src={post.thumb} className="w-full h-full object-cover rounded-lg opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute -bottom-1 -right-1 p-0.5 bg-[#09090b] rounded-full">
                                            <PlatformIcon platform={post.platform} size={12} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-white truncate group-hover:text-primary-400 transition-colors">{post.title}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{post.date}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-mono text-white">{post.views}</p>
                                        <div className="flex items-center justify-end gap-1 text-[10px] text-gray-500">
                                            <Heart size={10} /> {post.likes}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button className="w-full py-3 border border-dashed border-gray-700 rounded-xl text-xs font-bold text-gray-500 hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center gap-2 mt-auto">
                                <Plus size={14} /> Programar Nuevo Post
                            </button>
                        </div>
                    </div>

                </div>

            </div>

            {/* 3. Right Sidebar: Connected Accounts & AI */}
            <div className="space-y-6">
                
                {/* AI Insight Card */}
                <div className="bg-gradient-to-br from-primary-900/40 via-[#1e1b4b] to-black border border-primary-500/30 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(79,70,229,0.15)]">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                             <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-lg animate-pulse">
                                <Zap size={16} />
                            </div>
                            <span className="text-sm font-bold text-white tracking-wide">AI Assistant</span>
                        </div>
                        
                        <p className="text-sm text-gray-200 mb-4 leading-relaxed font-light">
                            He analizado tu audiencia. Tu retención cae al minuto <span className="text-primary-400 font-bold">01:15</span> en videos de tecnología.
                            <br/><br/>
                            <span className="text-xs text-gray-400 bg-black/30 p-2 rounded block border border-white/5">
                                💡 Tip: Intenta añadir un cambio de plano o b-roll dinámico en ese punto.
                            </span>
                        </p>
                        <button className="w-full py-2 bg-white text-black text-xs font-bold rounded hover:bg-gray-200 transition-colors shadow-lg">
                            Generar Guion Optimizado
                        </button>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                </div>

                {/* Accounts List */}
                <div className="bg-[#0E0E10] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Cuentas</h3>
                    <div className="space-y-3">
                        {PLATFORMS_CONFIG.slice(1).map(p => (
                            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-[#121214] border border-white/5 hover:border-white/10 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${p.bg} group-hover:scale-110 transition-transform`}>
                                        <p.icon size={20} className={p.color} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">{p.name}</p>
                                        <p className="text-[10px] text-gray-500">{p.handle}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="w-2 h-2 rounded-full bg-green-500 ml-auto mb-1"></div>
                                    <p className="text-[10px] text-gray-500">Conectado</p>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-2 text-xs font-medium text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                             Gestionar conexiones
                        </button>
                    </div>
                </div>

            </div>

        </div>
      </div>
    </div>
  );
};

export default ChannelsPage;