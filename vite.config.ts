import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  
  const apiPlugin = () => ({
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/chat')) {
          return next();
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }

        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const parsedBody = JSON.parse(body);
            const apiKey = env.GROQ_API_KEY || env.GEMINI_API_KEY;
            
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'GROQ_API_KEY or GEMINI_API_KEY environment variable is not configured locally.' }));
            }

            const urlParams = new URLSearchParams(req.url.split('?')[1]);
            const isGroq = apiKey.startsWith('gsk_');

            let fetchUrl, fetchBody;
            const fetchHeaders = { 'Content-Type': 'application/json' };

            if (isGroq) {
              fetchHeaders['Authorization'] = `Bearer ${apiKey}`;
              fetchUrl = 'https://api.groq.com/openai/v1/chat/completions';
              fetchBody = JSON.stringify({
                model: urlParams.get('model') || "llama3-70b-8192",
                messages: parsedBody.messages || [],
                max_tokens: parsedBody.maxTokens || 500
              });
            } else {
              const modelEndpoint = urlParams.get('model') || "gemini-2.5-flash:generateContent";
              fetchUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}?key=${apiKey}`;
              fetchBody = JSON.stringify(parsedBody);
            }

            const fetchResponse = await fetch(fetchUrl, {
              method: 'POST',
              headers: fetchHeaders,
              body: fetchBody
            });
            const data = await fetchResponse.text();
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = fetchResponse.status;
            res.end(data);
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    }
  });

  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    base: './',
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ""),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
