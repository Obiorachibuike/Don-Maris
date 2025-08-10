
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { chatWithProductAI } from '@/app/actions';
import { ScrollArea } from './ui/scroll-area';

type ChatMessage = {
    role: 'user' | 'model';
    content: string;
};

type FloatingChatProps = {
    productId: string;
    productName: string;
};

export function FloatingChat({ productId, productName }: FloatingChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const initialMessage: ChatMessage = {
        role: 'model',
        content: `Hi there! I'm your AI assistant. How can I help you with the ${productName}?`,
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([initialMessage]);
        }
    }, [isOpen, messages.length, productName]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const chatHistoryForAI = [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
        }));
        
        const result = await chatWithProductAI({
            productId,
            question: input,
            chatHistory: chatHistoryForAI,
        });

        setIsLoading(false);

        if (result.success && result.response) {
            const modelMessage: ChatMessage = { role: 'model', content: result.response };
            setMessages(prev => [...prev, modelMessage]);
        } else {
            const errorMessage: ChatMessage = { role: 'model', content: result.error || 'Sorry, something went wrong.' };
            setMessages(prev => [...prev, errorMessage]);
        }
    };
    
    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.8 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="w-[calc(100vw-3rem)] max-w-sm"
                    >
                        <Card className="flex flex-col h-[60vh] shadow-2xl">
                            <CardHeader className="flex flex-row items-center justify-between border-b">
                                <div className='flex items-center gap-2'>
                                    <Bot className="h-6 w-6 text-primary" />
                                    <CardTitle className="text-lg font-headline">AI Assistant</CardTitle>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className='h-7 w-7'>
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-4 flex-1 overflow-hidden">
                                <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                                    <div className="space-y-4">
                                    {messages.map((msg, index) => (
                                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                            {msg.role === 'model' && <AvatarIcon icon={Bot} />}
                                            <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                            }`}
                                            // Using dangerouslySetInnerHTML to render markdown
                                            dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />')}}
                                            />
                                            {msg.role === 'user' && <AvatarIcon icon={User} />}
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex items-start gap-3">
                                            <AvatarIcon icon={Bot} />
                                            <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                            </div>
                                        </div>
                                    )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="p-4 border-t">
                                <form onSubmit={handleSend} className="flex w-full items-center gap-2">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask a question..."
                                        disabled={isLoading}
                                    />
                                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
                </AnimatePresence>
                <motion.div
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     transition={{ delay: isOpen ? 0 : 0.5, duration: 0.3, type: "spring", stiffness: 260, damping: 20 }}
                >
                    <Button
                        size="lg"
                        className="rounded-full shadow-lg w-16 h-16"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Open Chat"
                    >
                        {isOpen ? <X className="h-7 w-7" /> : <MessageSquare className="h-7 w-7" />}
                    </Button>
                </motion.div>
            </div>
        </>
    );
}

const AvatarIcon = ({ icon: Icon }: { icon: React.ElementType }) => (
    <div className="w-8 h-8 rounded-full bg-card border flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-foreground" />
    </div>
);
