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
  let baseUrl = './Upload/';
  const currentScript = document.currentScript;
  if (currentScript && currentScript.src && currentScript.src.includes('bmax.js')) {
      let src = currentScript.src;
      baseUrl = src.substring(0, src.lastIndexOf('/') + 1);
  } else {
      let scriptPaths = document.getElementsByTagName('script');
      for (let i = 0; i < scriptPaths.length; i++) {
          if (scriptPaths[i].src && scriptPaths[i].src.includes('bmax.js')) {
              let src = scriptPaths[i].src;
              baseUrl = src.substring(0, src.lastIndexOf('/') + 1);
              break;
          }
      }
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
  `;

  document.body.appendChild(container);

  const panel = document.getElementById('bmax-panel');
  const input = document.getElementById('bmax-input');
  const sendBtn = document.getElementById('bmax-send');
  const messagesArea = document.getElementById('bmax-messages');
  const chipsContainer = document.getElementById('bmax-chips-container');

  // Set initial focus
  setTimeout(() => input.focus(), 100);

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

    if (!config.apiKey && !config.apiUrl) {
      setTimeout(() => {
        hideTyping();
        addMessage('assistant', "I'm currently running in demo mode without an API key or secure endpoint. Please check your <code>config.js</code>.");
        conversationHistory.pop();
        sendBtn.disabled = false;
        input.focus();
      }, 1000);
      return;
    }

    try {
      const geminiMessages = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      let modelEndpoint = config.model || "gemini-2.5-flash:generateContent";
      if (!modelEndpoint.includes(":generateContent")) {
          modelEndpoint += ":generateContent";
      }

      // Route the request securely to our Vercel function if defined, otherwise direct to Gemini (insecure)
      const targetUrl = config.apiUrl 
        ? `${config.apiUrl}?model=${encodeURIComponent(modelEndpoint)}`
        : `https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}?key=${config.apiKey}`;

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: geminiMessages,
          generationConfig: {
            maxOutputTokens: config.maxTokens || 500
          }
        })
      });

      hideTyping();

      if (!response.ok) {
        const err = await response.json();
        console.error("BMAX API Error:", err);
        const errMsg = err.error && err.error.message ? err.error.message : JSON.stringify(err);
        addMessage('assistant', `I'm having trouble connecting right now. Error from API: ${errMsg}`);
        conversationHistory.pop();
      } else {
        const data = await response.json();
        const bmaxResponse = data.candidates[0].content.parts[0].text;
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

})();
