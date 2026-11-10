# MIRA Ops Intelligence — Deployment Guide

## 1. Frontend Deployment (Vercel)

### Prerequisites
- Node.js 18.18+ (Node 20+ Recommended)
- Vercel CLI or GitHub repository connection

### Step-by-Step
1. Connect GitHub repository to Vercel.
2. Set Build Command: `npm run build`
3. Set Output Directory: `.next`
4. Set Environment Variables:
   - `ANTHROPIC_API_KEY`: Your Anthropic API Key
   - `OPENAI_API_KEY`: (Optional) Your OpenAI API Key
5. Deploy. All 20 App Router routes will be generated automatically.

---

## 2. Backend Deployment (Render / Docker / Railway)

### Prerequisites
- Python 3.12+
- PostgreSQL database (Supabase instance)

### Using Dockerfile
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables
```env
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres
ANTHROPIC_API_KEY=sk-ant-...
BACKEND_CORS_ORIGINS=["https://your-vercel-app.vercel.app"]
```

---

## 3. Local Development Setup

### Running Frontend
```bash
# In project root
npm install
npm run dev
# Accessible at http://localhost:3000
```

### Running Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# OpenAPI Swagger available at http://localhost:8000/docs
```

