<div align="center">
  <h1>🚀 Codexier</h1>
  <p><strong>Enterprise Marketplace Platform for Software Development Services</strong></p>
  <p>A proprietary full-stack SaaS application for managing software development projects.</p>
  
  ![React](https://img.shields.io/badge/React-18-blue?logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
  ![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)
  ![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)
  ![Private](https://img.shields.io/badge/Status-Private-red)
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
| **Analytics** | Vercel Speed Insights |

---

## 🚀 Development Setup

> **Note:** This is a private proprietary project. Access is restricted to authorized team members only.

### Prerequisites
- Node.js 18+ installed
- Supabase account with project access
- Git configured with repository access

### Environment Configuration
Create `.env.local` file with required credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Installation
```bash
npm install
```

### Database Setup
Run the SQL scripts in order:
1. [supabase_schema.sql](./supabase_schema.sql)
2. [CRITICAL_FIX_RUN_THIS.sql](./CRITICAL_FIX_RUN_THIS.sql)
3. [MESSAGING_FINAL_FIX.sql](./MESSAGING_FINAL_FIX.sql)

### Development Server
```bash
npm run dev
```

---

## 🔐 Access Credentials

See [CREDENTIALS.md](./CREDENTIALS.md) for test accounts (internal use only).

---

## 📚 Internal Documentation

- **[GITHUB_GUIDE.md](./GITHUB_GUIDE.md)** - Git workflow guide
- **[TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)** - System design
- **[CREDENTIALS.md](./CREDENTIALS.md)** - Test credentials

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

## 🚀 Deployment

Deployed automatically via Vercel on push to `main` branch.

### Manual Build
```bash
npm run build
```
Output: `dist/` directory

---

## 📝 License & Copyright

**© 2026 Codexier. All Rights Reserved.**

This is proprietary software developed for Codexier's internal operations. Unauthorized copying, distribution, modification, or use of this software, via any medium, is strictly prohibited without explicit written permission from Codexier.

---

## 👨‍💻 Owner

**Jamshaid**  
Founder & Lead Developer  
GitHub: [@jamshaid11601](https://github.com/jamshaid11601)

---

<div align="center">
  <p><strong>Codexier - Building Dreams Through Code</strong></p>
  <p>Built with ❤️ using React, TypeScript, and Supabase</p>
</div>
