import { useState, useRef, useEffect } from 'react';
import { askCopilot } from '../api';

const QUICK_PROMPTS = [
  '🛡️ Explain policy safety rules',
  '📊 Summarize revenue recovery stats',
  '⚠️ Why are payments escalated?',
  '💡 UPI payment recovery tactics'
];

export default function RescueCopilot({ selectedTxnId, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Hi! I'm **RescueCopilot**, your autonomous FinTech recovery AI. Ask me about any transaction, ML recovery probability, or policy gate rules!",
      actions: []
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await askCopilot({
        message: query.trim(),
        contextTxnId: selectedTxnId
      });

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.data.reply,
        actions: res.data.structuredActions || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: "⚠️ I couldn't connect to the Copilot service right now. Please verify your backend server connection."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    if (action.action === 'view_txn' && action.txnId && onNavigate) {
      onNavigate('ai_decision', action.txnId);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Copilot Launcher Button */}
      <button
        className={`copilot-floating-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Open RescueCopilot AI Assistant"
        aria-label="Open RescueCopilot AI Assistant"
      >
        <span className="copilot-btn-icon">✨</span>
        <span className="copilot-btn-label">AI Copilot</span>
        <span className="copilot-btn-dot" />
      </button>

      {/* Backdrop on mobile */}
      {isOpen && (
        <div className="copilot-backdrop" onClick={() => setIsOpen(false)} />
      )}

      {/* Copilot Drawer / Bottom Sheet */}
      {isOpen && (
        <div className="copilot-drawer animate-in">
          {/* Drag Handle Indicator (for mobile sheet view) */}
          <div className="copilot-sheet-handle" />

          {/* Header */}
          <div className="copilot-header">
            <div className="copilot-header-left">
              <div className="copilot-avatar">✨</div>
              <div>
                <div className="copilot-title">RescueCopilot AI</div>
                <div className="copilot-status">
                  <span className="pulse-dot" /> Autonomous Intelligence
                </div>
              </div>
            </div>
            <button
              className="copilot-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Copilot"
            >
              ✕
            </button>
          </div>

          {/* Context Banner if transaction selected */}
          {selectedTxnId && (
            <div className="copilot-context-banner">
              <span>🎯 Context: <code>{selectedTxnId}</code></span>
              <button
                className="btn btn-outline btn-sm"
                style={{ padding: '2px 8px', fontSize: 10 }}
                onClick={() => handleSend(`Analyze transaction ${selectedTxnId}`)}
              >
                Analyze Now
              </button>
            </div>
          )}

          {/* Chat Messages */}
          <div className="copilot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`copilot-msg-row ${msg.sender}`}>
                {msg.sender === 'bot' && <div className="copilot-msg-avatar">🤖</div>}
                <div className={`copilot-msg-bubble ${msg.sender}`}>
                  <div
                    className="copilot-msg-text"
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdown(msg.text)
                    }}
                  />
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="copilot-msg-actions">
                      {msg.actions.map((act, i) => (
                        <button
                          key={i}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: 11, padding: '4px 10px', marginTop: 6 }}
                          onClick={() => handleActionClick(act)}
                        >
                          🔍 {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="copilot-msg-row bot">
                <div className="copilot-msg-avatar">🤖</div>
                <div className="copilot-msg-bubble bot typing">
                  <div className="spinner" style={{ width: 14, height: 14 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Synthesizing ledger insights...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="copilot-quick-prompts">
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                className="copilot-prompt-chip"
                onClick={() => handleSend(qp.replace(/^[^\s]+\s/, ''))}
                disabled={loading}
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            className="copilot-input-area"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              placeholder="Ask about payments, policy limits, TXN IDs..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!input.trim() || loading}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

/** Simple, safe markdown bold & bullet formatter */
function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.06); padding: 1px 4px; border-radius: 4px; font-size: 11px;">$1</code>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n•/g, '<br/>•')
    .replace(/\n\d\./g, match => '<br/>' + match.trim());
}
