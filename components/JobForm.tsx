
import React, { useMemo, useState } from 'react';
import { SnowTask } from '../types';
import { Snowflake, Info } from 'lucide-react';

interface JobFormProps {
  onSubmit: (task: Omit<SnowTask, 'id' | 'createdAt' | 'status'>) => void;
}

export const JobForm: React.FC<JobFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    area: 50,
    price: 150,
    wantsSalt: false,
    hasEquipment: true,
    description: '',
    ownerPassword: ''
  });

  const estimate = useMemo(() => {
    if (formData.area <= 0) return null;

    const baseMinutes = Math.ceil(formData.area / 8);
    const saltMinutes = formData.wantsSalt ? 10 : 0;
    const estimatedMinutes = Math.max(10, baseMinutes + saltMinutes);

    let proTip = 'Fjern sneen i baner, så overfladen bliver ensartet.';
    if (formData.wantsSalt && !formData.hasEquipment) {
      proTip = 'Husk at aftale hvem der har salt, hvis du ikke selv har.';
    } else if (formData.wantsSalt) {
      proTip = 'Brug salt sparsomt ved kanten af indkørslen for at spare tid.';
    } else if (!formData.hasEquipment) {
      proTip = 'Skriv om du kan låne udstyr, hvis du ikke selv har.';
    }

    return { estimatedMinutes, proTip };
  }, [formData.area, formData.wantsSalt, formData.hasEquipment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-blue-600 p-8 text-white">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <Snowflake className="animate-pulse" />
          Opret snerydningsopgave
        </h2>
        <p className="text-blue-100 mt-2 opacity-90">Fortæl naboerne hvad du har brug for hjælp til.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Dit Navn</label>
            <input
              required
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="F.eks. Jensen"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Telefonnummer</label>
            <input
              required
              type="tel"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Mobilnr."
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Adresse</label>
          <input
            required
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Vejnavn og nummer"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Areal (m²)</label>
            <input
              required
              type="number"
              min="1"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={formData.area}
              onChange={e => setFormData({ ...formData, area: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Pris (DKK)</label>
            <div className="relative">
              <input
                required
                type="number"
                min="50"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pl-12"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
              />
              <span className="absolute left-4 top-3.5 text-slate-400 font-bold">kr.</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={formData.wantsSalt}
              onChange={e => setFormData({ ...formData, wantsSalt: e.target.checked })}
            />
            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Vil have saltet</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={formData.hasEquipment}
              onChange={e => setFormData({ ...formData, hasEquipment: e.target.checked })}
            />
            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Har udstyr (skovl/salt)</span>
          </label>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Beskrivelse (valgfri)</label>
          <textarea
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-24 resize-none"
            placeholder="F.eks. 'Husk at rydde helt op til hoveddøren'"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Opgave-password</label>
          <input
            required
            type="password"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Vælg et password"
            value={formData.ownerPassword}
            onChange={e => setFormData({ ...formData, ownerPassword: e.target.value })}
          />
          <p className="text-xs text-slate-500">
            Bruges til at se kontaktinfo og fjerne “taget”-markering.
          </p>
        </div>

        {/* AI Insight Box */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-2">
            <Info size={16} />
            <span>Estimering</span>
          </div>
          {estimate ? (
            <div className="text-xs text-blue-700 space-y-2">
              <p>Forventet tid: <strong>{estimate.estimatedMinutes} min.</strong></p>
              <p>Pro tip: {estimate.proTip}</p>
              <p className="font-bold text-blue-900">M²-pris: {(formData.price / formData.area).toFixed(2)} kr/m²</p>
            </div>
          ) : (
            <p className="text-xs text-blue-600 italic">Indtast m² for at få et estimat...</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transform hover:-translate-y-1 transition-all active:scale-95"
        >
          Opret opgave
        </button>
      </form>
    </div>
  );
};
