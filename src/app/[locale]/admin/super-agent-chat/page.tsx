
'use client';

import { useTranslations } from 'next-intl';
import { Bot, MessageSquare } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';

// Placeholder para o fluxo de chat do superagente
// import { superAgentAnalyticsChat, SuperAgentChatInput, SuperAgentChatOutput } from '@/ai/flows/super-agent-analytics-chat-flow';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export default function SuperAgentChatPage() {
  const t = useTranslations('SuperAgentChatPage');
  // const [messages, setMessages] = useState<ChatMessage[]>([]);
  // const [inputValue, setInputValue] = useState('');
  // const [isLoading, setIsLoading] = useState(false);

  // Simulação inicial de mensagens
   const messages: ChatMessage[] = [
    { id: '1', sender: 'agent', text: t('initialAgentMessage'), timestamp: new Date() },
   ];
   const isLoading = false;
   const inputValue = '';


  // const handleSendMessage = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!inputValue.trim() || isLoading) return;

  //   const userMessage: ChatMessage = {
  //     id: Date.now().toString(),
  //     sender: 'user',
  //     text: inputValue,
  //     timestamp: new Date(),
  //   };
  //   setMessages((prev) => [...prev, userMessage]);
  //   setInputValue('');
  //   setIsLoading(true);

  //   try {
  //     // Chamada real ao fluxo Genkit (descomentar quando o fluxo estiver pronto)
  //     // const agentResponse: SuperAgentChatOutput = await superAgentAnalyticsChat({ userInput: userMessage.text });
  //     // const agentMessageText = agentResponse.responseText || t('agentErrorResponse');

  //     // Simulação de resposta do agente por enquanto
  //     await new Promise(resolve => setTimeout(resolve, 1500));
  //     const agentMessageText = `${t('agentResponsePrefix')} "${userMessage.text}" - ${t('featureInProgress')}`;


  //     const agentMessage: ChatMessage = {
  //       id: (Date.now() + 1).toString(),
  //       sender: 'agent',
  //       text: agentMessageText,
  //       timestamp: new Date(),
  //     };
  //     setMessages((prev) => [...prev, agentMessage]);
  //   } catch (error) {
  //     console.error("Error interacting with Super Agent:", error);
  //     const errorMessage: ChatMessage = {
  //       id: (Date.now() + 1).toString(),
  //       sender: 'agent',
  //       text: t('agentErrorResponse'),
  //       timestamp: new Date(),
  //     };
  //     setMessages((prev) => [...prev, errorMessage]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
            <ScrollArea className="flex-grow p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70'}`}>
                      {msg.timestamp.toLocaleTimeString()}
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
              // onSubmit={handleSendMessage} 
              className="border-t p-4 flex items-center gap-2"
            >
              <Input
                type="text"
                placeholder={t('inputPlaceholder')}
                value={inputValue}
                // onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading || true} // Desabilitado permanentemente por enquanto
                className="flex-grow"
              />
              <Button type="submit" disabled={isLoading || true} className="bg-accent hover:bg-accent/90">
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

    