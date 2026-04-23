# 🍽️ SmartCanteen

> Skip the queue. Order smart. Never waste food again.

SmartCanteen is a comprehensive digital ordering platform for college and institutional canteens, combining Real-time crowd management, AI-powered recommendations, and gamified loyalty rewards to eliminate queues and reduce food wastage.

---

## 🎯 Problem Statement

Students waste 20-40 minutes daily standing in canteen queues during lunch breaks. This time loss, combined with overstocking, food wastage, and poor crowd distribution, creates an inefficient system that frustrates both students and canteen administrators. Additionally, there's no transparency about wait times, no way to pre-plan purchases, and no incentives for early/off-peak ordering.

---

## ✨ Solution

SmartCanteen provides an end-to-end digital solution that lets students:
- **Browse & order** items from their phone in seconds
- **See real-time crowd levels** for each pickup slot
- **Get AI-powered recommendations** based on available items and wait times
- **Earn mess points** for every order, redeemable as free meals
- **Skip queues** with digital QR code coupons
- **Track orders** from "Placed" to "Ready"
- **Compete on leaderboards** for streaks and top orders

Administrators gain:
- **Real-time order dashboard** with crowd heatmaps
- **AI demand forecasting** for better inventory planning
- **Order management** with confirmation & status updates
- **Analytics & insights** on peak times and preferences
- **Instant admin controls** for menu updates and promotions

---

## 🚀 Key Features

### 👨‍🎓 Student Portal
- ✅ **Browse Menu** — Categorized items with images, prices, descriptions
- ✅ **Smart Cart** — Add/remove items with live quantity controls
- ✅ **Checkout** — AI-powered pickup slot recommendations
- ✅ **QR Coupon** — Digital proof of purchase for instant collection
- ✅ **Mess Points** — Earn points per rupee, track progress toward free meals
- ✅ **Leaderboard** — See top spenders with podium UI and streak badges
- ✅ **Order History** — Timeline tracking from "Placed" → "Ready" → "Picked Up"
- ✅ **Gamification** — 5 unlockable badges (First Order, 5-Day Streak, Points Milestones, Meal Variety)
- ✅ **Dark Mode** — Eye-friendly theme toggle
- ✅ **Mobile Offline-Ready** — PWA installable on home screen

### 👨‍💼 Admin Portal
- ✅ **Live Dashboard** — Order count, crowd distribution, system status
- ✅ **Menu Management** — Add/edit/delete items with inventory tracking
- ✅ **Order Management** — View, confirm, mark ready, multi-filter
- ✅ **Crowd Monitor** — Real-time heatmap of pickup slot congestion
- ✅ **AI Analytics** — Claude AI predicts tomorrow's demand by category
- ✅ **Real-time Notifications** — Socket-based alerts for new orders
- ✅ **Print Orders** — Clean PDF/print layout for kitchen display
- ✅ **Settings** — Canteen hours, messaging, system configuration

### 🤖 AI Features (Powered by Claude Sonnet 4)
1. **AI Slot Recommender**
   - Analyzes current menu, cart items, & crowd per slot
   - Recommends fastest pickup slot with reasoning
   - Auto-selects recommended slot in checkout
   - Shows "Powered by Claude AI ✨" label

2. **AI Demand Forecast**
   - Predicts tomorrow's order volume per menu category
   - Considers day-of-week patterns & historical data
   - Shows confidence bars & trend arrows (↑↓→)
   - Recommends focus items for prep

3. **AI Menu Search**
   - Natural language search: e.g., "filling under ₹60"
   - Returns matching items with reasoning
   - Shows "AI Pick" badge on results
   - Includes helpful tips

### 🎮 Gamification & Engagement
- **Mess Points System** — Earn 1 point per rupee, visual progress ring
- **Streaks** — Consecutive order days = bonus points
- **Achievements** — 5 badges unlock over time (🥇 First Order, 🔥 5-Day Streak, 💫 50 Points, 🌟 100 Legend, 🍽️ Variety)
- **Leaderboard** — Weekly/monthly rankings with podium UI
- **Notifications** — Toast alerts for streak milestones & new orders

### 🔔 Real-Time Features
- **Crowd Widget** — 30-second auto-refresh, shows busy slots with wait estimates
- **Countdown Timer** — Animated timer to canteen opening (12:00 PM)
- **Live Order Updates** — Status transitions with colored dots & checkmarks
- **Notification Bell** — New order count badge in admin navbar
- **Admin Polling** — 10s check for new orders, 15s dashboard auto-refresh

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| **Frontend** | React 18 | UI library with hooks |
| | Vite | Fast build tooling |
| | Tailwind CSS | Utility-first styling |
| | React Router v6 | Client-side routing |
| | Zustand (via Context) | State management |
| **Backend** | Node.js + Express | REST API server |
| | JSON (localStorage) | Mock client-side DB |
| | CORS | Cross-origin requests |
| **AI** | Claude Sonnet 4 | LLM for recommendations, forecasting, search |
| | Anthropic API | REST + JSON payloads |
| **Storage** | localStorage | Persistent client storage |
| | sessionStorage | Temporary per-session data |
| **Deployment** | Vercel | Frontend hosting |
| | Render / Railway | Backend hosting |
| | PWA Manifest | Mobile installability |

---

## 📋 Getting Started

### Prerequisites
- **Node.js** 16+
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/smartcanteen.git
cd smartcanteen
```

2. **Install dependencies:**

Backend:
```bash
cd server
npm install
```

Frontend:
```bash
cd ../client
npm install
```

3. **Create `.env` files:**

`server/.env`:
```
PORT=5000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

`client/.env.local`:
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=SmartCanteen
VITE_ENABLE_DEMO_MODE=true
VITE_ENABLE_PWA=true
```

### Running Locally

**Terminal 1 — Backend:**
```bash
cd server
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

**Open browser:** http://localhost:5173

### Demo Credentials

**Student Login:**
- Username: `demo_student`
- Password: `demo123`
- Or click "🎮 Try Demo" on landing to auto-load demo data

**Admin Login:**
- Username: `admin`
- Password: `12345678`

---

## 📁 Project Structure

```
smartcanteen/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Header with dark mode & PWA install
│   │   │   ├── ErrorBoundary.jsx   # Global error handler
│   │   │   ├── SkeletonCard.jsx    # Loading skeletons
│   │   │   ├── PageLoader.jsx      # Full-page loader
│   │   │   ├── StudentLayout.jsx   # Student portal frame
│   │   │   ├── AdminLayout.jsx     # Admin portal frame
│   │   │   └── MobileBottomNav.jsx # Mobile footer nav
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # Hero + features + CTA
│   │   │   ├── LoginPage.jsx       # Auth with demo shortcuts
│   │   │   ├── NotFoundPage.jsx    # 404 friendly page
│   │   │   ├── StudentDashboard.jsx # Crowd widget + stats
│   │   │   ├── MenuPage.jsx        # Browse + AI search toggle
│   │   │   ├── CheckoutPage.jsx    # Cart + AI slot recommender
│   │   │   ├── OrderSuccessPage.jsx # QR code + animations
│   │   │   ├── MyOrdersPage.jsx    # Order history + timeline
│   │   │   ├── MessPointsPage.jsx  # Points ring + badges
│   │   │   ├── student/
│   │   │   │   └── LeaderboardPage.jsx # Podium + rankings
│   │   │   └── admin/
│   │   │       ├── AdminDashboardPage.jsx
│   │   │       ├── AdminMenuPage.jsx
│   │   │       ├── AdminOrdersPage.jsx
│   │   │       ├── AdminCrowdPage.jsx
│   │   │       ├── AdminAnalyticsPage.jsx # AI forecast
│   │   │       └── AdminSettingsPage.jsx
│   │   ├── utils/
│   │   │   ├── storage.js          # Safe localStorage wrapper
│   │   │   ├── claudeApi.js        # Claude API with retry + timeout
│   │   │   ├── demoData.js         # Demo mode data generation
│   │   │   └── ... other utils
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── PortalContext.js
│   │   ├── App.jsx                 # Routes with lazy loading
│   │   ├── main.jsx                # ErrorBoundary + providers
│   │   └── index.css               # Animations + micro-interactions
│   ├── index.html                  # PWA meta tags
│   ├── vercel.json                 # Vercel deployment config
│   ├── .env.example                # Environment template
│   ├── manifest.json               # PWA manifest
│   ├── vite.config.js              # Vite config
│   └── package.json
│
├── server/                          # Express backend
│   ├── routes/
│   │   ├── auth.js
│   │   ├── menu.js
│   │   ├── orders.js
│   │   └── admin.js
│   ├── server.js                   # Express app + health check
│   ├── Procfile                    # Render deployment
│   ├── .env (create locally)
│   └── package.json
│
├── DEMO_SCRIPT.md                  # 5-minute presentation guide
├── README.md                       # This file
└── .gitignore
```

---

## 🧪 Testing the App

### Quick Demo Flow (5 mins)
1. Land on homepage → Scroll through features
2. Click "🎮 Try Demo" → Auto-loads 25 mock orders
3. Login as demo_student (auto-filled)
4. See dashboard with live crowd widget
5. Browse menu, toggle AI Search
6. Add items, checkout → AI recommends best slot
7. Payment success → See QR code + confetti
8. Admin login → View orders + AI forecast predictions

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Vercel auto-deploys from GitHub
# Configure environment variables in Vercel dashboard
```

### Backend (Render)
```bash
cd server
# Connect to Render via GitHub
# Add environment variables in Render dashboard
# Vercel will auto-generate FRONTEND_URL secret
```

### Database
Currently uses localStorage (client-side). For production scalability, migrate to:
- MongoDB (data persistence)
- Redis (real-time features)
- Firebase (auth + real-time DB)

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open Pull Request

---

## 📸 Screenshots

[Add screenshots here after deployment]

- Landing Page with stats ticker
- Student Dashboard with crowd widget
- Menu with AI Search
- Checkout with AI slot recommender
- Order success with QR code
- Leaderboard podium
- Admin Analytics with AI forecast

---

## 🎓 Team

- **Product & Design:** [Your Name]
- **Frontend Development:** [Your Name]
- **Backend Development:** [Your Name]
- **AI Integration:** [Your Name]

---

## 📝 License

MIT © 2025 SmartCanteen

---

## 💬 Support

For issues, feature requests, or feedback:
- Open an issue on GitHub
- Email: support@smartcanteen.local
- Message: [@smartcanteen_official](https://twitter.com)

---

## 📚 Documentation

- [API Documentation](./API.md) — REST endpoints
- [Architecture Guide](./ARCHITECTURE.md) — System design
- [Demo Script](./DEMO_SCRIPT.md) — 5-minute presentation
- [Deployment Guide](./DEPLOY.md) — Production setup

---

**Made with ❤️ for better campus life** 🍽️

Skip the queue. Order smart. Never waste food again.
