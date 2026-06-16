import React, { useState, useRef, useEffect } from 'react';
import { sendMessageStream, getEnvApiKey } from '../utils/aiService';

const QUICK_QUESTIONS = [
  'แอร์ไม่เย็น เกิดจากอะไร?',
  'เร่งไม่ขึ้น ควรตรวจอะไรบ้าง?',
  'ไฟ Check Engine ติด ทำไงดี?',
  'BMW X3 เช็คระยะ 30,000 กม. ต้องทำอะไร?',
  'เกียร์กระตุก Mercedes อันตรายไหม?',
  'น้ำมันเครื่อง Audi A4 ใช้เบอร์อะไร?',
];

const ChatBot = () => {
  const envKey = getEnvApiKey();
  const hasEnvKey = Boolean(envKey);
  const [manualKey, setManualKey] = useState(() => localStorage.getItem('nvidia_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  // Use env key first, then manual key
  const apiKey = envKey || manualKey;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const saveApiKey = (key) => {
    setManualKey(key);
    localStorage.setItem('nvidia_api_key', key);
    setShowKeyInput(false);
  };

  const handleSend = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    if (!apiKey) {
      setShowKeyInput(true);
      return;
    }

    const userMessage = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setStreamingText('');

    try {
      // Build conversation history (keep last 10 messages for context)
      const historyForApi = newMessages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const fullText = await sendMessageStream(apiKey, historyForApi, (partial) => {
        setStreamingText(partial);
      });

      setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);
      setStreamingText('');
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ ${error.message}`,
        isError: true,
      }]);
      setStreamingText('');
      if (error.message.includes('API Key')) {
        setShowKeyInput(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingText('');
  };

  // Simple markdown-like rendering for bold, bullets, headers
  const renderContent = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={i} style={{ color: 'var(--accent-blue)', margin: '0.8rem 0 0.3rem', fontSize: '0.95rem' }}>{line.slice(4)}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={i} style={{ color: 'var(--accent-amber)', margin: '0.8rem 0 0.3rem', fontSize: '1rem' }}>{line.slice(3)}</h3>;
      }
      // Bullet points
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.slice(2);
        return (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', margin: '0.2rem 0', paddingLeft: '0.5rem' }}>
            <span style={{ color: 'var(--accent-blue)', flexShrink: 0 }}>•</span>
            <span dangerouslySetInnerHTML={{ __html: boldify(content) }} />
          </div>
        );
      }
      // Numbered list
      const numMatch = line.match(/^(\d+)\.\s(.+)/);
      if (numMatch) {
        return (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', margin: '0.2rem 0', paddingLeft: '0.5rem' }}>
            <span style={{ color: 'var(--accent-amber)', flexShrink: 0, fontWeight: '600' }}>{numMatch[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: boldify(numMatch[2]) }} />
          </div>
        );
      }
      // Empty line = spacing
      if (line.trim() === '') return <div key={i} style={{ height: '0.5rem' }} />;
      // Normal text with bold
      return <p key={i} style={{ margin: '0.2rem 0', lineHeight: '1.7' }} dangerouslySetInnerHTML={{ __html: boldify(line) }} />;
    });
  };

  const boldify = (text) => {
    return text.replace(/\*\*(.+?)\*\*/g, '<strong style="color: var(--text-primary)">$1</strong>');
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-in-out', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '2rem' }}>
            <span className="neon-text-blue">Euro</span><span className="neon-text-amber">Diag</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginLeft: '0.5rem' }}>AI</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            ถามอะไรก็ได้เกี่ยวกับรถยุโรป — ผมมีข้อมูลจากคู่มือ 7 ยี่ห้อ
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            style={{
              padding: '0.5rem 0.8rem', borderRadius: '8px', cursor: 'pointer',
              border: `1px solid ${hasEnvKey ? 'rgba(0,200,100,0.4)' : apiKey ? 'rgba(0,243,255,0.3)' : 'var(--border-color)'}`,
              backgroundColor: hasEnvKey ? 'rgba(0,200,100,0.1)' : 'transparent',
              color: hasEnvKey ? '#00c864' : apiKey ? 'var(--accent-blue)' : 'var(--accent-amber)', fontSize: '0.8rem',
            }}
          >
            {hasEnvKey ? '🔑 .env ✓' : apiKey ? '🔑 Key ✓' : '🔑 ใส่ Key'}
          </button>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              style={{
                padding: '0.5rem 0.8rem', borderRadius: '8px', cursor: 'pointer',
                border: '1px solid var(--border-color)', backgroundColor: 'transparent',
                color: 'var(--text-secondary)', fontSize: '0.8rem',
              }}
            >
              🗑️ ล้างแชท
            </button>
          )}
        </div>
      </div>

      {/* API Key Input */}
      {showKeyInput && (
        <div className="glass-panel" style={{ marginBottom: '1rem', animation: 'fadeIn 0.2s ease' }}>
          {hasEnvKey ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#00c864', fontSize: '1.2rem' }}>✅</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>API Key โหลดจากไฟล์ <code style={{ color: 'var(--accent-blue)', backgroundColor: 'rgba(0,243,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>.env</code> เรียบร้อย</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Key: {envKey.slice(0, 10)}...{envKey.slice(-4)}</p>
              </div>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 0 }}>
                วิธีที่ 1: ใส่ Key ในไฟล์ <code style={{ color: 'var(--accent-blue)' }}>.env</code> → <code style={{ color: 'var(--accent-amber)' }}>VITE_NVIDIA_API_KEY=nvapi-xxx</code><br/>
                วิธีที่ 2: ใส่ Key ด้านล่าง (สมัครฟรีที่{' '}
                <a href="https://build.nvidia.com" target="_blank" rel="noreferrer"
                  style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>build.nvidia.com</a>)
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="password"
                  placeholder="nvapi-..."
                  defaultValue={manualKey}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem',
                    backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)', outline: 'none',
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveApiKey(e.target.value); }}
                  id="apiKeyInput"
                />
                <button
                  onClick={() => saveApiKey(document.getElementById('apiKeyInput').value)}
                  className="btn-primary"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  บันทึก
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Chat Messages Area */}
      <div style={{
        flex: 1, overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.5rem',
        display: 'flex', flexDirection: 'column', gap: '1rem',
      }}>
        {/* Welcome message if no messages */}
        {messages.length === 0 && !streamingText && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔧</div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                สวัสดีครับ! ผมคือ EuroDiag AI
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: '1.6' }}>
                ผมสามารถช่วยวินิจฉัยอาการรถยนต์ยุโรป, แนะนำการบำรุงรักษา,
                และตอบคำถามเกี่ยวกับรถยนต์ของคุณได้ครับ
              </p>
            </div>

            {/* Quick Questions */}
            <div style={{ width: '100%', maxWidth: '600px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                ลองถามคำถามเหล่านี้
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem' }}>
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    style={{
                      padding: '0.7rem 1rem', borderRadius: '10px', textAlign: 'left',
                      border: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.03)',
                      color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem',
                      transition: 'all 0.2s ease', lineHeight: '1.4',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = 'var(--accent-blue)';
                      e.target.style.backgroundColor = 'rgba(0,243,255,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = 'var(--border-color)';
                      e.target.style.backgroundColor = 'rgba(255,255,255,0.03)';
                    }}
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <div style={{
              maxWidth: '85%',
              padding: msg.role === 'user' ? '0.8rem 1.2rem' : '1rem 1.5rem',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              backgroundColor: msg.role === 'user'
                ? 'rgba(0, 243, 255, 0.15)'
                : msg.isError
                  ? 'rgba(255, 51, 51, 0.1)'
                  : 'var(--glass-bg)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(0,243,255,0.3)' : msg.isError ? 'rgba(255,51,51,0.3)' : 'var(--border-color)'}`,
              backdropFilter: 'blur(8px)',
            }}>
              {msg.role === 'assistant' && !msg.isError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.9rem' }}>🔧</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: '600' }}>EuroDiag AI</span>
                </div>
              )}
              <div style={{ color: msg.isError ? '#ff5555' : 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.7' }}>
                {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {streamingText && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'fadeIn 0.3s ease' }}>
            <div style={{
              maxWidth: '85%', padding: '1rem 1.5rem', borderRadius: '16px 16px 16px 4px',
              backgroundColor: 'var(--glass-bg)', border: '1px solid var(--border-color)',
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.9rem' }}>🔧</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: '600' }}>EuroDiag AI</span>
                <span style={{ animation: 'pulse 1s infinite', marginLeft: '0.3rem', fontSize: '0.7rem', color: 'var(--accent-blue)' }}>กำลังพิมพ์...</span>
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.7' }}>
                {renderContent(streamingText)}
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingText && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '1rem 1.5rem', borderRadius: '16px', backgroundColor: 'var(--glass-bg)',
              border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: 'var(--accent-blue)',
                    animation: `bounce 1.4s infinite ease-in-out both`,
                    animationDelay: `${i * 0.16}s`,
                  }} />
                ))}
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>กำลังคิด...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        display: 'flex', gap: '0.75rem', alignItems: 'flex-end',
        padding: '1rem 1.25rem', borderRadius: '16px',
        backgroundColor: 'var(--glass-bg)', border: '1px solid var(--border-color)',
        backdropFilter: 'blur(12px)',
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="พิมพ์คำถามเกี่ยวกับรถยนต์ยุโรปของคุณ..."
          rows={1}
          style={{
            flex: 1, padding: '0.75rem', borderRadius: '10px', fontSize: '1rem',
            backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)',
            color: 'var(--text-primary)', outline: 'none', resize: 'none',
            fontFamily: 'inherit', lineHeight: '1.5',
            maxHeight: '120px', transition: 'border-color 0.3s ease',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          style={{
            padding: '0.75rem 1.25rem', borderRadius: '10px', cursor: isLoading ? 'not-allowed' : 'pointer',
            border: 'none',
            backgroundColor: isLoading || !input.trim() ? 'rgba(0,243,255,0.1)' : 'var(--accent-blue)',
            color: isLoading || !input.trim() ? 'var(--text-secondary)' : '#0f0f13',
            fontWeight: '700', fontSize: '1rem', transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
        >
          ส่ง ▸
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default ChatBot;
