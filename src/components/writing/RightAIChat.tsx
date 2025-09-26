'use client';

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface RightAIChatProps {
  novelContext?: {
    title: string;
    content: string;
    genre?: string;
  };
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export default function RightAIChat({ novelContext, isMinimized, onToggleMinimize }: RightAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI writing assistant. I can help you with plot development, character creation, dialogue, and more. What would you like to work on today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response (we'll replace this with actual OpenAI API call later)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you're asking about "${input}". This is a simulated response. Once we integrate the OpenAI API, I'll be able to provide real writing assistance based on your novel's context and your specific questions.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 1000);
  };

  const quickPrompts = [
    "Help me develop this character",
    "Suggest plot twists",
    "Improve this dialogue",
    "Check for consistency",
    "Generate ideas for the next chapter"
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  if (isMinimized) {
    return (
      <div className="h-full w-full bg-slate-800 border-l border-slate-700 flex flex-col">
        {/* Minimized Header with Toggle Button */}
        <div className="p-2 border-b border-slate-700 flex items-center justify-center">
          <button
            onClick={onToggleMinimize}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Expand AI Assistant Panel"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        </div>
        
        {/* Minimized Content - Just AI icon */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <SparklesIcon className="h-8 w-8 text-purple-400" />
            <span className="text-xs text-slate-400 text-center">AI</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-800 border-l border-slate-700 flex flex-col">
      {/* Header with Toggle Button */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleMinimize}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Minimize Panel"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          <SparklesIcon className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
        </div>
        {novelContext && (
          <div className="mt-2 text-sm text-slate-400">
            Context: {novelContext.title}
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700">
        <h4 className="text-sm font-medium text-slate-400 mb-2">Quick Prompts</h4>
        <div className="space-y-2">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleQuickPrompt(prompt)}
              className="w-full text-left text-sm text-slate-300 hover:text-white hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages - Flexible area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-200'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-slate-200 px-3 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-slate-700">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your writing..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
