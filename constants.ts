import { Project, Reminder, User } from './types';

export const CURRENT_USER: User = {
  name: 'Alex Designer',
  role: 'Pro Plan',
  avatar: 'https://picsum.photos/id/64/100/100'
};

export const RECENT_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Review Tech: Sony A7IV',
    thumbnail: 'https://picsum.photos/id/250/200/200',
    status: 'Editing',
    lastEdited: 'Hace 4h'
  },
  {
    id: '2',
    name: 'Tutorial: Color Grading',
    thumbnail: 'https://picsum.photos/id/30/200/200',
    status: 'Rendering',
    lastEdited: 'Ayer'
  },
  {
    id: '3',
    name: 'Podcast Ep. 42',
    thumbnail: 'https://picsum.photos/id/100/200/200',
    status: 'Post-Prod',
    lastEdited: '3 Oct'
  }
];

export const REMINDERS: Reminder[] = [
  {
    id: '1',
    text: 'Faltan subtítulos en Vlog Japón',
    priority: 'High',
    completed: false
  },
  {
    id: '2',
    text: 'Exportar render final Cliente X',
    priority: 'Normal',
    date: 'Hoy, 18:00',
    completed: false
  },
  {
    id: '3',
    text: 'Revisar audio tracks',
    priority: 'Normal',
    completed: true
  }
];

export const HERO_PROJECT: Project = {
  id: 'hero-1',
  name: 'Vlog de Viaje: Japón 2024',
  thumbnail: 'https://picsum.photos/id/292/800/450',
  status: 'In Script',
  lastEdited: 'Editado hace 2h',
  progress: 75
};

export const LIBRARY_PROJECTS: Project[] = [
  {
    id: 'lib-1',
    name: 'Campaña Verano 2024',
    type: 'Comercial',
    lastEdited: 'Hace 2h',
    status: 'Editing',
    progress: 65,
    duration: '04:32',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'lib-2',
    name: 'Entrevista CEO - Q3',
    type: 'Corporativo',
    lastEdited: 'Ayer',
    status: 'Review',
    progress: 90,
    duration: '01:15',
    thumbnail: '' // No image, use placeholder
  },
  {
    id: 'lib-3',
    name: 'Highlight Reel Gaming',
    type: 'Redes Sociales',
    lastEdited: 'Hace 3d',
    status: 'Draft',
    progress: 15,
    duration: '--:--',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'lib-4',
    name: 'Tutorial: Intro a UI',
    type: 'Educativo',
    lastEdited: 'Hace 1s',
    status: 'Editing',
    progress: 45,
    duration: '12:40',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'lib-5',
    name: 'Teaser Producto X',
    type: 'Publicidad',
    lastEdited: '12 Oct',
    status: 'Finished',
    progress: 100,
    duration: '00:30',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop'
  }
];

export const RECENTLY_VIEWED_PROJECTS = [
  {
    id: 'rv-1',
    name: 'Documental "Raíces"',
    edited: 'Modificado hace 5m',
    status: 'Corrección Color',
    duration: '45:00',
    color: 'bg-purple-900/50'
  },
  {
    id: 'rv-2',
    name: 'Stories Instagram Octubre',
    edited: 'Modificado hace 1h',
    status: 'Exportando',
    duration: '00:15',
    color: 'bg-blue-900/50'
  }
];