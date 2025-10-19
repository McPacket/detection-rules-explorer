# Detection Rules Explorer - Complete Setup Guide

## Overview

This guide will help you create a web-based Detection Rules Explorer that:
- Stores threat detection rules in YAML format (one repository)
- Displays them in a searchable, filterable web interface (second repository)
- Automatically updates daily via GitHub Actions
- Hosts for free on GitHub Pages

**Live Demo:** https://mcpacket.github.io/detection-rules-explorer

---

## Prerequisites

- GitHub account
- Git installed and configured
- Node.js v18+ installed
- Terminal/Command line access
- SSH key added to GitHub (recommended) OR GitHub Personal Access Token

---

## Architecture

```
┌─────────────────────────────┐
│  detection-rules (repo)     │
│  YAML rule files            │
└──────────────┬──────────────┘
               │ Git Submodule
               ↓
┌─────────────────────────────┐
│ detection-rules-explorer    │
│                             │
│  prebuild.js → reads YAML   │
│       ↓                     │
│  rules.json (generated)     │
│       ↓                     │
│  React app loads JSON       │
│       ↓                     │
│  GitHub Pages deployment    │
└─────────────────────────────┘
```

**Two Repositories:**
1. `detection-rules` - YAML rule storage (can be private but recommend public)
2. `detection-rules-explorer` - Next.js web interface (must be public for GitHub Pages)

**How it works:**
- Git submodule links the two repos
- Build script converts YAML → JSON at deploy time
- React app loads JSON and provides filtering/search
- GitHub Actions rebuilds daily automatically

---

## Part 1: Initial Setup

### Step 1: Configure Git (One-Time)

```bash
# Set your Git identity
git config --global user.name "Your Name"
git config --global user.email "your.email@company.com"

# Verify
git config --global user.name
git config --global user.email
```

### Step 2: Set up SSH Authentication (Recommended)

```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your.email@company.com"
# Press Enter 3 times (default location, no passphrase)

# Display your public key
cat ~/.ssh/id_ed25519.pub
# Copy the entire output

# Add to GitHub:
# 1. Go to https://github.com/settings/keys
# 2. Click "New SSH key"
# 3. Paste your public key
# 4. Click "Add SSH key"

# Test connection
ssh -T git@github.com
# Should say: "Hi username! You've successfully authenticated..."
```

---

## Part 2: Create Detection Rules Repository

### Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. **Repository name:** `detection-rules`
3. **Description:** "Threat detection rules in YAML format"
4. **Visibility:** **Public** (Important!)
5. **Do NOT** check any initialization boxes
6. Click **Create repository**

### Step 2: Create Local Structure

```bash
# Clone the empty repository
git clone git@github.com:YOUR-USERNAME/detection-rules.git
cd detection-rules

# Create directory structure
mkdir -p rules/windows/{execution,persistence,privilege_escalation,defense_evasion}
mkdir -p rules/linux/{execution,persistence,credential_access}
mkdir -p rules/cloud/{aws,azure,gcp}
mkdir -p rules/network
```

### Step 3: Add Example Rule

See **Artifact: example-rule.yml** for the content to put in:
`rules/windows/execution/suspicious_powershell_encoded.yml`

### Step 4: Create README

See **Artifact: detection-rules-readme.md** for the content to put in:
`README.md`

### Step 5: Push to GitHub

```bash
git add .
git commit -m "Initial detection rules structure"
git branch -M main
git push -u origin main
```

---

## Part 3: Create Detection Rules Explorer

### Step 1: Create Next.js Application

```bash
# Go to your projects directory
cd ~

# Create Next.js app
npx create-next-app@latest detection-rules-explorer

# When prompted:
# ✓ TypeScript? No
# ✓ ESLint? Yes
# ✓ Tailwind CSS? Yes
# ✓ src/ directory? No
# ✓ App Router? Yes
# ✓ Import alias? No

cd detection-rules-explorer
```

### Step 2: Install Dependencies

```bash
npm install lucide-react js-yaml
```

### Step 3: Initialize Git and Add Submodule

```bash
# Initialize git
git init

# Add .gitignore (see Artifact: gitignore)
# Copy content to .gitignore file

# Add detection-rules as submodule (IMPORTANT: use HTTPS for GitHub Actions)
git submodule add https://github.com/YOUR-USERNAME/detection-rules.git rules

# Initialize submodule
git submodule init
git submodule update
```

### Step 4: Create Project Files

Create the following files using the artifacts provided:

1. **scripts/prebuild.js** - See Artifact: prebuild.js
2. **postcss.config.mjs** - See Artifact: postcss.config.mjs
3. **tailwind.config.js** - See Artifact: tailwind.config.js
4. **app/globals.css** - See Artifact: globals.css
5. **next.config.js** - See Artifact: next.config.js
6. **app/layout.js** - See Artifact: layout.js
7. **app/page.js** - See Artifact: page.js (main explorer component)
8. **.github/workflows/deploy.yml** - See Artifact: deploy.yml
9. **README.md** - See Artifact: explorer-readme.md

### Step 5: Update package.json

Edit the `package.json` file and update the "scripts" section:

```json
"scripts": {
  "prebuild": "node scripts/prebuild.js",
  "dev": "npm run prebuild && next dev",
  "build": "npm run prebuild && next build",
  "start": "next start",
  "lint": "next lint"
}
```

Then run:
```bash
npm install
```

### Step 6: Test Locally

```bash
# Test the prebuild script
npm run prebuild

# Should see output like:
# 🔍 Searching for YAML rules...
# 📄 Found X YAML files
# ✅ Successfully parsed X rules

# Start dev server
npm run dev

# Open http://localhost:3000 in browser
# Verify you can see your rules
```

---

## Part 4: Deploy to GitHub

### Step 1: Create Explorer Repository on GitHub

1. Go to https://github.com/new
2. **Repository name:** `detection-rules-explorer`
3. **Description:** "Web interface for exploring threat detection rules"
4. **Visibility:** **Public** (Required for GitHub Pages)
5. **Do NOT** check any initialization boxes
6. Click **Create repository**

### Step 2: Push Your Code

```bash
# Make sure you're in the detection-rules-explorer directory
cd ~/detection-rules-explorer

# Stage all files
git add .

# Commit
git commit -m "Initial commit: Detection Rules Explorer"

# Add remote
git remote add origin git@github.com:YOUR-USERNAME/detection-rules-explorer.git

# Push
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to **Settings** → **Pages**
   (https://github.com/YOUR-USERNAME/detection-rules-explorer/settings/pages)
2. Under **Source**, select **GitHub Actions**
3. Save

### Step 4: Monitor Deployment

1. Go to **Actions** tab
2. Watch "Deploy to GitHub Pages" workflow
3. Wait 2-3 minutes for completion
4. Visit: **https://YOUR-USERNAME.github.io/detection-rules-explorer**

---

## Part 5: Daily Usage

### Adding New Detection Rules

```bash
cd ~/detection-rules

# Create new rule
cat > rules/linux/execution/suspicious_shell_history_clear.yml << 'EOF'
id: rule-2024-002
name: Shell History Cleared
description: Detects when a user clears their shell history
author: Security Team
created: 2024-02-10
updated: 2024-10-19
severity: medium
type: query
domain: endpoint
language: kuery
tactics:
  - defense_evasion
os:
  - linux
  - macos
data_sources:
  - process
  - command_line
use_cases:
  - threat_detection
enabled: true
query: |
  process where process.name in ("bash", "zsh", "sh") and
  process.command_line : ("*history -c*", "*rm *bash_history*")
risk_score: 45
EOF

# Commit and push
git add .
git commit -m "Add shell history clear detection rule"
git push origin main
```

**Explorer will automatically update:**
- **Automatic**: Daily at midnight UTC
- **Manual**: Actions → "Deploy to GitHub Pages" → "Run workflow"

---

## Troubleshooting

### Issue: "Repository not found" during build

**Cause:** detection-rules repository is private

**Solution:** Make it public
1. Go to Settings in detection-rules repo
2. Scroll to "Danger Zone"
3. "Change visibility" → Make Public

### Issue: "404 Not Found" on GitHub Pages

**Solution:**
1. Go to Settings → Pages
2. Ensure Source is "GitHub Actions"
3. Wait for workflow to complete (check Actions tab)

### Issue: Rules not loading (shows error)

**Solution:** Check data file paths in production
- Verify `basePath` in `next.config.js` matches repo name
- Check browser console for errors

### Issue: Submodule not updating

```bash
cd ~/detection-rules-explorer
git submodule update --remote
git add rules
git commit -m "Update rules submodule"
git push origin main
```

---

## Customization

### Change Repository Name

If using different repo name, update `next.config.js`:
```javascript
basePath: isProd ? '/YOUR-REPO-NAME' : '',
```

### Change Branding

Edit `app/page.js`:
- Line ~135: Change header text
- Modify color classes (e.g., `bg-blue-600` → `bg-red-600`)
- Add company logo to header

### Add Custom Filter Fields

In your YAML rules, add new fields:
- `confidence_level`
- `tags`
- `data_source_category`

Prebuild script will automatically create filters.

---

## Rule YAML Format

### Required Fields
- `id`: Unique identifier (e.g., rule-2024-001)
- `name`: Rule name
- `description`: What the rule detects
- `severity`: low, medium, high, critical
- `type`: query, threshold, eql, ml
- `domain`: endpoint, network, cloud, web

### Recommended Fields
- `author`: Who created it
- `created`: Creation date (YYYY-MM-DD)
- `updated`: Last update date (YYYY-MM-DD)
- `os`: Array of operating systems
- `tactics`: MITRE ATT&CK tactics
- `data_sources`: Required data sources
- `use_cases`: Use case tags
- `language`: Query language (kuery, kql, lucene, eql)
- `enabled`: true/false
- `query`: Detection query
- `risk_score`: 0-100

### Example Rule Structure

See **Artifact: example-rule.yml**

---

## Project Structure

```
detection-rules-explorer/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── app/
│   ├── globals.css            # Tailwind styles
│   ├── layout.js              # Root layout
│   └── page.js                # Main explorer component
├── public/
│   └── data/                  # Generated at build time
│       ├── rules.json         # All rules
│       └── index.json         # Filter metadata
├── rules/                     # Git submodule
│   ├── windows/
│   ├── linux/
│   ├── cloud/
│   └── network/
├── scripts/
│   └── prebuild.js            # YAML to JSON converter
├── .gitignore
├── .gitmodules                # Submodule configuration
├── next.config.js             # Next.js configuration
├── package.json
├── postcss.config.mjs
├── tailwind.config.js
└── README.md
```

---

## Quick Reference Commands

```bash
# Add new rule
cd ~/detection-rules
vim rules/category/new-rule.yml
git add . && git commit -m "Add rule" && git push

# Update explorer locally
cd ~/detection-rules-explorer
git submodule update --remote
npm run prebuild
npm run dev

# Deploy changes to explorer
cd ~/detection-rules-explorer
git add . && git commit -m "Update" && git push

# Manual trigger deployment
# Go to GitHub Actions → Deploy to GitHub Pages → Run workflow
```

---

## Success Checklist

- [ ] Git configured with username and email
- [ ] SSH key added to GitHub
- [ ] detection-rules repo created and **PUBLIC**
- [ ] detection-rules-explorer repo created and **PUBLIC**
- [ ] GitHub Pages enabled (Source: GitHub Actions)
- [ ] Local dev works (`npm run dev`)
- [ ] Site deployed and accessible
- [ ] Rules are visible on website
- [ ] Filters and search working
- [ ] Can add new rules and see them update

---

## Support Resources

- **GitHub Pages Docs:** https://docs.github.com/en/pages
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **MITRE ATT&CK:** https://attack.mitre.org/

---

## Conclusion

You now have a fully functional Detection Rules Explorer that:
✅ Stores rules in version-controlled YAML
✅ Displays them in a beautiful web interface
✅ Updates automatically daily
✅ Hosts for free on GitHub Pages
✅ Scales to thousands of rules
✅ Enables team collaboration

**Next Steps:**
1. Add more detection rules to your collection
2. Customize the UI with your company branding
3. Share the explorer URL with your security team
4. Set up PR workflows for rule contributions

---

**Document Version:** 1.0  
**Last Updated:** October 2024  
**Tested With:** Next.js 14.2, Node.js 18+, GitHub Actions