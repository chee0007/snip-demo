const links = new Map();

// Base62 characters for code generation
const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += BASE62[Math.floor(Math.random() * BASE62.length)];
  }
  return links.has(code) ? generateCode() : code;
}

function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function getBaseUrl() {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }
  const port = process.env.PORT || 3000;
  return `http://localhost:${port}`;
}

const server = Bun.serve({
  port: process.env.PORT || 3000,
  
  async fetch(req) {
    const url = new URL(req.url);
    const baseUrl = getBaseUrl();

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // POST /api/links - create short link
    if (req.method === 'POST' && url.pathname === '/api/links') {
      let body;
      try {
        body = await req.json();
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      if (!body.url || !isValidUrl(body.url)) {
        return new Response(
          JSON.stringify({ error: 'Invalid or missing URL (must be http or https)' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const code = generateCode();
      const link = {
        code,
        url: body.url,
        shortUrl: `${baseUrl}/${code}`,
        hits: 0,
        createdAt: new Date().toISOString(),
      };
      links.set(code, link);

      return new Response(JSON.stringify(link), {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // GET /api/links - list all links
    if (req.method === 'GET' && url.pathname === '/api/links') {
      const allLinks = Array.from(links.values());
      return new Response(JSON.stringify(allLinks), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Static file serving if PUBLIC_DIR is set
    if (process.env.PUBLIC_DIR) {
      const publicDir = process.env.PUBLIC_DIR;
      let filePath;

      if (url.pathname === '/') {
        filePath = `${publicDir}/index.html`;
      } else {
        filePath = `${publicDir}${url.pathname}`;
      }

      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      }
    }

    // GET /:code - redirect to original URL
    if (req.method === 'GET') {
      const code = url.pathname.slice(1);
      const link = links.get(code);

      if (link) {
        link.hits++;
        return new Response(null, {
          status: 302,
          headers: { Location: link.url, ...corsHeaders },
        });
      }

      return new Response(
        JSON.stringify({ error: 'Short link not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response('Method not allowed', { status: 405 });
  },
});

console.log(`🚀 Snip server running at ${getBaseUrl()}`);
