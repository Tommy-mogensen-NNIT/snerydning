
import React from 'react';
import { SnowTask } from '../types';
import { MapPin, Phone, Square, Droplets, Hammer, Trash2, CheckCircle } from 'lucide-react';

interface JobCardProps {
  task: SnowTask;
  isOwner?: boolean;
  onTake?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ task, isOwner, onTake, onDelete }) => {
  const pricePerM2 = (task.price / task.area).toFixed(2);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{task.address}</h3>
            <div className="flex items-center text-slate-500 text-sm mt-1">
              <MapPin size={14} className="mr-1" />
              <span>{task.name}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-blue-600">{task.price} kr.</span>
            <div className="text-xs text-slate-400 font-medium">{pricePerM2} kr/m²</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center p-2 bg-slate-50 rounded-lg">
            <Square size={16} className="text-blue-500 mr-2" />
            <span className="text-sm font-semibold">{task.area} m²</span>
          </div>
          <div className="flex items-center p-2 bg-slate-50 rounded-lg">
            <Droplets size={16} className={task.wantsSalt ? "text-blue-500 mr-2" : "text-slate-300 mr-2"} />
            <span className="text-sm">{task.wantsSalt ? "Inkl. salt" : "Ingen salt"}</span>
          </div>
          <div className="flex items-center p-2 bg-slate-50 rounded-lg">
            <Hammer size={16} className={task.hasEquipment ? "text-blue-500 mr-2" : "text-slate-300 mr-2"} />
            <span className="text-sm">{task.hasEquipment ? "Udstyr haves" : "Medbring selv"}</span>
          </div>
          <div className="flex items-center p-2 bg-slate-50 rounded-lg">
            <Phone size={16} className="text-blue-500 mr-2" />
            <span className="text-sm">{task.phone}</span>
          </div>
        </div>

        {task.description && (
          <p className="text-slate-600 text-sm mb-5 bg-blue-50/50 p-3 rounded-xl italic">
            "{task.description}"
          </p>
        )}

        {isOwner ? (
          <button
            onClick={() => onDelete?.(task.id)}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-3 px-4 rounded-xl hover:bg-red-100 transition-colors"
          >
            <Trash2 size={18} />
            Slet / Færdig
          </button>
        ) : (
          <button
            onClick={() => onTake?.(task.id)}
            disabled={task.status !== 'available'}
            className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl transition-all ${
              task.status === 'available' 
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <CheckCircle size={18} />
            {task.status === 'available' ? 'Tag opgaven' : 'Allerede taget'}
          </button>
        )}
      </div>
    </div>
  );
};
