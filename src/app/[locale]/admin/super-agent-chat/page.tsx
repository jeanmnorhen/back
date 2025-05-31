
'use client';

import { useTranslations } from 'next-intl';
import { Bot, MessageSquare } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect, useRef } from 'react';

import { superAgentAnalyticsChat, type SuperAgentChatInput, type SuperAgentChatOutput } from '@/ai/flows/super-agent-analytics-chat-flow';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export default function SuperAgentChatPage() {
  const t = useTranslations('SuperAgentChatPage');
  const initialAgentMessageText = t('initialAgentMessage');

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'initial-agent-message', sender: 'agent', text: initialAgentMessageText, timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const agentResponse: SuperAgentChatOutput = await superAgentAnalyticsChat({ userInput: currentInput });
      const agentMessageText = agentResponse.responseText || t('agentErrorResponse');

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: agentMessageText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error("Error interacting with Super Agent:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: t('agentErrorResponse'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 selection:bg-primary/20">
      <header className="mb-10 text-center w-full max-w-4xl">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Bot className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold sm:text-5xl tracking-tight bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
            {t('title')}
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          {t('description')}
        </p>
        <div className="mt-6 flex justify-center">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="w-full max-w-2xl">
        <Card className="shadow-lg h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquare className="w-6 h-6 text-primary" />
              {t('chatWindowTitle')}
            </CardTitle>
            <CardDescription>{t('chatWindowDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-0">
            <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
               {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] p-3 rounded-lg bg-muted text-muted-foreground animate-pulse">
                    <p className="text-sm">{t('agentTyping')}</p>
                  </div>
                </div>
              )}
            </ScrollArea>
            <form 
              onSubmit={handleSendMessage} 
              className="border-t p-4 flex items-center gap-2"
            >
              <Input
                type="text"
                placeholder={t('inputPlaceholder')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-grow"
                autoFocus
              />
              <Button type="submit" disabled={isLoading || !inputValue.trim()} className="bg-accent hover:bg-accent/90">
                {isLoading ? t('sendingButton') : t('sendButton')}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground mt-4">
            {t('featureInProgress')}
        </p>
      </main>
       <footer className="mt-12 py-6 text-center text-sm text-muted-foreground border-t w-full max-w-4xl">
        <p>{t('footerText', {year: new Date().getFullYear()})}</p>
      </footer>
    </div>
  );
}
