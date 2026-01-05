import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import { sendChatMessage } from '../services/geminiService';

interface AICoachProps {
  user: UserProfile;
}

export const AICoach: React.FC<AICoachProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Olá ${user.name}! Sou o Coach Evolua+. Estou analisando seu perfil de ${user.focusArea}. Como posso te ajudar a evoluir hoje?`,
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const responseText = await sendChatMessage(messages, inputValue, user);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-lg mx-auto bg-primary">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-primary/95 backdrop-blur sticky top-0 z-10 flex items-center gap-3">
        <div className="bg-gradient-to-tr from-accent to-blue-600 p-2 rounded-lg">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-white">IA Coach</h2>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
              ? 'bg-accent text-primary rounded-tr-none' 
              : 'bg-surface text-slate-200 rounded-tl-none border border-slate-700'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface p-4 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-2">
              <Sparkles size={16} className="text-accent animate-spin" />
              <span className="text-slate-400 text-xs">Pensando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-surface">
        <div className="flex items-center gap-2 bg-primary rounded-xl px-4 py-2 border border-slate-700 focus-within:border-accent transition-colors">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte sobre hábitos, finanças..."
            className="flex-1 bg-transparent text-white outline-none placeholder:text-slate-500 py-2"
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-accent rounded-lg text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-300 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};