
import React, { useState, useEffect } from 'react';
import { CreateTaskPayload, SnowTask, ViewState } from './types';
import { JobForm } from './components/JobForm';
import { JobCard } from './components/JobCard';
import { Snowflake, LayoutGrid, PlusCircle, Search, History, Wind } from 'lucide-react';

const AUTH_STORAGE_KEY = 'sneryd_auth';
const ACCESS_PASSWORD = 'Risbjergkvarteret';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [tasks, setTasks] = useState<SnowTask[]>([]);
  const [myTasks, setMyTasks] = useState<SnowTask[]>([]);
  const [ownerPasswordQuery, setOwnerPasswordQuery] = useState<string>('');
  const [ownerPasswordInput, setOwnerPasswordInput] = useState<string>('');
  const [ownerPhoneQuery, setOwnerPhoneQuery] = useState<string>('');
  const [ownerPhoneInput, setOwnerPhoneInput] = useState<string>('');
  const [isAuthed, setIsAuthed] = useState<boolean>(() => localStorage.getItem(AUTH_STORAGE_KEY) === 'true');
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const fetchJson = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, options);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Serverfejl');
    }
    return response.json();
  };

  const loadTasks = async () => {
    const data = await fetchJson('/api/tasks');
    setTasks(data);
  };

  const loadMyTasks = async (phone: string, pass: string) => {
    const data = await fetchJson(`/api/tasks/mine?phone=${encodeURIComponent(phone)}&password=${encodeURIComponent(pass)}`);
    setMyTasks(data);
  };

  useEffect(() => {
    loadTasks().catch(() => {
      // ignore initial load errors
    });
  }, []);

  const handleCreateTask = async (newTaskData: CreateTaskPayload) => {
    try {
      await fetchJson('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskData)
      });
      setOwnerPhoneInput(newTaskData.phone);
      setOwnerPasswordInput(newTaskData.ownerPassword);
      await loadTasks();
      await loadMyTasks(newTaskData.phone, newTaskData.ownerPassword);
      setOwnerPhoneQuery(newTaskData.phone);
      setOwnerPasswordQuery(newTaskData.ownerPassword);
      setView('my-jobs');
    } catch (error) {
      alert('Kunne ikke oprette opgaven. Prøv igen.');
    }
  };

  const handleTakeTask = async (id: string) => {
    const phone = prompt("Indtast dit telefonnummer, så ejeren kan kontakte dig:");
    if (!phone || !phone.trim()) {
      return;
    }
    try {
      await fetchJson(`/api/tasks/${id}/take`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() })
      });
      await loadTasks();
      alert("Tak! Opgaven er markeret som taget. Ejeren kan nu se dit nummer.");
    } catch (error) {
      alert('Kunne ikke tage opgaven. Prøv igen.');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!ownerPhoneQuery || !ownerPasswordQuery) {
      alert('Indtast telefonnummer og password for at administrere opgaven.');
      return;
    }
    if (confirm("Er du sikker på at opgaven skal fjernes? (Markeres som færdig)")) {
      try {
        await fetchJson(`/api/tasks/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: ownerPhoneQuery, password: ownerPasswordQuery })
        });
        await loadTasks();
        await loadMyTasks(ownerPhoneQuery, ownerPasswordQuery);
      } catch (error) {
        alert('Kunne ikke fjerne opgaven. Tjek password.');
      }
    }
  };

  const handleClearTaken = async (id: string) => {
    if (!ownerPhoneQuery || !ownerPasswordQuery) {
      alert('Indtast telefonnummer og password for at administrere opgaven.');
      return;
    }
    try {
      await fetchJson(`/api/tasks/${id}/clear-taken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: ownerPhoneQuery, password: ownerPasswordQuery })
      });
      await loadTasks();
      await loadMyTasks(ownerPhoneQuery, ownerPasswordQuery);
    } catch (error) {
      alert('Kunne ikke fjerne “taget”. Tjek password.');
    }
  };

  const availableTasks = tasks.filter(t => t.status === 'available');
  const takenTasks = tasks.filter(t => t.status === 'taken');
  const handleFindMyTasks = async () => {
    if (!ownerPasswordInput.trim() || !ownerPhoneInput.trim()) return;
    const phone = ownerPhoneInput.trim();
    const pass = ownerPasswordInput.trim();
    try {
      await loadMyTasks(phone, pass);
      setOwnerPasswordQuery(pass);
      setOwnerPhoneQuery(phone);
      setView('my-jobs');
    } catch (error) {
      alert('Ingen opgaver fundet for det telefonnummer/password.');
    }
  };

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (password.trim() === ACCESS_PASSWORD) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setIsAuthed(true);
      setPassword('');
      setAuthError('');
      return;
    }
    setAuthError('Forkert adgangskode. Prøv igen.');
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen snow-bg flex items-center justify-center px-6">
        <div className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-xl rounded-3xl max-w-lg w-full p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Snowflake size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Adgang</p>
              <h1 className="text-2xl font-black text-slate-800">SneRyd i nabolaget</h1>
            </div>
          </div>
          <p className="text-slate-600 mb-6">
            Denne side er kun for Risbjergkvarteret. Indtast adgangskoden for at fortsætte.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Adgangskode</label>
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (authError) setAuthError('');
                }}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Skriv adgangskoden her"
                autoFocus
              />
              {authError && (
                <p className="text-sm text-red-600 font-semibold mt-2">{authError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-black px-6 py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              Gå ind
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen snow-bg pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setView('home')}
          >
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Snowflake size={24} />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">SneRyd</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setView('home')}
              className={`font-bold transition-colors ${view === 'home' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Forside
            </button>
            <button 
              onClick={() => setView('post-job')}
              className={`font-bold transition-colors ${view === 'post-job' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Få ryddet sne
            </button>
            <button 
              onClick={() => setView('browse-jobs')}
              className={`font-bold transition-colors ${view === 'browse-jobs' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Find opgaver
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10">
        {view === 'home' && (
          <div className="space-y-12">
            <section className="text-center max-w-2xl mx-auto py-12">
              <h1 className="text-5xl font-black text-slate-800 leading-tight mb-6">
                Sneen daler, men <span className="text-blue-600">arbejdet kalder</span>
              </h1>
              <p className="text-slate-600 text-lg mb-10 leading-relaxed">
                Nabohjælp til snerydning. Opret en opgave og lad friske unge fra kvarteret hjælpe dig, mens de tjener lidt ekstra.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setView('post-job')}
                  className="bg-blue-600 text-white font-black px-8 py-5 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-lg"
                >
                  <PlusCircle />
                  Få ryddet sne
                </button>
                <button 
                  onClick={() => setView('browse-jobs')}
                  className="bg-white text-slate-800 border border-slate-200 font-black px-8 py-5 rounded-2xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-lg"
                >
                  <Search />
                  Tjen penge nu
                </button>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <input
                  type="tel"
                  value={ownerPhoneInput}
                  onChange={(event) => setOwnerPhoneInput(event.target.value)}
                  className="w-full sm:w-64 rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dit telefonnummer"
                />
                <input
                  type="password"
                  value={ownerPasswordInput}
                  onChange={(event) => setOwnerPasswordInput(event.target.value)}
                  className="w-full sm:w-72 rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Password til dine opgaver"
                />
                <button
                  onClick={handleFindMyTasks}
                  className="bg-slate-900 text-white font-black px-6 py-3 rounded-xl shadow-sm hover:bg-slate-800 transition-all w-full sm:w-auto"
                >
                  Se mine opgaver
                </button>
              </div>
            </section>

            <section className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Tjen ekstra lommepenge', icon: <LayoutGrid className="text-blue-600" />, text: 'Perfekt til unge der vil ud i den friske luft og gøre en forskel i nabolaget.' },
                { title: 'Hurtig hjælp', icon: <Wind className="text-blue-600" />, text: 'Slip for besværet med store firmaer. Dine naboer er lige rundt om hjørnet.' },
                { title: 'Sikkert og nemt', icon: <History className="text-blue-600" />, text: 'Du bestemmer selv prisen og kontakten foregår direkte mellem jer.' }
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="bg-blue-50 w-12 h-12 flex items-center justify-center rounded-xl mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </section>
          </div>
        )}

        {view === 'post-job' && <JobForm onSubmit={handleCreateTask} />}

        {view === 'browse-jobs' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-800">Ledige opgaver</h2>
                <p className="text-slate-500">Der er lige nu {availableTasks.length} ledige og {takenTasks.length} tagne opgaver i dit område.</p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200 flex gap-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm">Nyeste først</button>
                <button className="text-slate-500 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-50">Højeste pris</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTasks.length > 0 ? (
                availableTasks.map(task => (
                  <JobCard key={task.id} task={task} onTake={handleTakeTask} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
                  <div className="bg-slate-50 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4">
                    <Search className="text-slate-300" size={32} />
                  </div>
                  <p className="text-slate-400 font-medium">Ingen ledige opgaver lige nu. Prøv igen senere!</p>
                </div>
              )}
            </div>

            {takenTasks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-800">Tagne opgaver</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {takenTasks.map(task => (
                    <JobCard key={task.id} task={task} onTake={handleTakeTask} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'my-jobs' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-black text-slate-800">Mine opgaver</h2>
              <p className="text-slate-500">Her kan du se og administrere de opgaver du selv har lagt ud.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row gap-3 md:items-center">
              <input
                type="tel"
                value={ownerPhoneInput}
                onChange={(event) => setOwnerPhoneInput(event.target.value)}
                className="w-full md:w-64 rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dit telefonnummer"
              />
              <input
                type="password"
                value={ownerPasswordInput}
                onChange={(event) => setOwnerPasswordInput(event.target.value)}
                className="w-full md:w-80 rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Skriv password for at finde dine opgaver"
              />
              <button
                onClick={handleFindMyTasks}
                className="bg-blue-600 text-white font-black px-6 py-3 rounded-xl shadow-sm hover:bg-blue-700 transition-all"
              >
                Find opgaver
              </button>
              {ownerPasswordQuery && (
                <button
                  onClick={() => {
                    setOwnerPasswordQuery('');
                    setOwnerPasswordInput('');
                    setOwnerPhoneQuery('');
                    setOwnerPhoneInput('');
                    setMyTasks([]);
                  }}
                  className="bg-slate-100 text-slate-700 font-bold px-6 py-3 rounded-xl hover:bg-slate-200 transition-all"
                >
                  Ryd filter
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTasks.length > 0 ? (
                myTasks.map(task => (
                  <JobCard
                    key={task.id}
                    task={task}
                    isOwner={true}
                    showTakenByPhone={true}
                    onDelete={handleDeleteTask}
                    onClearTaken={handleClearTaken}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
                  <p className="text-slate-400 font-medium mb-4">Du har ikke oprettet nogen opgaver endnu.</p>
                  <button 
                    onClick={() => setView('post-job')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
                  >
                    Opret din første opgave
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Navigation Mobile Overlay */}
      <nav className="fixed bottom-6 left-6 right-6 md:hidden z-50">
        <div className="bg-slate-900/90 backdrop-blur-xl text-white p-4 rounded-3xl shadow-2xl flex justify-around items-center">
          <button 
            onClick={() => setView('home')}
            className={`flex flex-col items-center gap-1 ${view === 'home' ? 'text-blue-400' : 'text-slate-400'}`}
          >
            <LayoutGrid size={20} />
            <span className="text-[10px] font-bold">Hjem</span>
          </button>
          <button 
            onClick={() => setView('browse-jobs')}
            className={`flex flex-col items-center gap-1 ${view === 'browse-jobs' ? 'text-blue-400' : 'text-slate-400'}`}
          >
            <Search size={20} />
            <span className="text-[10px] font-bold">Find</span>
          </button>
          <div className="relative -top-10">
            <button 
              onClick={() => setView('post-job')}
              className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg shadow-blue-500/50 flex items-center justify-center transform hover:scale-110 active:scale-90 transition-all border-4 border-slate-900"
            >
              <PlusCircle size={28} />
            </button>
          </div>
          <button 
            onClick={() => setView('my-jobs')}
            className={`flex flex-col items-center gap-1 ${view === 'my-jobs' ? 'text-blue-400' : 'text-slate-400'}`}
          >
            <History size={20} />
            <span className="text-[10px] font-bold">Mine</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
