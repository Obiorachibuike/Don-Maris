
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Send, Bot, User, Loader2, MessageSquare, X, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { chatWithProductAI } from '@/app/actions';
import { ScrollArea } from './ui/scroll-area';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';


type ChatMessage = {
    role: 'user' | 'model';
    content: string;
};

type ChatProps = {
    productId?: string;
    productName?: string;
    className?: string;
};

export function ProductChat({ productId, productName, className }: ChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const initializeChat = useCallback(() => {
        const initialMessage: ChatMessage = {
            role: 'model',
            content: productName
                ? `Hi there! I'm your AI assistant. How can I help you with the ${productName}?`
                : `Hi there! I'm your AI assistant for Don Maris Accessories. Ask me anything about our products, and I'll help you find what you need.`,
        };
        setMessages([initialMessage]);
    }, [productName]);

    useEffect(() => {
        // Initialize chat when the component mounts or when the product changes.
        initializeChat();
    }, [initializeChat]);
    
    useEffect(() => {
        // Auto-scroll to the bottom of the chat messages.
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
            chatHistory: chatHistoryForAI.slice(1), // Exclude the initial greeting
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
        <div className={cn("fixed bottom-4 right-4 z-50", className)}>
            <AnimatePresence>
                {isOpen && (
                     <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="w-[calc(100vw-2rem)] sm:w-96"
                    >
                        <Card className="flex flex-col h-[60vh] shadow-2xl rounded-lg overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between border-b bg-card p-4">
                                <div className='flex items-center gap-2'>
                                    <Bot className="h-6 w-6 text-primary" />
                                    <CardTitle className="text-lg font-headline">AI Product Assistant</CardTitle>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                                    <ChevronDown className="h-5 w-5" />
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
                            <CardFooter className="p-4 border-t bg-card">
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
                transition={{ delay: 0.3, duration: 0.2, ease: "easeOut" }}
            >
                <Button
                    size="lg"
                    className="rounded-full shadow-lg w-16 h-16 mt-4 bg-primary hover:bg-primary/90"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle AI Chat"
                >
                    <AnimatePresence>
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0}} animate={{ rotate: 0, opacity: 1}} exit={{ rotate: 90, opacity: 0}}>
                            <X className="h-7 w-7" />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0}} animate={{ rotate: 0, opacity: 1}} exit={{ rotate: -90, opacity: 0}}>
                             <MessageSquare className="h-7 w-7" />
                        </motion.div>
                    )}
                    </AnimatePresence>
                </Button>
            </motion.div>
        </div>
    );
}

const AvatarIcon = ({ icon: Icon }: { icon: React.ElementType }) => (
    <div className="w-8 h-8 rounded-full bg-card border flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-foreground" />
    </div>
);
