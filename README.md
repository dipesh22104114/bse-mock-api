# Mock BSE Trade API & Real-Time Trades Dashboard

A full-stack application that simulates a long-running BSE trade-data pull and displays trades in a real-time dashboard.

The system starts with **1,000 available trades**. When a BSE pull is started, the request returns immediately while the remaining **2,000 trades** are processed in the background. Once completed, the dashboard is automatically updated using **WebSockets**, without page refresh or polling.

## Tech Stack

### Backend
- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- SQLite
- WebSockets
- python-dotenv

### Frontend
- React
- Vite
- JavaScript
- CSS

### Communication
- REST API
- WebSocket

## Architecture

```text
React Dashboard
      │
      ├── GET /getTrades
      ├── POST /start-pull
      │
      ▼
   FastAPI
      │
      ▼
Background Task
      │
      │ Wait / Process
      ▼
   SQLite
      │
      ▼
 WebSocket Event
      │
      ▼
React Dashboard
      │
      ▼
 Updated Trades
```

## Key Features

- 3,000 mock BSE trades
- 1,000 trades available initially
- 2,000 trades added after the simulated delay
- Configurable pull delay
- Background asynchronous processing
- REST APIs
- Real-time WebSocket notifications
- Automatic dashboard update
- Search and pagination
- Duplicate trade prevention
- No page refresh
- No polling loop
- No cron job or scheduler

## How to Run on Your PC

### Prerequisites

Install:
- Python 3.x
- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/dipesh22104114/bse-mock-api
cd bse-mock-api
```

### 2. Backend Setup

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Set the delay in `.env`:

```env
DELAY_SECONDS=40
```

Use `40` seconds for testing.

For the final 15-minute simulation:

```env
DELAY_SECONDS=900
```

### 3. Start Backend

```powershell
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

### 4. Start Frontend

Open a **second terminal**:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Test Flow

1. Open the dashboard → **1,000 trades**
2. Click **Start BSE Pull**
3. HTTP request returns immediately
4. Dashboard remains usable with 1,000 trades
5. Background task waits for the configured delay
6. Remaining 2,000 trades are saved
7. WebSocket notifies the dashboard
8. Dashboard automatically updates → **3,000 trades**

### Reset Database for a Fresh Test

If the database already contains 3,000 trades:

```powershell
Remove-Item trades.db
```

Then restart the backend. It will initialize with 1,000 trades.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Health check |
| GET | `/getTrades` | Get available trades |
| POST | `/start-pull` | Start background BSE pull |
| WebSocket | `/ws/trades` | Real-time update notification |

