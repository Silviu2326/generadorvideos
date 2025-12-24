import { Request, Response } from 'express';
import { Post, Demographic, Country } from '../types';

const CHART_DATA = [
    { day: '1', views: 35, subs: 20, ctr: 40 },
    { day: '2', views: 55, subs: 35, ctr: 55 },
    { day: '3', views: 40, subs: 25, ctr: 45 },
    { day: '4', views: 70, subs: 45, ctr: 65 },
    { day: '5', views: 50, subs: 30, ctr: 48 },
    { day: '6', views: 85, subs: 60, ctr: 75 },
    { day: '7', views: 60, subs: 40, ctr: 58 },
    { day: '8', views: 75, subs: 50, ctr: 70 },
    { day: '9', views: 45, subs: 30, ctr: 50 },
    { day: '10', views: 90, subs: 70, ctr: 82 },
    { day: '11', views: 65, subs: 45, ctr: 60 },
    { day: '12', views: 80, subs: 55, ctr: 72 },
    { day: '13', views: 55, subs: 35, ctr: 50 },
    { day: '14', views: 95, subs: 75, ctr: 88 },
];

const RECENT_POSTS: Post[] = [
    { id: 1, title: 'Cómo editar más rápido en 2024', platform: 'youtube', date: 'Hace 2 horas', views: '12.5K', likes: '1.2K', thumb: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=200&auto=format&fit=crop' },
    { id: 2, title: 'Truco de iluminación 💡', platform: 'tiktok', date: 'Ayer', views: '45.2K', likes: '8.5K', thumb: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=200&auto=format&fit=crop' },
    { id: 3, title: 'Behind the scenes', platform: 'instagram', date: 'Hace 3 días', views: '18.9K', likes: '2.1K', thumb: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=200&auto=format&fit=crop' },
];

const DEMOGRAPHICS: Demographic[] = [
    { label: '18-24 años', percent: 45, color: 'bg-primary-500' },
    { label: '25-34 años', percent: 32, color: 'bg-primary-600' },
    { label: '35-44 años', percent: 15, color: 'bg-primary-700' },
    { label: '45+ años', percent: 8, color: 'bg-gray-600' },
];

const TOP_COUNTRIES: Country[] = [
    { country: 'Estados Unidos', flag: '🇺🇸', percent: 35 },
    { country: 'España', flag: '🇪🇸', percent: 28 },
    { country: 'México', flag: '🇲🇽', percent: 15 },
    { country: 'Argentina', flag: '🇦🇷', percent: 10 },
];

export const getPlatformStats = (req: Request, res: Response) => {
    const platformId = req.query.platform as string || 'all';
    
    // Simulate different data based on selection
    const multipliers: Record<string, number> = { all: 1, youtube: 0.6, instagram: 0.3, tiktok: 0.8, facebook: 0.15 };
    const m = multipliers[platformId] || 1;

    const stats = [
        { label: 'Alcance Total', value: (2.4 * m).toFixed(1) + 'M', change: '+' + (12.5 * m).toFixed(1) + '%', trend: 'up', color: 'text-blue-400' },
        { label: 'Seguidores', value: (342 * m).toFixed(0) + 'K', change: '+' + (5.2 * m).toFixed(1) + '%', trend: 'up', color: 'text-purple-400' },
        { label: 'Engagement', value: (8.4 * (1/m)).toFixed(1) + '%', change: '-1.1%', trend: 'down', color: 'text-orange-400' },
        { label: 'Ingresos Est.', value: '$' + (4250 * m).toFixed(0), change: '+18.2%', trend: 'up', color: 'text-green-400' },
    ];

    res.json(stats);
};

export const getChartData = (req: Request, res: Response) => {
    res.json(CHART_DATA);
};

export const getRecentPosts = (req: Request, res: Response) => {
    res.json(RECENT_POSTS);
};

export const getDemographics = (req: Request, res: Response) => {
    res.json(DEMOGRAPHICS);
};

export const getTopCountries = (req: Request, res: Response) => {
    res.json(TOP_COUNTRIES);
};
