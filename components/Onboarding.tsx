import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Button } from './Button';
import { ArrowRight, CheckCircle, Clock, Target, User, Loader2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => Promise<void>;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [focus, setFocus] = useState<UserProfile['focusArea']>('general');
  const [discipline, setDiscipline] = useState(5);
  const [time, setTime] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Analisando perfil...');

  // Cycle loading messages to keep user engaged
  useEffect(() => {
    if (!isLoading) return;
    const texts = [
      "Conectando à IA...",
      "Analisando suas metas...",
      "Desenhando estratégia...",
      "Personalizando rotina...",
      "Finalizando..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      try {
        await onComplete({
          name,
          focusArea: focus,
          disciplineLevel: discipline,
          availableTime: time,
          isOnboarded: true,
          isPremium: false
        });
      } catch (error) {
        console.error("Erro no onboarding:", error);
        setIsLoading(false); // Release lock if error allows retry
      }
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="bg-accent/10 p-4 rounded-full">
                <User size={48} className="text-accent" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center">Como devemos te chamar?</h2>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome ou apelido"
              className="w-full bg-surface border border-slate-700 text-white p-4 rounded-xl focus:border-accent focus:outline-none text-lg"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="bg-purple-500/10 p-4 rounded-full">
                <Target size={48} className="text-purple-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center">Qual seu foco principal?</h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'career', label: 'Carreira & Trabalho', emoji: '💼' },
                { id: 'studies', label: 'Estudos & Aprendizado', emoji: '📚' },
                { id: 'health', label: 'Saúde & Bem-estar', emoji: '💪' },
                { id: 'finance', label: 'Independência Financeira', emoji: '💰' },
                { id: 'general', label: 'Disciplina Geral', emoji: '🧘' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFocus(opt.id as any)}
                  className={`p-4 rounded-xl text-left font-medium transition-all ${
                    focus === opt.id 
                    ? 'bg-accent text-primary' 
                    : 'bg-surface text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="mr-3">{opt.emoji}</span> {opt.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="bg-green-500/10 p-4 rounded-full">
                <CheckCircle size={48} className="text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center">Nível de autodisciplina atual?</h2>
            <div className="space-y-4">
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={discipline}
                onChange={(e) => setDiscipline(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-slate-400 text-sm font-medium">
                <span>Sou procastinador</span>
                <span className="text-accent text-lg font-bold">{discipline}</span>
                <span>Sou uma máquina</span>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="bg-orange-500/10 p-4 rounded-full">
                <Clock size={48} className="text-orange-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center">Tempo disponível por dia?</h2>
            <p className="text-center text-slate-400 text-sm">Para hábitos focados na sua evolução.</p>
            <div className="grid grid-cols-2 gap-3">
              {[15, 30, 60, 90].map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`p-4 rounded-xl font-bold transition-all ${
                    time === t 
                    ? 'bg-accent text-primary border-2 border-accent' 
                    : 'bg-surface text-slate-300 border-2 border-transparent hover:border-slate-600'
                  }`}
                >
                  {t} min
                </button>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center space-x-2">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i <= step ? 'w-8 bg-accent' : 'w-2 bg-slate-700'}`} />
          ))}
        </div>
        
        {renderStep()}

        <div className="mt-8">
          <Button 
            fullWidth 
            onClick={handleNext}
            disabled={(step === 1 && !name) || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2 animate-pulse">
                <Loader2 className="animate-spin" size={20} />
                {loadingText}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {step === 4 ? 'Criar Plano Personalizado' : 'Continuar'} <ArrowRight size={18} />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};