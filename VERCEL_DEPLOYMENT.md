# 🚀 Vercel Deployment Guide - Market Basket Intelligence Platform

This project is pre-configured for **1-Click Full-Stack Deployment on Vercel**.

---

## ⚡ Option 1: Direct Vercel 1-Click Monorepo Deployment (Recommended)

Vercel natively supports deploying Python FastAPI Serverless Functions alongside Vite/React frontends using `vercel.json`.

### Steps:
1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare Market Basket Intelligence Platform for Vercel deployment"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New"** → **"Project"**.
   - Select your GitHub repository `market-basket-platform`.

3. **Configure Project Settings**:
   - **Framework Preset**: Select `Vite` (or `Other`).
   - **Root Directory**: `./` (leave default).
   - **Build Command**: `cd frontend && npm install && npm run build` (or leave default, `vercel.json` overrides this automatically).
   - **Output Directory**: `frontend/dist`.

4. **Click Deploy**:
   - Vercel will build the React 3D frontend and launch the Python FastAPI engine as a serverless function at `/api/*`.

---

## 🌐 Option 2: Split Deployment (Vercel Frontend + Render / Railway Backend)

If you prefer to host the FastAPI Python server on Railway or Render:

1. **Deploy Backend on Render / Railway**:
   - Root Directory: `backend`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Copy your deployed backend URL (e.g. `https://market-basket-backend.up.railway.app`).

2. **Deploy Frontend on Vercel**:
   - Import `market-basket-platform` into Vercel.
   - Set **Root Directory**: `frontend`.
   - Add Environment Variable:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://market-basket-backend.up.railway.app` (your backend URL).
   - Deploy!

---

## 📁 Repository Layout Prepared for Vercel

```
market-basket-platform/
├── vercel.json           # Vercel Serverless Function & Route Rewrites
├── package.json          # Root npm build script
├── .gitignore            # Clean git exclusion
├── api/
│   └── index.py          # Vercel Python Serverless Function Entry Point
├── backend/
│   ├── main.py           # FastAPI Microservice
│   ├── engine.py         # Apriori & FP-Growth algorithms
│   ├── report_generator.py # PDF report synthesis
│   └── requirements.txt  # Python requirements
└── frontend/
    ├── src/              # React 19 + R3F 3D Node Network + Zustand + Recharts
    ├── package.json
    └── vite.config.ts
```
