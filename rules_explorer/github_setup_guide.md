# Detection Rules Explorer - GitHub Setup Guide

## 🚀 Quick Start Overview

You'll create two repositories:
1. **detection-rules** - YAML rule files (can be private)
2. **detection-rules-explorer** - Next.js web interface (public for GitHub Pages)

---

## 📦 Part 1: Create the Rules Repository

### Step 1: Create Rules Repo on GitHub

```bash
# On GitHub.com, create a new repository named "detection-rules"
# Initialize with README, choose license (Apache-2.0 recommended)
```

### Step 2: Clone and Setup Locally

```bash
# Clone your new repository
git clone https://github.com/YOUR-USERNAME/detection-rules.git
cd detection-rules

# Create directory structure
mkdir -p rules/{windows,linux,macos,cloud,network}
mkdir -p rules/windows/{execution,persistence,privilege_escalation,defense_evasion}
mkdir -p rules/linux/{execution,persistence,credential_access}
mkdir -p rules/cloud/{aws,azure,gcp}
```

### Step 3: Add Example Rules

```bash
# Create your first rule
cat > rules/windows/execution/suspicious_powershell_encoded.yml << 'EOF'
id: rule-2024-001
name: Suspicious PowerShell Execution with Encoded Commands
description: Detects PowerShell execution with encoded commands
author: Security Team
created: 2024-01-15
updated: 2024-10-15
severity: high
type: query
domain: endpoint
language: kuery
tactics:
  - execution
  - defense_evasion
os:
  - windows
data_sources:
  - process
  - command_line
use_cases:
  - threat_detection
  - malware_detection
enabled: true
EOF

# Add more rules as needed
```

### Step 4: Create README for Rules Repo

```bash
cat > README.md << 'EOF'
# Detection Rules

This repository contains threat detection rules in YAML format.

## 📁 Structure

```
rules/
├── windows/         # Windows-specific rules
│   ├── execution/
│   ├── persistence/
│   └── ...
├── linux/           # Linux-specific rules
├── macos/           # macOS-specific rules
├── cloud/           # Cloud platform rules
│   ├── aws/
│   ├── azure/
│   └── gcp/
└── network/         # Network-based rules
```

## 🔍 Rule Format

Each rule must include:
- `id`: Unique identifier
- `name`: Rule name
- `description`: What the rule detects
- `severity`: low, medium, high, critical
- `type`: query, threshold, eql, ml
- `domain`: endpoint, network, cloud, web
- `os`: Array of operating systems
- `tactics`: MITRE ATT&CK tactics
- `data_sources`: Required data sources

## 🌐 Explorer

View all rules at: https://YOUR-USERNAME.github.io/detection-rules-explorer
EOF
```

### Step 5: Push to GitHub

```bash
git add .
git commit -m "Initial rules structure and examples"
git push origin main
```

---

## 🌐 Part 2: Create the Explorer Web Interface

### Step 1: Create Explorer Repo on GitHub

```bash
# On GitHub.com, create "detection-rules-explorer"
# Make it PUBLIC (required for GitHub Pages)
# Don't initialize with README (we'll create it)
```

### Step 2: Setup Next.js Project Locally

```bash
# Create Next.js app
npx create-next-app@latest detection-rules-explorer

# When prompted, choose:
# ✓ TypeScript? No
# ✓ ESLint? Yes
# ✓ Tailwind CSS? Yes
# ✓ src/ directory? No
# ✓ App Router? Yes
# ✓ Import alias? No

cd detection-rules-explorer
```

### Step 3: Install Dependencies

```bash
npm install lucide-react js-yaml
```

### Step 4: Add Rules as Git Submodule

```bash
# Add your rules repo as a submodule
git submodule add https://github.com/YOUR-USERNAME/detection-rules.git rules

# Initialize and update
git submodule init
git submodule update
```

### Step 5: Create Project Structure

```bash
# Create necessary directories
mkdir -p scripts
mkdir -p public/data

# Create the prebuild script
cat > scripts/prebuild.js << 'EOF'
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const RULES_DIR = path.join(__dirname, '../rules');
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const RULES_OUTPUT = path.join(OUTPUT_DIR, 'rules.json');
const INDEX_OUTPUT = path.join(OUTPUT_DIR, 'index.json');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function findYamlFiles(dir) {
  let yamlFiles = [];
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      yamlFiles = yamlFiles.concat(findYamlFiles(filePath));
    } else if (file.endsWith('.yml') || file.endsWith('.yaml')) {
      yamlFiles.push(filePath);
    }
  });

  return yamlFiles;
}

function parseRuleFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const rule = yaml.load(content);
    rule.id = rule.id || path.basename(filePath, path.extname(filePath));
    rule.file_path = path.relative(RULES_DIR, filePath);
    return rule;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

function buildFilterIndex(rules) {
  const index = {
    total_rules: rules.length,
    filters: {}
  };

  const filterFields = [
    'domain', 'type', 'os', 'use_cases', 'tactics', 
    'data_sources', 'language', 'severity'
  ];

  filterFields.forEach(field => {
    const values = new Set();
    
    rules.forEach(rule => {
      const value = rule[field];
      if (Array.isArray(value)) {
        value.forEach(v => values.add(v));
      } else if (value) {
        values.add(value);
      }
    });

    index.filters[field] = Array.from(values).sort().map(value => ({
      value,
      count: rules.filter(rule => {
        const ruleValue = rule[field];
        if (Array.isArray(ruleValue)) {
          return ruleValue.includes(value);
        }
        return ruleValue === value;
      }).length
    }));
  });

  return index;
}

async function processRules() {
  console.log('🔍 Searching for YAML rules...');
  
  if (!fs.existsSync(RULES_DIR)) {
    console.error(`❌ Rules directory not found: ${RULES_DIR}`);
    process.exit(1);
  }

  const yamlFiles = findYamlFiles(RULES_DIR);
  console.log(`📄 Found ${yamlFiles.length} YAML files`);

  const rules = yamlFiles
    .map(parseRuleFile)
    .filter(rule => rule !== null);

  console.log(`✅ Successfully parsed ${rules.length} rules`);

  const index = buildFilterIndex(rules);

  fs.writeFileSync(RULES_OUTPUT, JSON.stringify(rules, null, 2));
  fs.writeFileSync(INDEX_OUTPUT, JSON.stringify(index, null, 2));

  console.log(`✨ Done! Generated files in ${OUTPUT_DIR}`);
}

processRules().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
EOF
```

### Step 6: Update package.json

```bash
# Edit package.json and add to scripts section:
cat > package.json.new << 'EOF'
{
  "name": "detection-rules-explorer",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "prebuild": "node scripts/prebuild.js",
    "dev": "npm run prebuild && next dev",
    "build": "npm run prebuild && next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "js-yaml": "^4.1.0",
    "lucide-react": "^0.263.1",
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.0.1",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.3.0"
  }
}
EOF

mv package.json.new package.json
npm install
```

### Step 7: Replace app/page.js with Explorer Component

```bash
# Copy the React component from the artifact into app/page.js
# (Use the updated version with data loading from JSON files)
```

### Step 8: Configure for GitHub Pages

```bash
# Create next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/detection-rules-explorer',
  assetPrefix: '/detection-rules-explorer/',
}

module.exports = nextConfig
EOF
```

### Step 9: Create GitHub Actions Workflow

```bash
mkdir -p .github/workflows

cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
  workflow_dispatch:  # Allow manual triggers

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          submodules: recursive
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Update submodules (fetch latest rules)
        run: |
          git submodule update --remote --merge
      
      - name: Build application
        run: npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './out'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
EOF
```

### Step 10: Create README

```bash
cat > README.md << 'EOF'
# Detection Rules Explorer

A web-based interface for exploring and searching threat detection rules.

## 🌐 Live Site

Visit: https://YOUR-USERNAME.github.io/detection-rules-explorer

## 🏗️ Architecture

- **Frontend**: Next.js with React and Tailwind CSS
- **Rules**: YAML files from [detection-rules](https://github.com/YOUR-USERNAME/detection-rules) repository
- **Deployment**: GitHub Pages with automated daily updates

## 🚀 Local Development

```bash
# Clone with submodules
git clone --recursive https://github.com/YOUR-USERNAME/detection-rules-explorer.git
cd detection-rules-explorer

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Adding New Rules

Rules are stored in the separate [detection-rules](https://github.com/YOUR-USERNAME/detection-rules) repository.

To update rules locally:
```bash
git submodule update --remote
npm run prebuild
```

## 🔄 Updates

The site automatically rebuilds daily at midnight UTC to fetch the latest rules.

## 📄 License

Apache-2.0
EOF
```

### Step 11: Initial Commit and Push

```bash
git add .
git commit -m "Initial detection rules explorer"
git push origin main
```

---

## ⚙️ Part 3: Configure GitHub Pages

### Step 1: Enable GitHub Pages

1. Go to your `detection-rules-explorer` repository on GitHub
2. Click **Settings** > **Pages**
3. Under **Source**, select **GitHub Actions**
4. Wait for the Action to complete (check **Actions** tab)

### Step 2: Verify Deployment

After the GitHub Action completes:
- Visit: `https://YOUR-USERNAME.github.io/detection-rules-explorer`
- You should see your detection rules explorer!

---

## 🔄 Part 4: Daily Workflow

### Adding New Rules

```bash
# Navigate to rules repo
cd detection-rules

# Create new rule
vim rules/windows/execution/new_rule.yml

# Commit and push
git add .
git commit -m "Add new detection rule"
git push

# The explorer will automatically update within 24 hours
# Or trigger manual update in GitHub Actions
```

### Manual Update

1. Go to `detection-rules-explorer` repo on GitHub
2. Click **Actions** tab
3. Select **Deploy to GitHub Pages** workflow
4. Click **Run workflow** > **Run workflow**

---

## 🐛 Troubleshooting

### Rules Not Showing Up

```bash
# Update submodule locally
cd detection-rules-explorer
git submodule update --remote
npm run prebuild
npm run dev

# If working locally, commit the submodule update
git add rules
git commit -m "Update rules submodule"
git push
```

### Build Fails

Check the GitHub Actions logs:
1. Go to **Actions** tab
2. Click the failed workflow
3. Check error messages

Common issues:
- Missing `js-yaml` dependency
- Invalid YAML syntax in rules
- Permission issues with GitHub Pages

### 404 Error on GitHub Pages

Make sure:
- Repository is **public**
- GitHub Pages is set to **GitHub Actions** source
- `basePath` in `next.config.js` matches your repo name

---

## 📊 Repository Structure

```
detection-rules-explorer/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── app/
│   ├── layout.js
│   └── page.js                 # Main explorer component
├── public/
│   └── data/                   # Generated at build time
│       ├── rules.json
│       └── index.json
├── rules/                      # Git submodule
│   ├── windows/
│   ├── linux/
│   └── ...
├── scripts/
│   └── prebuild.js             # YAML to JSON converter
├── next.config.js
├── package.json
└── README.md
```

---

## 🎉 You're Done!

Your detection rules explorer is now:
- ✅ Live on GitHub Pages
- ✅ Automatically updating daily
- ✅ Loading rules from your YAML files
- ✅ Searchable and filterable

Next steps:
- Add more detection rules
- Customize the UI theme
- Add analytics
- Create rule templates
- Build a CI/CD pipeline for rule validation
