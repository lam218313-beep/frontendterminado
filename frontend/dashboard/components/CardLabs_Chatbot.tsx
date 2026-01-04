import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const CardLabs_Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hola, soy tu Analista Virtual. ¿En qué puedo ayudarte a interpretar los datos de hoy?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI Response
    setTimeout(() => {
      const responses = [
        "Basado en la matriz de oportunidades, te sugiero priorizar el 'Modo Oscuro' ya que es un Quick Win.",
        "El sentimiento negativo ha aumentado un 3% esta semana, principalmente debido a los tiempos de espera.",
        "¡Excelente pregunta! La correlación entre la 'Sinceridad' de la marca y la lealtad del cliente es alta (0.85).",
        "Analizando los datos... parece que @TechGuru99 es tu influenciador más central en este momento."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newBotMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 h-[500px] flex flex-col overflow-hidden relative">
      
      {/* --- Header --- */}
      <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-50 rounded-xl text-primary-500 border border-primary-100">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight flex items-center gap-2">
              Lab AI <Sparkles size={14} className="text-primary-400 fill-primary-400 animate-pulse" />
            </h3>
            <p className="text-xs text-gray-400 font-medium">Asistente de Inteligencia</p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([{id: '1', text: "Chat reiniciado. ¿En qué puedo ayudarte?", sender: 'bot', timestamp: new Date()}])}
          className="text-gray-300 hover:text-primary-500 transition-colors"
        >
            <RefreshCw size={16} />
        </button>
      </div>

      {/* --- Chat Area --- */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 custom-scrollbar">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white shadow-sm ${
                msg.sender === 'user' ? 'bg-gray-800 text-white' : 'bg-white text-primary-500'
              }`}>
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={16} />}
              </div>

              {/* Bubble */}
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-gray-800 text-white rounded-tr-sm' 
                  : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex w-full justify-start">
             <div className="flex max-w-[85%] gap-2 flex-row">
                <div className="w-8 h-8 rounded-full bg-white text-primary-500 flex items-center justify-center shrink-0 border border-white shadow-sm">
                    <Bot size={16} />
                </div>
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"></div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- Input Area --- */}
      <div className="p-4 bg-white border-t border-gray-50">
        <form 
          onSubmit={handleSendMessage}
          className="relative flex items-center gap-2"
        >
          <input 
            type="text" 
            placeholder="Pregunta sobre tendencias..." 
            className="w-full bg-gray-50 text-gray-700 placeholder-gray-400 px-5 py-3.5 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary-100 border border-transparent focus:border-primary-200 transition-all"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:hover:bg-primary-500 transition-all shadow-md shadow-primary-500/20"
          >
            <Send size={16} className={inputValue.trim() ? "translate-x-0.5" : ""} />
          </button>
        </form>
      </div>

    </div>
  );
};