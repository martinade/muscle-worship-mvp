# Muscle Worship Platform

A Next.js application with Supabase backend for the Muscle Worship platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server with auto-diagnostics
npm run dev:watch

# Or standard dev server
npm run dev
```

## 🔧 Automated Diagnostics

This project includes an automated diagnostics system that detects and fixes common issues:

```bash
# Run diagnostics
npm run diagnose

# Auto-detect and suggest fixes
npm run diagnose:auto

# Auto-fix router issues (404 errors)
npm run fix:router

# Free port 3000
npm run fix:port
```

**See:** [Troubleshooting Guide](docs/troubleshooting/README.md)

## 📚 Documentation

- [Setup Guide](docs/setup/)
- [Troubleshooting](docs/troubleshooting/)
  - [Auto-Diagnostics](docs/troubleshooting/AUTO_DIAGNOSTICS.md)
  - [Quick Start](docs/troubleshooting/QUICK_START.md)
  - [Solutions Database](docs/troubleshooting/solutions/)
- [Testing](docs/testing/)

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:watch` | Start dev server with auto-diagnostics |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run diagnose` | Run full diagnostics |
| `npm run diagnose:quick` | Quick diagnostic check |
| `npm run diagnose:auto` | Auto-detect and suggest fixes |
| `npm run fix:router` | Auto-fix router configuration |
| `npm run fix:port` | Free port 3000 |

## 🏗️ Project Structure

```
.
├── src/
│   ├── app/              # Next.js App Router
│   ├── pages/            # Next.js Pages Router (API routes)
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   └── styles/           # Global styles
├── supabase/
│   └── migrations/       # Database migrations
├── scripts/
│   ├── diagnose.sh       # Diagnostic script
│   ├── auto-diagnose.js  # Auto-diagnostic system
│   └── fix-router.sh     # Router auto-fix
└── docs/
    ├── setup/
    ├── testing/
    └── troubleshooting/  # Troubleshooting guides
```

## 🐛 Troubleshooting

Got an error? The system will automatically detect and help fix it!

**Manual troubleshooting:**

1. Run diagnostics: `npm run diagnose`
2. Check the output for ❌ or ⚠️
3. Follow the suggested solution
4. Or check: [docs/troubleshooting/solutions/](docs/troubleshooting/solutions/)

**Common issues:**

- **404 errors:** `npm run fix:router`
- **Port in use:** `npm run fix:port`
- **Module errors:** Check import paths

## 🔐 Environment Variables

Required environment variables (set in Tempo project settings):

- `SUPABASE_PROJECT_ID`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `SENDGRID_API_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY`

## 🧪 Testing

```bash
# Run test scripts
node test-register-user.js
node test-creator-profile-setup.js
node test-payment-simulation.js
```

See [Testing Documentation](docs/testing/) for details.

## 📝 Contributing

When you encounter and solve a new issue:

1. Document it in `docs/troubleshooting/solutions/`
2. Add error pattern to `scripts/auto-diagnose.js`
3. Create auto-fix if possible
4. Update the README

## 🎯 Features

- ✅ User authentication (fans and creators)
- ✅ Wallet system with transactions
- ✅ Stripe payment integration
- ✅ KYC verification
- ✅ Media upload (photos/videos)
- ✅ Creator tiers
- ✅ Automated diagnostics
- ✅ Auto-fix common issues

## 📄 License

[Your License Here]

---

**Need help?** Check the [troubleshooting guide](docs/troubleshooting/README.md) or run `npm run diagnose`
