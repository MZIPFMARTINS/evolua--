import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { AICoach } from './components/AICoach';
import { Finance } from './components/Finance';
import { ViewState, UserProfile, Task, GamificationState, Habit } from './types';
import { Home, MessageSquare, PieChart, User as UserIcon, Lock, Zap } from 'lucide-react';
import { generatePlan } from './services/geminiService';

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<ViewState>('onboarding');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [gamification, setGamification] = useState<GamificationState>({
    xp: 0,
    level: 1,
    streak: 0,
    lastLoginDate: ''
  });
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // --- Effects ---
  useEffect(() => {
    // Check local storage for existing user
    const savedUser = localStorage.getItem('evolua_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      
      const savedTasks = localStorage.getItem('evolua_tasks');
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      
      const savedHabits = localStorage.getItem('evolua_habits');
      if (savedHabits) setHabits(JSON.parse(savedHabits));
      
      const savedGame = localStorage.getItem('evolua_game');
      if (savedGame) setGamification(JSON.parse(savedGame));
      
      setView('dashboard');
    }
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('evolua_user', JSON.stringify(user));
    localStorage.setItem('evolua_tasks', JSON.stringify(tasks));
    localStorage.setItem('evolua_habits', JSON.stringify(habits));
    localStorage.setItem('evolua_game', JSON.stringify(gamification));
  }, [user, tasks, habits, gamification]);

  // --- Handlers ---

  const handleOnboardingComplete = async (profile: UserProfile) => {
    setUser(profile);
    
    // Generate initial AI tasks
    try {
      const planJson = await generatePlan(profile);
      const planTitles = JSON.parse(planJson);
      
      const newTasks: Task[] = planTitles.map((title: string, index: number) => ({
        id: `init-${index}`,
        title,
        completed: false,
        xpReward: 50,
        category: 'habit'
      }));
      setTasks(newTasks);
    } catch (e) {
      // Fallback
      setTasks([{ id: '1', title: 'Beber Água', completed: false, xpReward: 10, category: 'habit' }]);
    }
    
    setView('dashboard');
  };

  const handleToggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const isCompleting = !task.completed;
    
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: isCompleting } : t
    ));

    if (isCompleting) {
      setGamification(prev => {
        const newXp = prev.xp + task.xpReward;
        const newLevel = Math.floor(newXp / 1000) + 1;
        return { ...prev, xp: newXp, level: newLevel };
      });
    }
  };

  const handleAddTask = (title: string) => {
    setTasks(prev => [{
      id: Date.now().toString(),
      title,
      completed: false,
      xpReward: 20,
      category: 'todo'
    }, ...prev]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Habit Handlers
  const handleToggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const isCompletedToday = habit.completedDates.includes(today);
    
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const newDates = isCompletedToday 
          ? h.completedDates.filter(d => d !== today)
          : [...h.completedDates, today];
        return { ...h, completedDates: newDates };
      }
      return h;
    }));

    if (!isCompletedToday) {
      setGamification(prev => {
        const newXp = prev.xp + habit.xpReward;
        const newLevel = Math.floor(newXp / 1000) + 1;
        return { ...prev, xp: newXp, level: newLevel };
      });
    }
  };

  const handleAddHabit = (habitData: Omit<Habit, 'id' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      completedDates: []
    };
    setHabits(prev => [newHabit, ...prev]);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const NavItem = ({ viewName, icon: Icon, label }: { viewName: ViewState, icon: any, label: string }) => (
    <button 
      onClick={() => setView(viewName)}
      className={`flex flex-col items-center justify-center w-full py-3 transition-colors ${
        view === viewName ? 'text-accent' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <Icon size={24} className={view === viewName ? 'fill-accent/20' : ''} />
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );

  // --- Render ---

  if (!user || view === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="bg-primary min-h-screen text-slate-100 flex flex-col font-sans">
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {view === 'dashboard' && (
          <Dashboard 
            tasks={tasks} 
            habits={habits}
            gamification={gamification} 
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onToggleHabit={handleToggleHabit}
            onAddHabit={handleAddHabit}
            onDeleteHabit={handleDeleteHabit}
            user={user}
          />
        )}
        {view === 'coach' && <AICoach user={user} />}
        {view === 'finance' && (
          <Finance 
            isPremium={user.isPremium} 
            onUpgrade={() => setShowPremiumModal(true)} 
          />
        )}
        {view === 'profile' && (
          <div className="p-6 text-center animate-fade-in">
             <div className="w-24 h-24 bg-surface rounded-full mx-auto mb-4 border-4 border-accent flex items-center justify-center">
                <span className="text-3xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
             </div>
             <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
             <p className="text-slate-400 mb-6">Nível {gamification.level} • Mestre da Evolução</p>
             
             {!user.isPremium && (
               <button 
                 onClick={() => setShowPremiumModal(true)}
                 className="w-full bg-gradient-to-r from-warning to-orange-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 mb-6"
               >
                 <Zap className="fill-black" size={20} />
                 Seja Premium
               </button>
             )}

             <div className="bg-surface rounded-xl p-4 text-left space-y-4">
                <div className="flex justify-between border-b border-slate-700 pb-3">
                   <span className="text-slate-400">XP Total</span>
                   <span className="font-mono text-accent">{gamification.xp}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-3">
                   <span className="text-slate-400">Foco</span>
                   <span className="text-white capitalize">{user.focusArea}</span>
                </div>
                <button 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="text-red-400 text-sm font-medium w-full text-left pt-2"
                >
                  Sair / Resetar Dados
                </button>
             </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-slate-700 pb-safe z-50">
        <div className="flex justify-around max-w-lg mx-auto">
          <NavItem viewName="dashboard" icon={Home} label="Início" />
          <NavItem viewName="coach" icon={MessageSquare} label="Coach" />
          <NavItem viewName="finance" icon={PieChart} label="Finanças" />
          <NavItem viewName="profile" icon={UserIcon} label="Perfil" />
        </div>
      </nav>

      {/* Premium Modal Overlay */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface w-full max-w-sm rounded-3xl p-6 relative border border-slate-600">
             <button 
               onClick={() => setShowPremiumModal(false)}
               className="absolute top-4 right-4 text-slate-400 hover:text-white"
             >
               ✕
             </button>
             <div className="text-center mb-6">
               <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-warning/30">
                 <Zap size={32} className="text-black fill-black" />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">Evolua+ Pro</h2>
               <p className="text-slate-400 text-sm">Desbloqueie todo seu potencial.</p>
             </div>
             
             <ul className="space-y-3 mb-8">
               {['IA Coach Ilimitado', 'Gráficos Financeiros', 'Temas Exclusivos', 'Backup na Nuvem'].map((item, i) => (
                 <li key={i} className="flex items-center gap-3 text-slate-200">
                   <div className="bg-success/20 p-1 rounded-full"><div className="w-2 h-2 bg-success rounded-full"></div></div>
                   {item}
                 </li>
               ))}
             </ul>

             <button 
               onClick={() => {
                 setUser({...user, isPremium: true});
                 setShowPremiumModal(false);
               }}
               className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors"
             >
               Testar Grátis por 7 dias
             </button>
             <p className="text-center text-xs text-slate-500 mt-4">Depois R$ 19,90/mês. Cancele quando quiser.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;