GuitarBuddy

Monorepo with frontend (Vite + React) and backend (Express + WebSocket).

Quick start (development):

1. Backend:
   cd backend
   copy .env.example .env
   # edit .env to set MONGODB_URI and JWT_SECRET
   npm install
   npm run dev

2. Frontend:
   cd frontend
   copy .env.example .env
   # set VITE_API_BASE to http://localhost:4000
   npm install
   npm run dev

Deployment notes:
- Frontend will be hosted on Vercel. Set VITE_API_BASE to your backend URL.
- Backend will be hosted on Render. Add env vars: MONGODB_URI, JWT_SECRET, PORT.
- Use MongoDB Atlas for DB.
