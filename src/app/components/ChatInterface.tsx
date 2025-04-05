'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ChatInterface.module.css';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.siliconflow.cn/v1',
  apiKey: process.env.NEXT_PUBLIC_SILICONFLOW_API_KEY,
  dangerouslyAllowBrowser: true
});

export default function ChatInterface() {
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'bot' }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      const newMessage = { text: inputValue, sender: 'user' as const };
      setMessages(prev => [...prev, newMessage]);
      setInputValue('');
      setIsLoading(true);

      try {
        const response = await openai.chat.completions.create({
          model: "deepseek-ai/DeepSeek-V3",
          messages: [
            { role: "system", content: "你是一个有帮助的AI助手。" },
            { role: "user", content: inputValue }
          ],
          temperature: 0.7,
          max_tokens: 1024,
        });

        const botReply = response.choices[0].message.content || "抱歉，我没有收到回复。";
        setMessages(prev => [...prev, { text: botReply, sender: 'bot' as const }]);
      } catch (error) {
        console.error('Error calling SiliconFlow API:', error);
        setMessages(prev => [...prev, { text: "抱歉，发生了错误，请稍后再试。", sender: 'bot' as const }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.map((message, index) => (
          <div key={index} className={`${styles.message} ${styles[message.sender]}`}>
            {message.text}
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.message} ${styles.bot}`}>
            正在思考...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputArea}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入你的消息..."
          disabled={isLoading}
        />
        <button onClick={handleSendMessage} disabled={isLoading}>
          {isLoading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
} 