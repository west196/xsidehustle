# X Side Hustle Finder

AI-powered tool that analyses any X/Twitter profile and recommends side hustles. Powered by Claude.

---

## Deploy to Vercel (free, 5 minutes)

### Step 1 — Get your Anthropic API key
1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)

### Step 2 — Upload to GitHub
1. Go to https://github.com/new and create a new repo (name it anything, e.g. `x-hustle-finder`)
2. Upload all files from this folder — drag and drop them in the GitHub UI
   - `api/analyse.js`
   - `public/index.html`
   - `vercel.json`
3. Click **Commit changes**

### Step 3 — Deploy on Vercel
1. Go to https://vercel.com and sign up with your GitHub account
2. Click **Add New → Project**
3. Select your `x-hustle-finder` repo and click **Import**
4. Before clicking Deploy, click **Environment Variables** and add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your `sk-ant-...` key
5. Click **Deploy**

### Step 4 — Done!
Vercel gives you a live URL like `x-hustle-finder.vercel.app`. Share it on X!

---

## How it works
- User enters an X username on your site
- Your Vercel server calls Claude's API with web search enabled
- Claude searches X for the profile, reads their bio and tweets
- Returns 3 matched side hustles with reasons and first steps
- Your API key is hidden on the server — users never see it

## Costs
- Vercel free tier: more than enough for viral traffic
- Anthropic API: ~$0.003 per analysis (very cheap, Claude Sonnet)
- You can set a monthly spending limit at console.anthropic.com to cap costs
