(function() {
  // Try to find configuration
  const config = typeof BMAX_CONFIG !== 'undefined' ? BMAX_CONFIG : {
    apiKey: "",
    model: "claude-3-5-sonnet-20241022",
    maxTokens: 500,
    primaryColour: "#1C69D4",
    welcomeMessage: "Welcome to BMW. I'm BMAX, your personal advisor. Whether you're exploring our latest models, comparing trims, or ready to book a test drive — I'm here to help. What brings you in today?",
    dealershipName: "BMW",
    dealershipPhone: "your nearest dealer"
  };

  const SYSTEM_PROMPT = `You are BMAX, an elite BMW sales associate chatbot embedded on the official BMW website. You represent the BMW brand with sophistication, confidence, and precision.

YOUR ROLE:
- Help customers explore BMW models, trims, specs, pricing, and features
- Answer questions about BMW financing, leasing, and ownership programs
- Guide customers toward booking a test drive or visiting a dealership
- Upsell premium packages, M Sport trims, and optional extras naturally
- Handle objections warmly and professionally — never be pushy

YOUR PERSONALITY:
- Confident, warm, and premium — like a top-tier showroom rep
- Use clean, concise language — never ramble
- Reference BMW's heritage, engineering excellence, and "The Ultimate Driving Machine" philosophy naturally in conversation
- Occasionally use light BMW terminology: "kidney grille", "M Performance", "xDrive", "iDrive"

STRICT RULES:
- NEVER discuss competitor brands (Mercedes, Audi, Lexus, etc.) in any detail — redirect to BMW's strengths instead
- NEVER make up specific local pricing or availability — always direct the customer to their nearest dealer for exact quotes
- NEVER go off-topic — if asked about anything unrelated to BMW or car buying, politely redirect: "I'm here to help you find your perfect BMW — what are you looking for today?"
- ALWAYS end responses with a soft call to action — a question, a suggestion to book a test drive, or an invitation to explore a model

You are the first impression of the BMW brand for this customer. Make it count.`;

  let conversationHistory = [];

  // Determine base URL to load CSS
  let scriptPaths = document.getElementsByTagName('script');
  let currentScript = scriptPaths[scriptPaths.length - 1];
  let baseUrl = '/Upload/';
  
  if (currentScript && currentScript.src && currentScript.src.includes('bmax.js')) {
      let src = currentScript.src;
      baseUrl = src.substring(0, src.lastIndexOf('/') + 1);
  }

  // Load CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = baseUrl + 'bmax.css';
  document.head.appendChild(link);

  // Set CSS variable
  document.documentElement.style.setProperty('--bmax-primary', config.primaryColour);

  // Create UI container
  const container = document.createElement('div');
  container.id = 'bmax-widget-container';

  container.innerHTML = `
    <div id="bmax-panel">
      <div id="bmax-header">
        <div id="bmax-header-info">
          <svg id="bmax-header-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" stroke="currentColor" stroke-width="4"/>
            <circle cx="50" cy="50" r="42" fill="currentColor"/>
            <path d="M50 8C26.8 8 8 26.8 8 50H50V8Z" fill="var(--bmax-primary)"/>
            <path d="M92 50C92 26.8 73.2 8 50 8V50H92Z" fill="currentColor"/>
            <path d="M50 92C73.2 92 92 73.2 92 50H50V92Z" fill="var(--bmax-primary)"/>
            <path d="M8 50C8 73.2 26.8 92 50 92V50H8Z" fill="currentColor"/>
            <circle cx="50" cy="50" r="16" fill="#1A1A1A"/>
          </svg>
          <div id="bmax-header-title">BMAX — Your BMW Advisor</div>
        </div>
        <div id="bmax-close" title="Close chat">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
      </div>
      <div id="bmax-messages">
        <div class="bmax-message bmax-assistant">${config.welcomeMessage}</div>
        <div class="bmax-chips" id="bmax-chips-container">
          <div class="bmax-chip">🚗 Explore Models</div>
          <div class="bmax-chip">⚡ Electric & Hybrid</div>
          <div class="bmax-chip">💰 Financing Options</div>
          <div class="bmax-chip">📍 Find a Dealer</div>
          <div class="bmax-chip">🏎️ M Performance</div>
        </div>
      </div>
      <div id="bmax-input-area">
        <input type="text" id="bmax-input" placeholder="Ask me anything about BMW..." autocomplete="off" />
        <button id="bmax-send" aria-label="Send message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
    <div id="bmax-launcher" class="pulse" title="Chat with BMW">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
         <circle cx="50" cy="50" r="48" stroke="currentColor" stroke-width="4"/>
         <circle cx="50" cy="50" r="42" fill="currentColor"/>
         <path d="M50 8C26.8 8 8 26.8 8 50H50V8Z" fill="var(--bmax-primary)"/>
         <path d="M92 50C92 26.8 73.2 8 50 8V50H92Z" fill="currentColor"/>
         <path d="M50 92C73.2 92 92 73.2 92 50H50V92Z" fill="var(--bmax-primary)"/>
         <path d="M8 50C8 73.2 26.8 92 50 92V50H8Z" fill="currentColor"/>
         <circle cx="50" cy="50" r="16" fill="#1C69D4"/>
      </svg>
    </div>
  `;

  document.body.appendChild(container);

  const launcher = document.getElementById('bmax-launcher');
  const panel = document.getElementById('bmax-panel');
  const closeBtn = document.getElementById('bmax-close');
  const input = document.getElementById('bmax-input');
  const sendBtn = document.getElementById('bmax-send');
  const messagesArea = document.getElementById('bmax-messages');
  const chipsContainer = document.getElementById('bmax-chips-container');
  let isOpen = false;

  launcher.addEventListener('click', () => {
    isOpen = true;
    launcher.classList.remove('pulse');
    panel.classList.add('open');
    launcher.style.display = 'none';
    input.focus();
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    panel.classList.remove('open');
    launcher.style.display = 'flex';
  });

  function addMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `bmax-message bmax-${role}`;
    
    // Parse basic markdown: bold
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Parse links
    formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: var(--bmax-primary); text-decoration: underline;">$1</a>');
    // New lines
    formattedText = formattedText.replace(/\n/g, '<br/>');
    
    msg.innerHTML = formattedText;
    messagesArea.appendChild(msg);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function showTyping() {
    const typingMsg = document.createElement('div');
    typingMsg.className = 'bmax-typing';
    typingMsg.id = 'bmax-typing-indicator';
    typingMsg.innerHTML = '<div class="bmax-dot"></div><div class="bmax-dot"></div><div class="bmax-dot"></div>';
    messagesArea.appendChild(typingMsg);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function hideTyping() {
    const indicator = document.getElementById('bmax-typing-indicator');
    if (indicator) indicator.remove();
  }

  async function sendMessage(userText) {
    if (!userText.trim()) return;

    if (chipsContainer && chipsContainer.parentNode) {
      chipsContainer.style.opacity = '0';
      setTimeout(() => chipsContainer.remove(), 300);
    }

    addMessage('user', userText);
    input.value = '';
    sendBtn.disabled = true;

    conversationHistory.push({ role: 'user', content: userText });
    showTyping();

    if (!config.apiKey) {
      setTimeout(() => {
        hideTyping();
        addMessage('assistant', "I'm currently running in demo mode without an Anthropic API key. Please add your key to <code>config.js</code> to enable my AI capabilities.");
        conversationHistory.pop();
        sendBtn.disabled = false;
        input.focus();
      }, 1000);
      return;
    }

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: config.model || "claude-3-5-sonnet-20241022",
          max_tokens: config.maxTokens || 500,
          system: SYSTEM_PROMPT,
          messages: conversationHistory
        })
      });

      hideTyping();

      if (!response.ok) {
        const err = await response.json();
        console.error("BMAX API Error:", err);
        addMessage('assistant', "I'm having trouble connecting right now. Please check your API key configuration and try again shortly.");
        conversationHistory.pop();
      } else {
        const data = await response.json();
        const bmaxResponse = data.content[0].text;
        addMessage('assistant', bmaxResponse);
        conversationHistory.push({ role: 'assistant', content: bmaxResponse });
      }
    } catch (error) {
      console.error("BMAX Network Error:", error);
      hideTyping();
      addMessage('assistant', `I'm currently unable to connect. Please reach out to ${config.dealershipName} directly at ${config.dealershipPhone}.`);
      conversationHistory.pop();
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener('click', () => {
    sendMessage(input.value);
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage(input.value);
    }
  });

  document.querySelectorAll('.bmax-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      sendMessage(e.target.textContent);
    });
  });

  // Automatically open the chatbot on load
  setTimeout(() => {
    if (!isOpen) launcher.click();
  }, 300);

})();
