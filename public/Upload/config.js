const BMAX_CONFIG = {
  // Option 1: Vercel Secure Mode (Recommended)
  // Set apiUrl to '/api/chat' and add your GEMINI_API_KEY in Vercel's Environment Variables settings.
  apiUrl: "/api/chat",
  
  // Option 2: Local testing mode (Not secure for production)
  // You can still paste your key here for local testing, but clear it before pushing to GitHub!
  apiKey: "",  
  
  model: "gemini-2.5-flash",
  maxTokens: 500,
  dealershipName: "BMW",
  dealershipPhone: "1-800-831-1117",
  dealershipBookingUrl: "https://www.bmwusa.com/test-drive.html",
  primaryColour: "#1C69D4",
  welcomeMessage: "Welcome to BMW. I'm BMAX, your personal advisor. Whether you're exploring our latest models, comparing trims, or ready to book a test drive — I'm here to help. What brings you in today?"
};
