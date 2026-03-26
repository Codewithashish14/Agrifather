# 🌾 AGRIFATHER - Advanced AI Assistant for Farmers

**India's Most Advanced AI Agricultural Assistant**  
अग्रीफादर - किसानों के लिए सबसे उन्नत AI सहायक

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm v9+

### 1. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys (see Configuration section)
npm start
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## ⚙️ Configuration

Edit `backend/.env`:

```env
# REQUIRED
ANTHROPIC_API_KEY=your_key_from_console.anthropic.com

# REQUIRED for payments
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Optional - change for security
JWT_SECRET=your_super_secret_key_change_this
```

### Getting API Keys

1. **Anthropic API** (Free tier available): https://console.anthropic.com
2. **Razorpay** (Free account): https://razorpay.com/docs/

---

## 🏗️ Architecture

```
agrifather/
├── backend/
│   ├── server.js          # Express app entry point
│   ├── database/
│   │   └── db.js          # SQLite database setup
│   ├── middleware/
│   │   └── auth.js        # JWT + plan checking
│   ├── routes/
│   │   ├── auth.js        # Register/Login/Profile
│   │   ├── chat.js        # AI chat with Claude
│   │   ├── payment.js     # Razorpay integration
│   │   ├── weather.js     # Open-Meteo weather
│   │   ├── market.js      # Crop prices + schemes
│   │   └── reminders.js   # Farm reminders
│   └── uploads/           # User image uploads
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── LandingPage.jsx    # Marketing homepage
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── ChatPage.jsx       # Main AI chat interface
        │   ├── WeatherPage.jsx
        │   ├── MarketPage.jsx
        │   ├── RemindersPage.jsx
        │   ├── ProfilePage.jsx
        │   └── PricingPage.jsx
        ├── components/
        │   ├── DashboardLayout.jsx
        │   └── LoadingScreen.jsx
        └── contexts/
            └── AuthContext.jsx
```

---

## 💳 Pricing Plans

| Plan | Price | Messages | Voice | Image Upload |
|------|-------|----------|-------|--------------|
| Free | ₹0 | 10/day | ❌ | ❌ |
| Pro Monthly | ₹399/month | Unlimited | ✅ | ✅ |
| Pro Yearly | ₹4,199/year | Unlimited | ✅ | ✅ |

---

## 🌟 Key Features

### 🤖 AI Chat (Powered by Claude)
- Expert agricultural advice for 200+ crops
- Hindi, English, Hinglish, Marathi, Gujarati, Punjabi, Telugu, Tamil, Kannada, Bengali
- Context-aware multi-turn conversations
- Seasonal and region-specific advice

### 🎤 Voice Mode (Pro)
- Voice input using Web Speech API
- Text-to-speech responses
- Hands-free farming queries

### 📸 Disease Detection (Pro)
- Upload crop photos
- AI-powered disease and pest identification
- Treatment recommendations

### 🌦️ Weather (Free)
- Real-time weather using Open-Meteo API (no key needed)
- 7-day forecast
- Farming-specific weather advice

### 📊 Market Prices (Free)
- Indicative mandi prices for 30+ crops
- MSP (Minimum Support Price) information
- Government scheme guidance

### 🔔 Reminders (Free)
- Create farming task reminders
- Watering, spraying, fertilizing, harvesting alerts

---

## 🚀 Production Deployment

### Option 1: Single Server (Recommended for starting)

```bash
# Build frontend
cd frontend && npm run build

# Start backend (serves frontend too)
cd backend
NODE_ENV=production npm start
```

### Option 2: Docker

```bash
docker-compose up -d
```

### Option 3: Cloud Deployment

**Backend (Railway/Render/Heroku):**
1. Deploy backend folder
2. Set environment variables
3. Note your API URL

**Frontend (Vercel/Netlify):**
1. Deploy frontend folder
2. Set `VITE_API_URL` to your backend URL
3. Build command: `npm run build`

---

## 🔒 Security Features

- JWT authentication with 30-day expiry
- bcrypt password hashing (12 rounds)
- Rate limiting (200 req/15min global, 20 for auth)
- CORS protection
- Helmet.js security headers
- File upload validation (images only, 5MB limit)

---

## 📱 API Endpoints

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login
GET    /api/auth/me                Get current user
PUT    /api/auth/profile           Update profile
PUT    /api/auth/change-password   Change password

POST   /api/chat/message           Send AI message
GET    /api/chat/conversations     List conversations
GET    /api/chat/conversations/:id/messages
DELETE /api/chat/conversations/:id
GET    /api/chat/suggestions       Seasonal suggestions

GET    /api/weather                Weather forecast
GET    /api/market                 Market prices
GET    /api/market/schemes         Government schemes

GET    /api/payment/plans          Get pricing plans
POST   /api/payment/create-order   Create Razorpay order
POST   /api/payment/verify         Verify payment

GET    /api/reminders              Get reminders
POST   /api/reminders              Create reminder
PUT    /api/reminders/:id/complete Mark complete
DELETE /api/reminders/:id          Delete reminder
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | Node.js, Express.js |
| Database | SQLite (via better-sqlite3) |
| AI Engine | Anthropic Claude API |
| Payments | Razorpay |
| Weather | Open-Meteo (free, no key) |
| Voice | Web Speech API (browser native) |
| Auth | JWT + bcrypt |

---

## 📞 Farmer Helplines (Built-in)

- **Kisan Call Center:** 1800-180-1551 (Free)
- **PM-KISAN Helpline:** 155261
- **Crop Insurance (PMFBY):** 1800-200-7710
- **eNAM:** 1800-270-0224
- **Weather (IMD):** imd.gov.in

---

## 🙏 Credits

Built with ❤️ for Indian Farmers  
Powered by Anthropic Claude AI  
Weather data by Open-Meteo  
Payments by Razorpay
