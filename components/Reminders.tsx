import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../services/api';
import { Reminder } from '../types';

const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const data = await api.reminders.getAll();
        setReminders(data);
      } catch (error) {
        console.error("Error fetching reminders:", error);
      }
    };
    fetchReminders();
  }, []);

  return (
    <div className="w-full lg:w-80 bg-[#0E0E10] border border-white/5 rounded-2xl p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-light text-gray-200">Recordatorios</h3>
        <button className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 text-gray-400">
            <Plus size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {reminders.map((reminder) => (
            <div 
                key={reminder.id} 
                className={`p-3 rounded-xl border ${reminder.completed ? 'bg-transparent border-transparent opacity-50' : 'bg-[#18181b] border-white/5 hover:border-white/10'} transition-all`}
            >
                <div className="flex items-start gap-3">
                    <div className={`mt-1 w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${reminder.completed ? 'bg-primary-900 border-primary-500' : 'border-gray-600'}`}>
                        {reminder.completed && <div className="w-2 h-2 bg-primary-500 rounded-sm"></div>}
                    </div>
                    <div className="flex-1">
                        <p className={`text-sm ${reminder.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                            {reminder.text}
                        </p>
                        {reminder.priority === 'High' && (
                            <span className="text-[10px] text-red-400 font-medium mt-1 block">Alta Prioridad</span>
                        )}
                        {reminder.date && (
                             <span className="text-[10px] text-gray-500 mt-1 block">{reminder.date}</span>
                        )}
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Reminders;