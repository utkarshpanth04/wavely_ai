/**
 * Wavely AI – Floating Chat Widget
 * Drop this script anywhere to inject a premium AI chatbot bubble.
 */
(function () {
  /* ─────────────── STYLES ─────────────── */
  const style = document.createElement('style');
  style.textContent = `
    /* ── Widget host ── */
    #wavely-chat-host {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 99999;
      pointer-events: none; /* Don't block touches when closed — re-enabled for children */
      font-family: 'Inter', sans-serif;
      --w-primary: #8b5cf6;
      --w-grad: linear-gradient(135deg, #6366f1, #a855f7);
      --w-bg: #0d0d10;
      --w-surface: rgba(22, 22, 28, 0.92);
      --w-border: rgba(255,255,255,0.07);
      --w-muted: #94a3b8;
      --w-text: #f1f5f9;
    }

    /* ── Toggle FAB ── */
    #wavely-fab {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--w-grad);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(99,102,241,0.45), 0 0 0 0 rgba(99,102,241,0.4);
      transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s ease;
      position: relative;
      animation: wavely-pulse 2.8s ease-in-out infinite;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      pointer-events: auto; /* Always clickable */
    }
    #wavely-fab:hover {
      transform: scale(1.08);
      box-shadow: 0 12px 40px rgba(99,102,241,0.6), 0 0 0 0 rgba(99,102,241,0.4);
    }
    #wavely-fab svg { transition: all 0.3s ease; }

    /* Notification dot */
    #wavely-fab::after {
      content: '';
      position: absolute;
      top: 4px;
      right: 4px;
      width: 12px;
      height: 12px;
      background: #22c55e;
      border-radius: 50%;
      border: 2px solid var(--w-bg);
      animation: wavely-blink 2s ease-in-out infinite;
    }
    #wavely-fab.open::after { display: none; }

    @keyframes wavely-pulse {
      0%,100% { box-shadow: 0 8px 32px rgba(99,102,241,0.45), 0 0 0 0 rgba(99,102,241,0.35); }
      50%      { box-shadow: 0 8px 32px rgba(99,102,241,0.45), 0 0 0 10px rgba(99,102,241,0); }
    }
    @keyframes wavely-blink {
      0%,100% { opacity:1; }
      50%      { opacity:0.4; }
    }

    /* ── Chat panel ── */
    #wavely-panel {
      position: absolute;
      bottom: 76px;
      right: 0;
      width: 380px;
      height: 560px;
      background: var(--w-surface);
      border: 1px solid var(--w-border);
      border-radius: 24px;
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06);
      transform-origin: bottom right;
      transform: scale(0.85) translateY(12px);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.28s ease;
    }
    #wavely-panel.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: auto;
    }

    /* ── Panel Header ── */
    #wavely-header {
      background: linear-gradient(135deg, rgba(99,102,241,0.18), rgba(168,85,247,0.12));
      border-bottom: 1px solid var(--w-border);
      padding: 18px 20px 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      position: relative;
      flex-shrink: 0;
    }
    #wavely-header::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at top left, rgba(99,102,241,0.12) 0%, transparent 60%);
      pointer-events: none;
    }
    .wavely-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--w-grad);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 16px rgba(99,102,241,0.4);
    }
    .wavely-avatar svg { display: block; }
    .wavely-header-info { flex: 1; }
    .wavely-header-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 1rem;
      color: var(--w-text);
      line-height: 1.2;
    }
    .wavely-header-sub {
      font-size: 0.75rem;
      color: var(--w-muted);
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
    }
    .wavely-online-dot {
      width: 7px;
      height: 7px;
      background: #22c55e;
      border-radius: 50%;
      animation: wavely-blink 2s ease-in-out infinite;
      flex-shrink: 0;
    }
    #wavely-close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    #wavely-close-btn:hover { background: rgba(255,255,255,0.12); }

    /* ── Quick chips ── */
    #wavely-chips {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      overflow-x: auto;
      scrollbar-width: none;
      flex-shrink: 0;
      border-bottom: 1px solid var(--w-border);
    }
    #wavely-chips::-webkit-scrollbar { display: none; }
    .wavely-chip {
      white-space: nowrap;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--w-primary);
      background: rgba(139,92,246,0.1);
      border: 1px solid rgba(139,92,246,0.22);
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .wavely-chip:hover {
      background: rgba(139,92,246,0.22);
      border-color: rgba(139,92,246,0.5);
      transform: translateY(-1px);
    }

    /* ── Messages ── */
    #wavely-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.1) transparent;
    }
    #wavely-messages::-webkit-scrollbar { width: 4px; }
    #wavely-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    .wavely-msg {
      max-width: 82%;
      display: flex;
      flex-direction: column;
      gap: 4px;
      animation: wavely-msg-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
    }
    @keyframes wavely-msg-in {
      from { opacity:0; transform: translateY(10px) scale(0.95); }
      to   { opacity:1; transform: translateY(0) scale(1); }
    }
    .wavely-msg.bot  { align-self: flex-start; }
    .wavely-msg.user { align-self: flex-end; }

    .wavely-bubble {
      padding: 11px 15px;
      border-radius: 18px;
      font-size: 0.875rem;
      line-height: 1.55;
      word-wrap: break-word;
    }
    .wavely-msg.bot .wavely-bubble {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      color: var(--w-text);
      border-bottom-left-radius: 6px;
    }
    .wavely-msg.user .wavely-bubble {
      background: var(--w-grad);
      color: #fff;
      border-bottom-right-radius: 6px;
      box-shadow: 0 4px 14px rgba(99,102,241,0.35);
    }
    .wavely-msg-time {
      font-size: 0.68rem;
      color: var(--w-muted);
      padding: 0 4px;
    }
    .wavely-msg.user .wavely-msg-time { text-align: right; }

    /* Typing indicator */
    .wavely-typing .wavely-bubble {
      display: flex;
      gap: 6px;
      align-items: center;
      padding: 14px 16px;
    }
    .wavely-typing-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--w-muted);
      animation: wavely-bounce 1.4s ease-in-out infinite;
    }
    .wavely-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .wavely-typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes wavely-bounce {
      0%,80%,100% { transform: translateY(0); opacity:0.5; }
      40%          { transform: translateY(-6px); opacity:1; }
    }

    /* ── Input area ── */
    #wavely-input-wrap {
      padding: 14px 16px;
      border-top: 1px solid var(--w-border);
      display: flex;
      gap: 10px;
      align-items: flex-end;
      background: rgba(9,9,11,0.4);
      flex-shrink: 0;
    }
    #wavely-input {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      padding: 10px 14px;
      font-size: 0.875rem;
      color: var(--w-text);
      resize: none;
      outline: none;
      font-family: 'Inter', sans-serif;
      max-height: 100px;
      line-height: 1.5;
      scrollbar-width: none;
      transition: border-color 0.2s;
      rows: 1;
    }
    #wavely-input::placeholder { color: var(--w-muted); }
    #wavely-input:focus { border-color: rgba(139,92,246,0.5); }
    #wavely-input::-webkit-scrollbar { display: none; }

    #wavely-send-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--w-grad);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 14px rgba(99,102,241,0.35);
    }
    #wavely-send-btn:hover { transform: scale(1.06); box-shadow: 0 6px 20px rgba(99,102,241,0.5); }
    #wavely-send-btn:active { transform: scale(0.96); }
    #wavely-send-btn:disabled { opacity:0.4; cursor:not-allowed; transform:none; }

    /* ── Branding footer ── */
    #wavely-brand {
      text-align: center;
      padding: 8px 0 14px;
      font-size: 0.68rem;
      color: rgba(148,163,184,0.5);
      letter-spacing: 0.02em;
      flex-shrink: 0;
    }
    #wavely-brand a {
      color: rgba(139,92,246,0.7);
      text-decoration: none;
      font-weight: 600;
    }
    #wavely-brand a:hover { color: #8b5cf6; }

    /* ── Responsive ── */
    @media (max-width: 440px) {
      #wavely-panel {
        width: calc(100vw - 32px);
        right: -14px;
        height: calc(100dvh - 120px);
      }
      #wavely-chat-host { right: 20px; bottom: 20px; }
    }
  `;
  document.head.appendChild(style);

  /* ─────────────── REPLIES ─────────────── */
  const replies = {
    greet: [
      "Hey there! 👋 I'm **Wave**, Wavely AI's assistant. Ask me anything about our platform!",
      "Hi! Welcome to Wavely AI 🌊 How can I help you supercharge your WhatsApp marketing today?",
    ],
    pricing: [
      "We have flexible plans starting from **Free** all the way to Enterprise. Check out our [Pricing page](pricing.html) for full details! 💰",
      "Our pricing is built for scale — from startups to Fortune 500. Want me to walk you through the tiers?",
    ],
    demo: [
      "Absolutely! You can [watch a live demo](watchdemo.html) or kick off your **14-day FREE trial** with zero credit card required 🚀",
    ],
    chatbot: [
      "Wavely AI lets you deploy AI-powered WhatsApp chatbots in minutes. Train them on your knowledge base and automate tier-1 support 24/7. 🤖",
    ],
    api: [
      "We're an official **Meta Business Partner** with direct WhatsApp Business API access. You can integrate via our REST API or no-code flows. Check [API Reference](api-reference.html).",
    ],
    broadcast: [
      "Send personalized broadcast campaigns to unlimited contacts with 98% open rates. Our AI even optimizes send-time for max engagement! 📣",
    ],
    payments: [
      "Collect payments natively inside WhatsApp using WhatsApp Pay, Stripe, PayU, and more. True checkout — no redirects. 💳 Learn more on the [Payments page](payments.html).",
    ],
    default: [
      "Great question! Our team is always here to help. For detailed inquiries, visit [Contact us](contact.html) or I can connect you to a human agent right now.",
      "Let me check on that... 🤔 For the most accurate answer, you might want to explore our [Help Center](documentation.html) or chat with a live agent.",
      "I'm still learning! But I can connect you with one of our experts — they reply within 2 minutes during business hours. ⚡",
    ],
  };

  const chips = [
    { label: '💰 Pricing', key: 'pricing' },
    { label: '🤖 Chatbots', key: 'chatbot' },
    { label: '📣 Broadcasts', key: 'broadcast' },
    { label: '💳 Payments', key: 'payments' },
    { label: '🔗 API Access', key: 'api' },
    { label: '▶ Live Demo', key: 'demo' },
  ];

  function pickReply(key) {
    const pool = replies[key] || replies.default;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function detectIntent(text) {
    const t = text.toLowerCase();
    if (/\b(hi|hello|hey|howdy|morning|evening)\b/.test(t)) return 'greet';
    if (/\b(price|pricing|plan|cost|bill|paid|free|trial)\b/.test(t)) return 'pricing';
    if (/\b(demo|watch|tour|preview)\b/.test(t)) return 'demo';
    if (/\b(chatbot|bot|automat|ai agent|nlu|nlp)\b/.test(t)) return 'chatbot';
    if (/\b(api|developer|rest|webhook|code|integrate)\b/.test(t)) return 'api';
    if (/\b(broadcast|campaign|bulk|blast|send message)\b/.test(t)) return 'broadcast';
    if (/\b(pay|payment|checkout|stripe|upi|razorpay)\b/.test(t)) return 'payments';
    return 'default';
  }

  function now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function renderMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#a78bfa;text-decoration:underline;">$1</a>');
  }

  /* ─────────────── BUILD HTML ─────────────── */
  const host = document.createElement('div');
  host.id = 'wavely-chat-host';

  host.innerHTML = `
    <!-- Panel -->
    <div id="wavely-panel" role="dialog" aria-label="Wavely AI Chat">
      <!-- Header -->
      <div id="wavely-header">
        <div class="wavely-avatar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 12C2 12 4.5 5 12 5C19.5 5 22 12 22 12C22 12 19.5 19 12 19C4.5 19 2 12 2 12Z" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
            <path d="M6 9C7.5 7 9.5 6 12 6" stroke="rgba(255,255,255,0.5)" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="wavely-header-info">
          <div class="wavely-header-title">Wavely AI Assistant</div>
          <div class="wavely-header-sub">
            <span class="wavely-online-dot"></span>
            Online · Typically replies instantly
          </div>
        </div>
        <button id="wavely-close-btn" aria-label="Close chat">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Chips -->
      <div id="wavely-chips">
        ${chips.map(c => `<button class="wavely-chip" data-key="${c.key}">${c.label}</button>`).join('')}
      </div>

      <!-- Messages -->
      <div id="wavely-messages"></div>

      <!-- Input -->
      <div id="wavely-input-wrap">
        <textarea id="wavely-input" placeholder="Ask anything about Wavely AI…" rows="1" maxlength="500"></textarea>
        <button id="wavely-send-btn" aria-label="Send">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Brand -->
      <div id="wavely-brand">Powered by <a href="index.html">Wavely AI</a></div>
    </div>

    <!-- FAB -->
    <button id="wavely-fab" aria-label="Open chat">
      <!-- Chat icon (default) -->
      <svg id="wavely-icon-chat" width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="8.5" cy="10.5" r="1" fill="white"/>
        <circle cx="12" cy="10.5" r="1" fill="white"/>
        <circle cx="15.5" cy="10.5" r="1" fill="white"/>
      </svg>
      <!-- X icon (open) -->
      <svg id="wavely-icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" style="display:none;">
        <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    </button>
  `;

  document.body.appendChild(host);

  /* ─────────────── REFS ─────────────── */
  const panel    = document.getElementById('wavely-panel');
  const fab      = document.getElementById('wavely-fab');
  const closeBtnEl = document.getElementById('wavely-close-btn');
  const msgBox   = document.getElementById('wavely-messages');
  const inputEl  = document.getElementById('wavely-input');
  const sendBtn  = document.getElementById('wavely-send-btn');
  const iconChat = document.getElementById('wavely-icon-chat');
  const iconClose= document.getElementById('wavely-icon-close');

  let isOpen = false;
  let isBotTyping = false;

  /* ─────────────── HELPERS ─────────────── */
  function addMsg(text, role) {
    const wrap = document.createElement('div');
    wrap.className = `wavely-msg ${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'wavely-bubble';
    bubble.innerHTML = renderMarkdown(text);
    const time = document.createElement('div');
    time.className = 'wavely-msg-time';
    time.textContent = now();
    wrap.appendChild(bubble);
    wrap.appendChild(time);
    msgBox.appendChild(wrap);
    msgBox.scrollTop = msgBox.scrollHeight;
    return wrap;
  }

  function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'wavely-msg bot wavely-typing';
    wrap.id = 'wavely-typing-indicator';
    const bubble = document.createElement('div');
    bubble.className = 'wavely-bubble';
    bubble.innerHTML = `
      <span class="wavely-typing-dot"></span>
      <span class="wavely-typing-dot"></span>
      <span class="wavely-typing-dot"></span>
    `;
    wrap.appendChild(bubble);
    msgBox.appendChild(wrap);
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('wavely-typing-indicator');
    if (el) el.remove();
  }

  function botReply(key) {
    if (isBotTyping) return;
    isBotTyping = true;
    sendBtn.disabled = true;
    showTyping();
    const delay = 900 + Math.random() * 700;
    setTimeout(() => {
      hideTyping();
      addMsg(pickReply(key), 'bot');
      isBotTyping = false;
      sendBtn.disabled = false;
    }, delay);
  }

  function sendMessage(textOverride) {
    const text = (textOverride || inputEl.value).trim();
    if (!text || isBotTyping) return;
    addMsg(text, 'user');
    inputEl.value = '';
    inputEl.style.height = 'auto';
    const intent = detectIntent(text);
    botReply(intent);
  }

  /* ─────────────── TOGGLE ─────────────── */
  function openChat() {
    isOpen = true;
    host.style.pointerEvents = 'auto'; // Enable full pointer events when open
    panel.classList.add('open');
    fab.classList.add('open');
    iconChat.style.display = 'none';
    iconClose.style.display = 'block';
    inputEl.focus();
    // Show welcome on first open
    if (msgBox.children.length === 0) {
      setTimeout(() => botReply('greet'), 300);
    }
  }

  function closeChat() {
    isOpen = false;
    host.style.pointerEvents = 'none'; // Disable blocking when closed
    panel.classList.remove('open');
    fab.classList.remove('open');
    iconChat.style.display = 'block';
    iconClose.style.display = 'none';
  }

  fab.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtnEl.addEventListener('click', closeChat);

  /* ─────────────── CHIPS ─────────────── */
  document.getElementById('wavely-chips').addEventListener('click', e => {
    const chip = e.target.closest('.wavely-chip');
    if (!chip) return;
    const key = chip.dataset.key;
    const label = chip.textContent.replace(/^[^ ]+ /, '');
    addMsg(label, 'user');
    botReply(key);
  });

  /* ─────────────── INPUT ─────────────── */
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
  });

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', () => sendMessage());

  /* ─────────────── CLOSE ON OUTSIDE CLICK ─────────────── */
  // Use click event only — touchend was swallowing tap events on page buttons on mobile
  document.addEventListener('click', e => {
    if (isOpen && !host.contains(e.target)) closeChat();
  });

  /* ─────────────── ESC KEY ─────────────── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeChat();
  });

})();
