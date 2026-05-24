"use client";
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Sparkles, Link as LinkIcon } from 'lucide-react';
import { renderMarkdownAndMath } from '@/utils/renderMathSSR';
import MathPreview from './MathPreview';
import api from "@/api";

import styles from './AITutor.module.css';

const AITutor = ({ questionId, question }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hi! I am Vivek 👋, your AI Tutor for MCA entrance exams powered by **Maarula Classes** — India\'s No. 1 MCA entrance coaching institute.\n\nI can help you with:\n- 📐 **Mathematics** (Calculus, Algebra, Probability…)\n- 💻 **Computer Science** (DSA, DBMS, OS…)\n- 🧠 **Logical Reasoning**\n- 📝 **English**\n\nAsk me any doubt about this question!' }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // Auto-focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Lock body scroll when chat is open on mobile
    useEffect(() => {
        if (isOpen && window.innerWidth <= 480) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const history = messages
                .filter(m => m.role === 'user' || m.role === 'model')
                .slice(1)
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));

            const questionContext = question ? {
                questionText: question.questionText,
                options: question.options,
                explanationText: question.explanationText,
                subject: question.subject,
                topic: question.topic,
                exam: question.exam,
                year: question.year,
                difficulty: question.difficulty,
            } : null;

            const res = await api.post('/ai/chat', {
                message: userMsg.text,
                questionId: questionId,
                history: history,
                questionContext: questionContext,
            });

            let responseText = res.data.text || '';
            const isOutOfScope = responseText.includes("typical scope") || 
                                 responseText.includes("outside the typical scope") || 
                                 responseText.includes("help only with MCA") ||
                                 responseText.includes("LeetCode");

            if (isOutOfScope) {
                responseText = `Hi! I am an AI bot trained to help you with **NIMCET, CUET, and MCA entrance related questions**. \n\nYour question is out of my expertise as I have not been trained on that yet. However, I am still learning so that I can help you in a better way, so please ask me questions related to these entrance exams! I am upgrading myself to help you in all areas. \n\nIf you think this is a mistake, you can email Vivek to increase the training data and include this topic also. ✉️`;
            }

            setMessages(prev => [...prev, { role: 'model', text: responseText }]);

            if (res.data.relatedIds && res.data.relatedIds.length > 0) {
                setMessages(prev => [...prev, {
                    role: 'system',
                    isLinks: true,
                    ids: res.data.relatedIds
                }]);
            }

        } catch (err) {
            console.error("AI Chat Error:", err.response?.data || err.message);
            setMessages(prev => [...prev, {
                role: 'model',
                text: "Hey there! I'm just doing a bit of self-improvement so I can help you even better. Please try again after sometime. 🔧"
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            handleSend();
        }
    };

    // Render message content based on role
    const renderMessageContent = (m) => {
        if (m.role === 'model') {
            return (
                <div 
                    className={styles.markdownContent}
                    dangerouslySetInnerHTML={{ __html: renderMarkdownAndMath(m.text) }}
                />
            );
        }
        // User messages — plain text
        return <span>{m.text}</span>;
    };

    return (
        <>
            {/* Floating Launcher Button */}
            {!isOpen && (
                <button className={styles.launcher} onClick={() => setIsOpen(true)}>
                    <Sparkles size={20} />
                    <span>Ask AI Tutor</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.header}>
                        <div className={styles.title}>
                            <Bot size={20} /> Vivek — AI Tutor
                        </div>
                        <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className={styles.messages} ref={scrollRef}>
                        {messages.map((m, i) => {
                            if (m.isLinks) {
                                return (
                                    <div key={i} className={styles.relatedBox}>
                                        <span className={styles.relatedLabel}>Found similar PYQs:</span>
                                        {m.ids.map(id => (
                                            <Link href={`/question/${id}`} key={id} className={styles.relatedLink}>
                                                <LinkIcon size={12} /> View Related Question
                                            </Link>
                                        ))}
                                    </div>
                                );
                            }
                            return (
                                <div key={i} className={`${styles.message} ${styles[m.role]}`}>
                                    {renderMessageContent(m)}
                                </div>
                            );
                        })}

                        {loading && (
                            <div className={`${styles.message} ${styles.model}`}>
                                <span className={styles.typingDot}></span>
                                <span className={styles.typingDot}></span>
                                <span className={styles.typingDot}></span>
                            </div>
                        )}
                    </div>

                    <div className={styles.inputArea}>
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a doubt about this question..."
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AITutor;