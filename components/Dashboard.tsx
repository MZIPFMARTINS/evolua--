import React, { useState } from 'react';
import { Task, GamificationState, UserProfile, Habit, Frequency } from '../types';
import { Check, Plus, Trash2, Flame, Trophy, Zap, Calendar, Repeat, X } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  habits: Habit[];
  gamification: GamificationState;
  onToggleTask: (id: string) => void;
  onAddTask: (title: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleHabit: (id: string) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'completedDates'>) => void;
  onDeleteHabit: (id: string) => void;
  user: UserProfile;
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const Dashboard: React.FC<DashboardProps> = ({ 
  tasks, 
  habits,
  gamification, 
  onToggleTask, 
  onAddTask,
  onDeleteTask,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  user
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: '',
    frequency: 'daily' as Frequency,
    customDays: [] as number[],
    xpReward: 30
  });

  const today = new Date().toISOString().split('T')[0];

  const handleAddHabit = () => {
    if (newHabit.title.trim()) {
      onAddHabit(newHabit);
      setNewHabit({ title: '', frequency: 'daily', customDays: [], xpReward: 30 });
      setIsAddingHabit(false);
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle);
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  const toggleDay = (day: number) => {
    setNewHabit(prev => ({
      ...prev,
      customDays: prev.customDays.includes(day)
        ? prev.customDays.filter(d => d !== day)
        : [...prev.customDays, day]
    }));
  };

  return (
    <div className="p-6 pb-24 space-y-8 max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Olá, {user.name}</h1>
          <p className="text-slate-400 text-sm">Pronto para evoluir?</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
             <div className="flex items-center text-warning font-bold">
                <Flame size={18} className="mr-1 fill-warning" />
                <span>{gamification.streak} dias</span>
             </div>
             <div className="text-xs text-slate-500 font-medium">Nvl. {gamification.level}</div>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center bg-surface rounded-full border-2 border-slate-700">
             <Trophy size={20} className="text-accent" />
          </div>
        </div>
      </header>

      {/* Habits Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Repeat size={18} className="text-accent" /> Hábitos Recorrentes
          </h2>
          <button 
            onClick={() => setIsAddingHabit(true)}
            className="text-accent text-sm font-medium hover:text-white transition-colors"
          >
            + Novo
          </button>
        </div>

        <div className="space-y-3">
          {habits.map(habit => {
            const isCompletedToday = habit.completedDates.includes(today);
            return (
              <div 
                key={habit.id} 
                className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-200 border border-transparent ${
                  isCompletedToday 
                  ? 'bg-primary/50 opacity-60' 
                  : 'bg-surface hover:border-slate-600 shadow-sm'
                }`}
              >
                <div 
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => onToggleHabit(habit.id)}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isCompletedToday 
                    ? 'bg-accent border-accent' 
                    : 'border-slate-500'
                  }`}>
                    {isCompletedToday && <Check size={14} className="text-primary font-bold" />}
                  </div>
                  <div>
                    <span className={`font-medium block ${isCompletedToday ? 'text-slate-500 line-through' : 'text-white'}`}>
                      {habit.title}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                      {habit.frequency === 'daily' ? 'Diário' : habit.frequency === 'weekly' ? 'Semanal' : 'Personalizado'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteHabit(habit.id)}
                  className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
          {habits.length === 0 && (
            <div className="text-center py-6 bg-surface/30 rounded-xl border border-dashed border-slate-700">
              <p className="text-slate-500 text-sm">Nenhum hábito recorrente.</p>
            </div>
          )}
        </div>
      </section>

      {/* One-off Tasks Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar size={18} className="text-purple-400" /> Tarefas Únicas
          </h2>
          <button 
            onClick={() => setIsAddingTask(true)}
            className="text-accent text-sm font-medium hover:text-white transition-colors"
          >
            + Nova
          </button>
        </div>

        {isAddingTask && (
          <div className="flex gap-2 mb-4 animate-slide-down">
            <input 
              type="text" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Ex: Comprar livros..."
              className="flex-1 bg-primary border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-accent outline-none"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <button 
              onClick={handleAddTask}
              className="bg-accent text-primary px-4 rounded-lg font-bold"
            >
              <Check size={20} />
            </button>
          </div>
        )}

        <div className="space-y-3">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-200 border border-transparent ${
                task.completed 
                ? 'bg-primary/50 opacity-60' 
                : 'bg-surface hover:border-slate-600 shadow-sm'
              }`}
            >
              <div 
                className="flex items-center gap-4 flex-1 cursor-pointer"
                onClick={() => onToggleTask(task.id)}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.completed 
                  ? 'bg-success border-success' 
                  : 'border-slate-500'
                }`}>
                  {task.completed && <Check size={14} className="text-white" />}
                </div>
                <span className={`font-medium ${task.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                  {task.title}
                </span>
              </div>
              <button 
                onClick={() => onDeleteTask(task.id)}
                className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-6 bg-surface/30 rounded-xl border border-dashed border-slate-700">
              <p className="text-slate-500 text-sm">Nenhuma tarefa única pendente.</p>
            </div>
          )}
        </div>
      </section>

      {/* Habit Creation Modal */}
      {isAddingHabit && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border-t sm:border border-slate-700 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Novo Hábito</h3>
              <button onClick={() => setIsAddingHabit(false)} className="p-2 hover:bg-slate-700 rounded-full">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Qual o hábito?</label>
                <input 
                  type="text" 
                  value={newHabit.title}
                  onChange={e => setNewHabit({...newHabit, title: e.target.value})}
                  placeholder="Ex: Meditação matinal"
                  className="w-full bg-primary border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-accent outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Frequência</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['daily', 'weekly', 'custom'] as Frequency[]).map(freq => (
                    <button
                      key={freq}
                      onClick={() => setNewHabit({...newHabit, frequency: freq})}
                      className={`py-2 px-1 rounded-lg text-xs font-bold border-2 transition-all ${
                        newHabit.frequency === freq 
                        ? 'bg-accent/10 border-accent text-accent' 
                        : 'bg-primary border-transparent text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      {freq === 'daily' ? 'Diário' : freq === 'weekly' ? 'Semanal' : 'Personalizado'}
                    </button>
                  ))}
                </div>
              </div>

              {newHabit.frequency === 'custom' && (
                <div className="animate-fade-in">
                  <label className="block text-slate-400 text-sm font-medium mb-2">Dias da Semana</label>
                  <div className="flex justify-between gap-1">
                    {DAYS_OF_WEEK.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleDay(idx)}
                        className={`w-10 h-10 rounded-full text-xs font-bold border-2 transition-all ${
                          newHabit.customDays.includes(idx)
                          ? 'bg-accent text-primary border-accent'
                          : 'bg-primary border-slate-700 text-slate-400'
                        }`}
                      >
                        {day[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={handleAddHabit}
                className="w-full bg-accent text-primary font-bold py-4 rounded-xl shadow-lg shadow-sky-500/20 active:scale-95 transition-transform"
              >
                Criar Hábito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};