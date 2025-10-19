# Detection Rules Explorer

A web-based interface for exploring and searching threat detection rules.

## 🌐 Live Site

Visit: https://mcpacket.github.io/detection-rules-explorer

## 🏗️ Architecture

- **Frontend**: Next.js with React and Tailwind CSS
- **Rules**: YAML files from [detection-rules](https://github.com/mcpacket/detection-rules) repository
- **Deployment**: GitHub Pages with automated daily updates
- **Build Process**: Pre-build script converts YAML → JSON

## 🚀 Local Development
```bash
# Clone with submodules
git clone --recursive https://github.com/mcpacket/detection-rules-explorer.git
cd detection-rules-explorer

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Project Structure
```
detection-rules-explorer/
├── .github/workflows/     # GitHub Actions
├── app/                   # Next.js app
│   └── page.js           # Main explorer component
├── public/data/          # Generated JSON (build-time)
├── rules/                # Git submodule (detection-rules)
├── scripts/
│   └── prebuild.js       # YAML to JSON converter
└── next.config.js        # Next.js configuration
```

## 🔄 How It Works

1. Rules are stored as YAML in the `detection-rules` repository
2. Pre-build script converts YAML → JSON
3. React app loads JSON and provides filtering/search
4. GitHub Actions rebuilds daily to fetch latest rules

## 📦 Adding New Rules

Rules are maintained in the separate [detection-rules](https://github.com/mcpacket/detection-rules) repository.

To update rules locally:
```bash
git submodule update --remote
npm run prebuild
npm run dev
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

Apache-2.0
