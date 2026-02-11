<div align="center">
  <h1>🚀 Codexier</h1>
  <p><strong>Enterprise Marketplace Platform for Software Development Services</strong></p>
  <p>A full-stack SaaS application with dedicated portals for Clients, Freelancers, and Administrators.</p>
  
  ![React](https://img.shields.io/badge/React-18-blue?logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
  ![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)
  ![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)
</div>

---

## ✨ Features

### 👤 Client Portal
- Browse curated software development services
- Submit custom project requests
- Real-time messaging with admin team
- Project tracking with visual progress indicators
- Secure checkout and payment processing

### 👨‍💼 Admin Dashboard
- Manage all projects via Kanban board
- Approve and price custom requests
- Client communication hub
- Service catalog management
- Financial overview and reporting

### 🎨 Design Philosophy
- **Modern UI/UX**: Clean, professional interface with smooth animations
- **Responsive**: Fully optimized for desktop and mobile
- **Type-Safe**: Built with TypeScript for reliability
- **Real-time**: Live updates via Supabase subscriptions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **Backend** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Deployment** | Vercel |
| **CI/CD** | GitHub Actions |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Git installed

### 1️⃣ Clone Repository
```bash
git clone https://github.com/jamshaid11601/cdx1.git
cd cdx1
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment
Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

Add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4️⃣ Set Up Database
1. Go to Supabase SQL Editor
2. Run [supabase_schema.sql](./supabase_schema.sql)
3. Run [CRITICAL_FIX_RUN_THIS.sql](./CRITICAL_FIX_RUN_THIS.sql)
4. Run [MESSAGING_FINAL_FIX.sql](./MESSAGING_FINAL_FIX.sql)

### 5️⃣ Create Admin Account
1. Sign up with: `admin@codexier.com` / `Admin@123456`
2. Run [setup_admin.sql](./setup_admin.sql) in Supabase

### 6️⃣ Run Development Server
```bash
npm run dev
```

Visit: `http://localhost:5173`

---

## 🔐 Login Credentials

See [CREDENTIALS.md](./CREDENTIALS.md) for test accounts.

---

## 📚 Documentation

- **[GITHUB_GUIDE.md](./GITHUB_GUIDE.md)** - Git workflow for beginners
- **[TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)** - System design
- **[CREDENTIALS.md](./CREDENTIALS.md)** - Test login credentials

---

## 🤝 Contributing

### Branching Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes

### Workflow
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: Add my feature"

# Push to GitHub
git push origin feature/my-feature

# Create Pull Request on GitHub
```

See [GITHUB_GUIDE.md](./GITHUB_GUIDE.md) for detailed instructions.

---

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to `main`

### Manual Build
```bash
npm run build
```
Output: `dist/` directory

---

## 📁 Project Structure

```
codexier/
├── components/          # React components
│   ├── admin/          # Admin dashboard
│   ├── client/         # Client portal
│   ├── public/         # Public pages
│   └── shared/         # Shared components
├── contexts/           # React contexts
├── lib/                # Supabase client
├── .github/            # CI/CD workflows
└── *.sql              # Database scripts
```

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Issues
- Ensure all SQL scripts are run in order
- Check RLS policies in Supabase
- Verify environment variables

### Auth Problems
- Clear browser cache and cookies
- Check Supabase Auth settings
- Verify email confirmation settings

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 👨‍💻 Author

**Jamshaid**
- GitHub: [@jamshaid11601](https://github.com/jamshaid11601)

---

<div align="center">
  <p>Built with ❤️ using React, TypeScript, and Supabase</p>
</div>
