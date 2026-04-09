# MarketingOS - Complete Local Setup Guide

This guide walks you through setting up MarketingOS locally with all integrations configured for testing before going public.

---

## 📋 **PREREQUISITES**

- Node.js 18+ installed
- PostgreSQL 13+ (local or cloud)
- Anthropic API key
- Meta/Facebook Developer Account (optional but recommended)
- Google Ads/Search Console access (optional)
- Instagram Business Account connected to Facebook (optional)

---

## **STEP 1: Database Setup**

### Option A: Local PostgreSQL (Recommended for Development)

#### Windows - Install PostgreSQL
```bash
# Download from https://www.postgresql.org/download/windows/
# Run installer, remember the password for 'postgres' user
# Add PostgreSQL to PATH during installation
```

#### Verify Installation
```bash
psql --version
# Output: psql (PostgreSQL) 15.x (or your version)
```

#### Create Database
```bash
# Open PowerShell as Admin
psql -U postgres

# In psql prompt:
CREATE DATABASE marketingos;
\q  # Exit psql

# Verify
psql -U postgres -d marketingos -c "SELECT 1"
# Should return: 1
```

#### Connection String
```
postgresql://postgres:your_password@localhost:5432/marketingos
```

---

### Option B: Cloud PostgreSQL (Easier)

#### Use Supabase (Recommended - Free)
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database → Connection String
4. Copy PostgreSQL connection string
5. Replace password in URL

#### Use Railway or Render
1. Railway: https://railway.app (simple deployment)
2. Render: https://render.com (free tier available)
3. Get connection string from their dashboard

---

## **STEP 2: Environment Configuration**

### Create .env.local
```bash
# In marketingos/ directory
touch .env.local
```

### Add Configuration
```env
# Database (Required)
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/marketingos"

# NextAuth (Required - generate secure secret)
NEXTAUTH_SECRET="your-secret-key-min-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"

# Anthropic API (Required - for all AI agents)
ANTHROPIC_API_KEY="sk-ant-your-api-key-here"

# Optional: OAuth Providers (skip for now, use email/password)
# GITHUB_ID="..."
# GITHUB_SECRET="..."
# GOOGLE_CLIENT_ID="..."
# GOOGLE_CLIENT_SECRET="..."
```

### Generate NEXTAUTH_SECRET
```bash
# Option 1: Using Node
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Copy output and paste into .env.local
```

### Get Anthropic API Key
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Go to API keys section
4. Create new API key
5. Copy to .env.local

---

## **STEP 3: Initialize Database**

```bash
# In marketingos/ directory

# Install Prisma (should already be installed)
npm install

# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Verify (opens Prisma Studio)
npx prisma studio
# Should show empty tables in browser
```

---

## **STEP 4: Start Development Server**

```bash
# In marketingos/ directory
npm run dev

# Output should show:
# ▲ Next.js 16.2.2
# Local:        http://localhost:3000
# Press Ctrl+C to stop
```

---

## **STEP 5: User Registration & Onboarding**

### Register First User
1. Go to http://localhost:3000
2. Click "Register here"
3. Enter:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `TestPassword123!`
4. Click "Create Account"
5. Redirects to onboarding

### Set Up Brand
1. **Welcome Step**: Click "Get Started"
2. **Brand Setup**: Fill in:
   ```
   Brand Name:    My Test Brand
   Industry:      SaaS
   Website:       https://example.com
   Brand Voice:   Professional
   ```
3. Click "Continue"
4. **Integrations**: Click "Skip for Now" (we'll set up next)
5. Redirects to Dashboard

---

## **STEP 6: Platform Integrations Setup**

### 6A: Meta Ads (Facebook/Instagram)

#### Get Meta Access Token

1. **Create Meta App**
   - Go to https://developers.facebook.com/apps
   - Click "Create App"
   - App Type: "Business"
   - App Name: "MarketingOS Test"

2. **Add Products**
   - In app dashboard, add "Marketing API"

3. **Generate Token**
   - Go to Tools → Access Token Debugger
   - Or use Meta Graph API Explorer
   - Create access token with permissions:
     - `ads_management`
     - `instagram_basic`
     - `pages_read_engagement`
     - `pages_read_user_content`

4. **Get Page ID & Account ID**
   - Go to https://business.facebook.com
   - Select your page
   - Copy Page ID (shown in URL: facebook.com/pages/xxxxx)
   - Get Ad Account ID (format: `act_1234567890`)

5. **Connect in MarketingOS**
   - Dashboard → Settings (gear icon)
   - Click "Integrations" tab
   - Click "Meta Ads"
   - Paste:
     - **Access Token**: Your token
     - **Ad Account ID**: `act_123...`
   - Click "Connect"

---

### 6B: Google Ads

#### Get Google Ads Credentials

1. **Set Up Google Cloud Project**
   - Go to https://console.cloud.google.com
   - Create new project: "MarketingOS"

2. **Enable APIs**
   - Search "Google Ads API"
   - Click Enable
   - Search "Google Analytics Admin API"
   - Click Enable

3. **Create OAuth Consent Screen**
   - Go to "OAuth consent screen"
   - Select "External"
   - Fill in app name, email

4. **Create API Credentials**
   - Go to "Credentials"
   - Create "OAuth 2.0 Client ID"
   - Type: Desktop application
   - Download JSON file
   - Keep for reference

5. **Get Google Ads Customer ID**
   - Go to https://ads.google.com
   - Click gear (Settings)
   - Copy "Account ID" (format: `123-456-7890`)

6. **Connect in MarketingOS**
   - Dashboard → Settings
   - Click "Integrations" tab
   - Click "Google Ads"
   - Paste:
     - **API Key**: From Google Cloud
     - **Customer ID**: Your account ID
   - Click "Connect"

---

### 6C: Instagram (via Facebook Pages)

#### Set Up Instagram Connection

1. **Verify Instagram Account Connected to Facebook**
   - Go to https://business.facebook.com
   - Go to Accounts → Instagram
   - Ensure your Instagram account is connected

2. **Get Instagram Business Account ID**
   - Go to https://business.instagram.com/settings
   - Copy your Business Account ID

3. **Use Same Meta Access Token from 6A**
   - Already configured if you did Meta Ads

4. **Connect in MarketingOS**
   - Dashboard → Settings
   - Click "Integrations" tab
   - Click "Instagram"
   - Paste:
     - **Access Token**: Same as Meta Ads
     - **Business Account ID**: Your Instagram ID
   - Click "Connect"

---

### 6D: Google Search Console (Optional)

#### Connect GSC

1. **Verify Website Ownership**
   - Go to https://search.google.com/search-console
   - Add property (your website)
   - Verify ownership (DNS, HTML file, or Google Analytics)

2. **Get API Credentials**
   - Create OAuth 2.0 credentials (same as Google Ads step 4)

3. **Connect in MarketingOS**
   - Dashboard → Settings
   - Click "Integrations" tab
   - Click "Google Search Console"
   - Paste Property URL: `https://yoursite.com`
   - Click "Connect"

---

## **STEP 7: Test Each Team Locally**

### Test Social Media Team

1. **Go to Dashboard**
   - Click "Social Media Marketing" card
   - Or navigate to `/dashboard/social`

2. **View Empty State**
   - Should show "No Posts Yet" message
   - Click "Create Content" or "Chat with Team"

3. **Test Chat**
   - Click "Team Chat"
   - Type: `"Help me create a launch post for my product"`
   - Watch AI agents respond in real-time
   - Multiple agents will give feedback

4. **Create Test Post**
   - Click "Create Content"
   - Fill in:
     - Platform: Instagram
     - Content: Test post content
     - Hashtags: #test #marketingos
   - Save as draft

5. **View Calendar**
   - Click "Content Calendar"
   - Should show draft post

---

### Test Performance Team

1. **Go to Performance Dashboard**
   - `/dashboard/performance`
   - Click "Team Chat"

2. **Test Chat**
   - Type: `"Help me plan my first campaign"`
   - Agents will suggest campaign structure
   - Ask follow-up questions

3. **Test Reports**
   - Click "Reports" tab
   - Shows empty state (no campaigns yet)

---

### Test SEO Team

1. **Go to SEO Dashboard**
   - `/dashboard/seo`
   - Click "Team Chat"

2. **Test Chat**
   - Type: `"How do I start my SEO strategy?"`
   - Agents will provide roadmap

3. **Manage Keywords**
   - Click "Keywords"
   - Add seed keywords manually (for testing)

---

## **STEP 8: Test Activity Log & Notifications**

### View Activity Log
1. Go to any team dashboard
2. Scroll down (if available)
3. Should show all agent actions
4. Shows reasoning and status

### Check Notifications
1. Click notification bell (top right)
2. Should show connection confirmations
3. Click to mark as read

---

## **STEP 9: Test Full User Flow**

### Create Multiple Brands (Optional)
1. Log out: Click Settings → Logout
2. Register new user with different email
3. Go through onboarding
4. Set up different brand
5. Verify both users are isolated

### Test Permissions
- Each user can only see their own data
- Integrations are user-specific

---

## **STEP 10: Monitor & Debug**

### View Database in Prisma Studio
```bash
npx prisma studio
# Opens http://localhost:5555
# Browse all tables, test data
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Make API calls
4. Verify requests/responses

### View Agent Logs
```bash
# Check agent_logs table in database
# Shows every agent action with:
# - Agent name
# - Action taken
# - Reasoning
# - Status (success/error)
# - Timestamp
```

### Enable Debug Logging (Optional)
```env
# Add to .env.local
DEBUG=anthropic:*
```

---

## **TROUBLESHOOTING**

### Issue: "DATABASE_URL not set"
```bash
# Verify .env.local exists in root of marketingos/
# Verify DATABASE_URL line is present and correct
# Restart dev server after changing .env.local
```

### Issue: "ANTHROPIC_API_KEY not valid"
```bash
# Verify key starts with "sk-ant-"
# Check no extra spaces in .env.local
# Verify API key in https://console.anthropic.com/account/keys
```

### Issue: "Cannot connect to database"
```bash
# Verify PostgreSQL is running
# Windows: Check Services (services.msc) → PostgreSQL
# Verify connection string is correct
# Test connection:
psql -U postgres -d marketingos -c "SELECT 1"
```

### Issue: "Port 3000 already in use"
```bash
# Kill process on port 3000:
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port:
npm run dev -- -p 3001
```

### Issue: "Prisma schema mismatch"
```bash
# Regenerate Prisma client:
npx prisma generate

# Reset database (WARNING: deletes all data):
npx prisma migrate reset
```

---

## **TESTING CHECKLIST**

- [ ] Database connection works
- [ ] Register new user
- [ ] Complete onboarding
- [ ] Dashboard loads with all 3 teams
- [ ] Social team chat responds with AI agents
- [ ] Performance team chat responds
- [ ] SEO team chat responds
- [ ] Activity log shows agent actions
- [ ] Notifications appear
- [ ] Create social post (draft)
- [ ] View content calendar
- [ ] Meta Ads connected (optional)
- [ ] Google Ads connected (optional)
- [ ] Instagram connected (optional)
- [ ] Settings page saves brand changes
- [ ] Integrations page shows connected platforms

---

## **READY FOR PUBLIC LAUNCH**

Once all tests pass:

1. **Deploy to Vercel**
   ```bash
   git init
   git add .
   git commit -m "Initial MarketingOS setup"
   vercel
   ```

2. **Set Production Environment Variables**
   - In Vercel dashboard
   - Project Settings → Environment Variables
   - Add all .env.local variables
   - Set DATABASE_URL (production database)
   - Set NEXTAUTH_URL to your domain

3. **Run Production Database Migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Verify Deployment**
   - Test all flows on production
   - Check error logs in Vercel

5. **Make It Live**
   - Update DNS to point to Vercel
   - Announce to users

---

## **LOCAL DEVELOPMENT TIPS**

### Hot Reload
- Changes to `.tsx`, `.ts` files auto-reload
- Changes to `.env.local` require server restart

### Fast Iteration
```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Prisma Studio for DB debugging
npx prisma studio

# Terminal 3: View logs
npm run dev -- --verbose
```

### Testing AI Responses
- Chat with each team frequently
- Try different prompts
- Verify agents pick correct tools
- Check reasoning in logs

### Common Test Prompts

**Social Team:**
- "Create a launch post for our new product"
- "What's our best content type?"
- "Design a content calendar"

**Performance Team:**
- "Plan my first campaign"
- "What budget should I spend?"
- "Optimize my ad spend"

**SEO Team:**
- "Help me start SEO"
- "What keywords should I target?"
- "How do I improve rankings?"

---

## **NEXT: GOING PUBLIC**

Once comfortable locally:
1. Set up production database
2. Deploy to Vercel
3. Configure production env vars
4. Test all flows in production
5. Announce to beta users
6. Monitor error logs
7. Iterate based on feedback

---

**You're ready to test MarketingOS locally! Let me know if you hit any issues.** 🚀
