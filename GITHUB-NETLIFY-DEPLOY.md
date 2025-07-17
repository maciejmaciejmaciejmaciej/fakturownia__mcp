# GitHub & Netlify Deployment Guide

This guide will help you deploy the Fakturownia MCP Server to GitHub and then to Netlify.

## Prerequisites

1. **Git installed** on your local machine
   - Download from: https://git-scm.com/download/win
   - Install with default settings

2. **GitHub account**
   - Sign up at: https://github.com

3. **Netlify account**
   - Sign up at: https://netlify.com
   - Connect your GitHub account

4. **Fakturownia account and API token**
   - Log in to your Fakturownia account
   - Go to Settings → API → Generate API token

## Step 1: Push to GitHub

### Option A: Using Git Command Line

After installing Git, open PowerShell in your project directory and run:

```powershell
# Check current status
git status

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Fakturownia MCP Server"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/fakturownia-mcp-server.git

# Push to GitHub
git push -u origin main
```

### Option B: Using GitHub Desktop

1. Download and install GitHub Desktop
2. File → Add Local Repository
3. Choose your project folder
4. Publish repository to GitHub

### Option C: Manual Upload

1. Create new repository on GitHub:
   - Go to https://github.com/new
   - Name: `fakturownia-mcp-server`
   - Description: `MCP Server for Fakturownia.pl API`
   - Keep public
   - Don't initialize with README
   - Click "Create repository"

2. Upload files manually:
   - Click "uploading an existing file"
   - Drag and drop all project files
   - Commit directly to main branch

## Step 2: Deploy to Netlify

### Automatic Deployment (Recommended)

1. **Log in to Netlify**
   - Go to https://app.netlify.com
   - Sign in with GitHub

2. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your repositories

3. **Select Repository**
   - Find and select `fakturownia-mcp-server`
   - Click "Deploy site"

4. **Configure Build Settings**
   - Build command: `npm run build` (or leave empty)
   - Publish directory: `netlify/functions`
   - Click "Deploy site"

### Manual Deployment

1. **Prepare deployment package**
   ```powershell
   # Build the project (if needed)
   npm run build
   
   # Create deployment zip
   # Include: netlify/, package.json, package-lock.json
   ```

2. **Upload to Netlify**
   - Go to https://app.netlify.com
   - Drag and drop your project folder
   - Netlify will automatically deploy

## Step 3: Configure Environment Variables

1. **In Netlify Dashboard**
   - Go to your site dashboard
   - Click "Site settings"
   - Go to "Environment variables"
   - Click "Add variable"

2. **Add these variables:**
   ```
   FAKTUROWNIA_DOMAIN = your-company-subdomain
   FAKTUROWNIA_API_TOKEN = your-api-token-here
   ```

3. **Get your Fakturownia credentials:**
   - **Domain**: If your Fakturownia URL is `https://mycompany.fakturownia.pl`, your domain is `mycompany`
   - **API Token**: Go to Fakturownia Settings → API → copy your token

## Step 4: Test Your Deployment

1. **Get your Netlify URL**
   - In Netlify dashboard, find your site URL
   - It will be something like: `https://amazing-app-123456.netlify.app`

2. **Test health endpoint**
   ```bash
   curl https://your-site.netlify.app/.netlify/functions/fakturownia-server
   ```

3. **Test MCP endpoint**
   ```bash
   curl -X POST https://your-site.netlify.app/.netlify/functions/fakturownia-server \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "tools/list"
     }'
   ```

## Step 5: Set Up Continuous Deployment

Once connected to GitHub, Netlify will automatically:
- Deploy every time you push to main branch
- Show build logs for debugging
- Provide preview deployments for pull requests

## Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Function Not Working
- Check environment variables are set correctly
- Verify Fakturownia API token is valid
- Check function logs in Netlify dashboard

### CORS Issues
- Ensure your client domain is allowed
- Check if you need to modify CORS headers

## Custom Domain (Optional)

1. **In Netlify Dashboard**
   - Go to "Domain settings"
   - Click "Add custom domain"
   - Follow DNS configuration instructions

2. **SSL Certificate**
   - Netlify provides free SSL automatically
   - Certificate will be issued within minutes

## Monitoring and Logs

1. **Function Logs**
   - Netlify dashboard → Functions tab
   - View real-time logs and errors

2. **Analytics**
   - Enable Netlify Analytics for usage statistics
   - Monitor API calls and performance

## Security Best Practices

1. **Environment Variables**
   - Never commit API tokens to Git
   - Use Netlify environment variables
   - Rotate tokens regularly

2. **Access Control**
   - Consider adding authentication if needed
   - Monitor API usage for abuse

3. **Rate Limiting**
   - Implement rate limiting if high traffic expected
   - Monitor Netlify function usage limits

## Next Steps

- ✅ Repository on GitHub
- ✅ Deployed to Netlify
- ✅ Environment variables configured
- ✅ API endpoints tested
- 🎯 Ready for MCP client integration!

Your Fakturownia MCP Server is now live and ready to use with Make.com, Claude Desktop, or any MCP-compatible client!
