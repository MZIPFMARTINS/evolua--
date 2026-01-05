import React, { useState } from 'react';
import { Transaction } from '../types';
import { ArrowUp, ArrowDown, Wallet, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface FinanceProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

export const Finance: React.FC<FinanceProps> = ({ isPremium, onUpgrade }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', amount: 3500, description: 'Salário', type: 'income', date: '2023-10-01' },
    { id: '2', amount: 150, description: 'Supermercado', type: 'expense', date: '2023-10-05' },
    { id: '3', amount: 80, description: 'Netflix/Spotify', type: 'expense', date: '2023-10-10' },
  ]);

  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleAdd = () => {
    if (!newAmount || !newDesc) return;
    const t: Transaction = {
      id: Date.now().toString(),
      amount: parseFloat(newAmount),
      description: newDesc,
      type: newType,
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions([t, ...transactions]);
    setNewAmount('');
    setNewDesc('');
  };

  // Mock data for chart
  const data = [
    { name: 'W1', value: 2000 },
    { name: 'W2', value: 2500 },
    { name: 'W3', value: 2300 },
    { name: 'W4', value: 3200 },
  ];

  return (
    <div className="p-6 pb-24 space-y-6 max-w-lg mx-auto animate-fade-in">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Minhas Finanças</h1>
        <div className="bg-surface p-2 rounded-lg border border-slate-700">
          <Wallet className="text-accent" size={20} />
        </div>
      </header>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700">
        <span className="text-slate-400 text-sm">Saldo Atual</span>
        <div className="text-3xl font-bold text-white mt-1 mb-4">
          R$ {balance.toFixed(2)}
        </div>
        <div className="flex gap-4">
          <div className="flex-1 bg-primary/30 rounded-xl p-3 flex items-center gap-3">
            <div className="bg-green-500/20 p-2 rounded-full"><ArrowUp size={16} className="text-green-500" /></div>
            <div>
              <div className="text-xs text-slate-400">Entradas</div>
              <div className="font-semibold text-green-400">R$ {totalIncome}</div>
            </div>
          </div>
          <div className="flex-1 bg-primary/30 rounded-xl p-3 flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-full"><ArrowDown size={16} className="text-red-500" /></div>
            <div>
              <div className="text-xs text-slate-400">Saídas</div>
              <div className="font-semibold text-red-400">R$ {totalExpense}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart - Locked for Free users */}
      <div className="bg-surface rounded-2xl p-4 border border-slate-700 relative overflow-hidden">
        <h3 className="text-slate-300 font-medium mb-4">Fluxo de Caixa (Mensal)</h3>
        <div className="h-40 w-full opacity-30 blur-sm">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={data}>
               <Area type="monotone" dataKey="value" stroke="#38BDF8" fill="#38BDF8" />
             </AreaChart>
           </ResponsiveContainer>
        </div>
        
        {!isPremium && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px] z-10">
            <Lock className="text-warning mb-2" size={32} />
            <p className="text-white font-bold">Análise Avançada</p>
            <p className="text-slate-300 text-xs mb-3">Disponível no Premium</p>
            <button onClick={onUpgrade} className="bg-warning text-black text-xs font-bold px-4 py-2 rounded-full">
              Desbloquear
            </button>
          </div>
        )}
      </div>

      {/* Quick Add */}
      <div className="bg-surface p-4 rounded-xl border border-slate-700">
        <h3 className="text-white text-sm font-medium mb-3">Adicionar Transação</h3>
        <div className="flex flex-col gap-3">
          <input 
            placeholder="Descrição (ex: Almoço)" 
            className="bg-primary border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-accent"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
          />
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Valor" 
              className="flex-1 bg-primary border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-accent"
              value={newAmount}
              onChange={e => setNewAmount(e.target.value)}
            />
            <select 
              className="bg-primary border border-slate-700 rounded-lg p-3 text-white text-sm outline-none"
              value={newType}
              onChange={e => setNewType(e.target.value as any)}
            >
              <option value="expense">Saída</option>
              <option value="income">Entrada</option>
            </select>
          </div>
          <button onClick={handleAdd} className="bg-accent text-primary font-bold py-3 rounded-lg mt-1 hover:bg-sky-300">
            Salvar
          </button>
        </div>
      </div>

      {/* History */}
      <div className="space-y-3">
        <h3 className="text-slate-400 text-sm font-medium">Histórico Recente</h3>
        {transactions.map(t => (
          <div key={t.id} className="flex justify-between items-center bg-surface p-3 rounded-xl border border-slate-800">
            <span className="text-slate-200">{t.description}</span>
            <span className={`font-mono font-medium ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
              {t.type === 'income' ? '+' : '-'} R$ {t.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};