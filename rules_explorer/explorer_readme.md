# Detection Rules Explorer

A web-based interface for exploring and searching threat detection rules.

## 🌐 Live Site

**Visit:** https://YOUR-USERNAME.github.io/detection-rules-explorer

## ✨ Features

- 🔍 **Real-time Search** - Search by rule name, description, or ID
- 🎯 **Multi-faceted Filtering** - Filter by domain, type, OS, tactics, severity, and more
- 📊 **Rule Statistics** - See rule counts for each filter category
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Severity Color Coding** - Visual indicators for rule severity levels
- 📝 **Detailed Rule View** - Click any rule to see full details including queries
- 🔄 **Automatic Updates** - Rebuilds daily to fetch latest rules

## 🏗️ Architecture

- **Frontend**: Next.js 14 with React and Tailwind CSS
- **Rules Source**: YAML files from [detection-rules](https://github.com/YOUR-USERNAME/detection-rules) repository
- **Deployment**: GitHub Pages with automated CI/CD
- **Build Process**: Pre-build script converts YAML → JSON at deploy time

## 📦 Technology Stack

- **Framework**: Next.js 14 (App Router, Static Export)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Format**: JSON (converted from YAML)
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions

## 🚀 Local Development

### Prerequisites
- Node.js 18+ installed
- Git installed
- npm or yarn package manager

### Setup

```bash
# Clone the repository with submodules
git clone --recursive https://github.com/YOUR-USERNAME/detection-rules-explorer.git
cd detection-rules-explorer

# Install dependencies
npm install

# Generate data files from YAML rules
npm run prebuild

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development Scripts

```bash
# Generate JSON from YAML rules
npm run prebuild

# Start dev server (with prebuild)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## 📁 Project Structure

```
detection-rules-explorer/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── app/
│   ├── globals.css            # Tailwind CSS styles
│   ├── layout.js              # Root layout component
│   └── page.js                # Main explorer component
├── public/
│   └── data/                  # Generated at build time
│       ├── rules.json         # All parsed rules
│       └── index.json         # Filter metadata
├── rules/                     # Git submodule (detection-rules repo)
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
├── postcss.config.mjs         # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── README.md
```

## 🔄 How It Works

1. **Rules Storage**: Detection rules are stored as YAML files in the separate [detection-rules](https://github.com/YOUR-USERNAME/detection-rules) repository
2. **Git Submodule**: The rules repository is linked as a git submodule in the `rules/` directory
3. **Build Process**: During deployment, `prebuild.js` script:
   - Reads all YAML files from the submodule
   - Parses them into JavaScript objects
   - Builds filter indexes
   - Generates `rules.json` and `index.json` files
4. **React App**: The Next.js app loads these JSON files and provides:
   - Search functionality
   - Multi-faceted filtering
   - Rule detail views
5. **Deployment**: GitHub Actions automatically:
   - Pulls latest rules from the submodule
   - Runs the build process
   - Deploys to GitHub Pages
   - Runs daily at midnight UTC

## 📝 Adding New Rules

Rules are managed in the separate [detection-rules](https://github.com/YOUR-USERNAME/detection-rules) repository.

### To add a new rule:

1. Navigate to the detection-rules repository
2. Create a new YAML file in the appropriate directory
3. Follow the rule format (see detection-rules README)
4. Commit and push your changes
5. The explorer will automatically update within 24 hours (or trigger manual deployment)

### Manual Update

To trigger an immediate update:
1. Go to [Actions tab](https://github.com/YOUR-USERNAME/detection-rules-explorer/actions)
2. Click "Deploy to GitHub Pages"
3. Click "Run workflow"
4. Wait 2-3 minutes for deployment

## 🛠️ Customization

### Change Repository Name

If you use a different repository name, update `next.config.js`:

```javascript
basePath: isProd ? '/YOUR-REPO-NAME' : '',
assetPrefix: isProd ? '/YOUR-REPO-NAME/' : '',
```

### Branding

Edit `app/page.js` to customize:
- Header title and subtitle
- Color scheme (CSS classes)
- Company logo

### Add Custom Filters

Add new fields to your YAML rules and they'll automatically appear as filters:
- `confidence_level`
- `data_source_category`
- `tags`
- Custom taxonomies

## 🔧 Troubleshooting

### Rules not updating

```bash
# Update submodule manually
git submodule update --remote
npm run prebuild
```

### Build fails in GitHub Actions

- Check that detection-rules repository is **public**
- Verify submodule URL in `.gitmodules` uses HTTPS
- Check Actions logs for specific errors

### 404 on GitHub Pages

- Ensure GitHub Pages is enabled (Settings → Pages)
- Source should be set to "GitHub Actions"
- Wait for workflow to complete

## 📊 Statistics

- **Rules**: Dynamically loaded from submodule
- **Filter Categories**: 8 (domain, type, OS, use cases, tactics, data sources, language, severity)
- **Update Frequency**: Daily automatic + manual trigger
- **Build Time**: ~2-3 minutes
- **Hosting Cost**: Free (GitHub Pages)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Apache-2.0

## 🙏 Acknowledgments

- Inspired by [Elastic Detection Rules Explorer](https://elastic.github.io/detection-rules-explorer/)
- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR-USERNAME/detection-rules-explorer/issues)
- **Documentation**: This README
- **Rules Repository**: [detection-rules](https://github.com/YOUR-USERNAME/detection-rules)

---

**Built with ❤️ for security teams**