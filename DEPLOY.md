# 🚀 Netlify Deployment Guide

## Your WooCommerce MCP Server is ready for deployment!

### What we've set up:

✅ **Netlify Function**: Created `netlify/functions/mcp-server.ts`  
✅ **Configuration**: Updated `netlify.toml` and `package.json`  
✅ **Dependencies**: Installed all required packages  
✅ **Documentation**: Updated README with deployment instructions  

### Next Steps:

## 1. Deploy to Netlify

### Option A: Via Netlify Dashboard (Easiest)
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select your repository
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
5. Click "Deploy site"

### Option B: Via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify init
netlify deploy --prod
```

## 2. Set Environment Variables

In your Netlify dashboard, go to **Site settings → Environment variables** and add:

| Variable | Value |
|----------|-------|
| `WORDPRESS_SITE_URL` | `https://yourstore.com` |
| `WORDPRESS_USERNAME` | Your WordPress username |
| `WORDPRESS_PASSWORD` | Your WordPress app password |
| `WOOCOMMERCE_CONSUMER_KEY` | `ck_xxxxxxxxxxxxx` |
| `WOOCOMMERCE_CONSUMER_SECRET` | `cs_xxxxxxxxxxxxx` |

## 3. Get WooCommerce API Keys

1. Go to: **WooCommerce → Settings → Advanced → REST API**
2. Click "Add key"
3. Set permissions to "Read/Write"
4. Copy the keys to your environment variables

## 4. Test Your Deployment

After deployment, test with:
```bash
curl -X POST https://YOUR-SITE.netlify.app/.netlify/functions/mcp-server \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "get_products",
    "params": {"perPage": 5}
  }'
```

## 5. Use in Make.com

- **URL**: `https://YOUR-SITE.netlify.app/.netlify/functions/mcp-server`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**: JSON-RPC format (see README for examples)

---

## 🎉 You're all set!

Your WooCommerce MCP server is ready to be deployed as a serverless function on Netlify. It will automatically handle all your WooCommerce API requests through a clean JSON-RPC interface.
