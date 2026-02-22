# StockWise – Stock Portfolio Management Web App

StockWise is a full-stack Stock Portfolio Management application that allows users to manage, track, and analyze their stock investments in real time.

It includes secure authentication, Google OAuth login, portfolio analytics, and live stock price tracking.

---

## Live Demo

Frontend: https://stockwise-green-kappa.vercel.app  
Backend: https://stockwise-hzy4.onrender.com

---

## Features

### Authentication
- Email & Password Login
- Google OAuth Login
- JWT-based authentication
- Protected API routes

### Portfolio Management
- Add stocks (symbol + quantity)
- Fetch live stock prices
- Delete stocks
- Sell partial quantities
- Automatic portfolio recalculation

### Analytics & Charts
- Portfolio Allocation (Pie Chart)
- Profit / Loss Trend (Line Chart)
- Dynamic Green/Red PnL indicator
- Hourly portfolio performance tracking

### Real-Time Updates
- Auto refresh every 60 seconds
- Live price synchronization
- Dynamic profit/loss updates

---

## Tech Stack

### Frontend
- HTML5
- CSS3 (Bootstrap 5)
- JavaScript
- Chart.js

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Google OAuth (google-auth-library)

### Database
- MongoDB Atlas

### Deployment
- Frontend: Vercel
- Backend: Render

---

## Project Structure

```
stock-portfolio-app/
│
├── frontend/
│   ├── index.html
│   ├── js/app.js
│   └── assets/
│
├── backend/
│   ├── server.js
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── config/
│
└── README.md
```

---

## Environment Variables

Create a `.env` file inside the backend folder:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/your-username/stock-portfolio-app.git
cd stock-portfolio-app
```

---

### Backend Setup

```bash
cd backend
npm install
npm start
```

Server runs on:

```
http://localhost:5000
```

---

### Frontend Setup

Open `frontend/index.html` using Live Server or deploy via Vercel.

---

## Google OAuth Setup

1. Go to Google Cloud Console  
2. Create OAuth 2.0 Client ID  
3. Add Authorized JavaScript Origins:
   ```
   http://localhost:5500
   https://your-vercel-url.vercel.app
   ```
4. Add Authorized Redirect URIs:
   ```
   http://localhost:5500
   https://your-vercel-url.vercel.app
   ```
5. Add CLIENT_ID to:
   - Backend `.env`
   - Frontend login section

---

## Profit & Loss Tracking

- Portfolio PnL is calculated dynamically.
- Hourly PnL history is stored.
- Line graph turns:
  - 🟢 Green when in profit
  - 🔴 Red when in loss
- Automatically updates every minute.

---

## Future Improvements

- Trade History Ledger
- Realized vs Unrealized PnL
- Candlestick Charts
- Dark Mode
- Admin Dashboard
- Market Open/Close Indicator

---

## Author

Dhruv Kumar Garg  
Full Stack Developer  
GitHub: https://github.com/dhrubkumargarg   
GitHub: https://github.com/dhrub-kumar-garg

---

## Why This Project?

This project demonstrates:

- Full-stack architecture
- Secure authentication
- Google OAuth integration
- Real-time data handling
- Chart analytics
- Production deployment workflow

---
