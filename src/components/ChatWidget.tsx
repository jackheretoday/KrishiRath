import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Bot } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'owner';
  time: string;
}

interface ChatWidgetProps {
  ownerName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ ownerName, isOpen, onClose }) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: `Hello! I'm interested in your equipment. Is it available for next Monday?`, sender: 'user', time: '10:00 AM' },
    { id: 2, text: `Namaste! Yes, it's available. You can book it through the app.`, sender: 'owner', time: '10:05 AM' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-80 md:w-96 bg-white rounded-2xl shadow-2xl border-2 border-primary/20 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-primary p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
            {ownerName[0]}
          </div>
          <div>
            <p className="font-bold text-sm">{ownerName}</p>
            <p className="text-[10px] text-white/80">{t('online_status')}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/10 h-8 w-8 p-0 ring-0 border-0">
          ✕
        </Button>
      </div>

      <div className="flex-1 p-4 space-y-4 max-h-80 overflow-y-auto bg-slate-50">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              m.sender === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-white text-slate-800 border rounded-bl-none shadow_sm'
            }`}>
              {m.text}
              <p className={`text-[9px] mt-1 ${m.sender === 'user' ? 'text-white/70' : 'text-slate-400'}`}>{m.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-white flex gap-2">
        <Input 
          placeholder={t('type_message')} 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="rounded-full bg-slate-100 border-none focus-visible:ring-1 focus-visible:ring-primary"
        />
        <Button size="icon" onClick={handleSend} className="rounded-full h-10 w-10 shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
