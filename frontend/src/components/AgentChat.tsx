'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PollutionAlert } from '@eco-sentinel/shared';

interface Message {
    id: string;
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
}

interface AgentChatProps {
    selectedAlert: PollutionAlert | null;
    currentMetrics?: any; // Allow passing dynamic metrics
}

export default function AgentChat({ selectedAlert, currentMetrics }: AgentChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'agent',
            content: 'Hello. I am the Eco-Sentinel AI. Select an alert to begin analysis.',
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isTyping]);

    useEffect(() => {
        if (selectedAlert) {
            setIsOpen(true);
            // Only add the "locked onto" message if it's a new alert selection, 
            // but for now we'll keep it simple.
        }
    }, [selectedAlert?.id]);

    const addMessage = (role: 'user' | 'agent', content: string) => {
        const newMessage: Message = {
            id: Math.random().toString(36).substring(7),
            role,
            content,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const sendMessageToAgent = async (text: string) => {
        if (!selectedAlert) return;

        addMessage('user', text);
        setIsTyping(true);

        try {
            const context = {
                alert: selectedAlert,
                metrics: currentMetrics || {}
            };

            const response = await fetch('/api/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    contextData: context
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setIsTyping(false);
            addMessage('agent', data.response);

        } catch (error) {
            console.error('Agent Error:', error);
            setIsTyping(false);
            addMessage('agent', 'Error: Unable to establish uplink with Sentinel Core. Please check API configuration.');
        }
    };

    const handleAnalyze = () => {
        sendMessageToAgent('Analyze this alert situation. Provide key insights.');
    };

    const handleActionPlan = () => {
        sendMessageToAgent('Generate a tactical action plan for enforcement.');
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="bg-[#0b0e11] border border-white/10 rounded-xl shadow-2xl w-80 md:w-96 overflow-hidden pointer-events-auto mb-4"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div>
                                <span className="font-bold text-white text-sm">Sentinel AI Core</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="h-80 overflow-y-auto p-4 space-y-4 bg-black/20">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-lg p-3 text-sm whitespace-pre-wrap ${msg.role === 'user'
                                                ? 'bg-primary/20 text-white border border-primary/30'
                                                : 'bg-white/5 text-slate-300 border border-white/5'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Actions */}
                        <div className="p-3 border-t border-white/10 bg-white/5 grid grid-cols-2 gap-2">
                            <button
                                onClick={handleAnalyze}
                                disabled={!selectedAlert || isTyping}
                                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">analytics</span>
                                Analyze
                            </button>
                            <button
                                onClick={handleActionPlan}
                                disabled={!selectedAlert || isTyping}
                                className="px-3 py-2 bg-accent-green/10 hover:bg-accent-green/20 border border-accent-green/30 rounded-lg text-xs font-medium text-accent-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                                Action Plan
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-primary shadow-glow-primary flex items-center justify-center text-white pointer-events-auto relative group"
            >
                <span className="material-symbols-outlined text-2xl">smart_toy</span>
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-red rounded-full border-2 border-[#0b0e11]"></span>
                )}
            </motion.button>
        </div>
    );
}
