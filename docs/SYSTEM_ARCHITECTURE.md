# MIRA Ops Intelligence — System Architecture

## Architecture Diagram

```
[ Browser / Client ]
      │
      ▼
[ Next.js 16 App Router (Turbopack, TypeScript, React 19) ]
      ├── UI Components (Tailwind v4, Recharts, Lucide)
      ├── Client In-Memory State & LocalStorage Synchronization
      └── API Route Handlers (/api/score, /api/draft, /api/chat)
            │
            ▼
[ Python 3.12+ FastAPI Microservice ]
      ├── Core Config (Pydantic Settings)
      ├── Security Layer (JWT & Role Governance)
      ├── Routers (/patients, /documents, /appointments, /providers, /ai)
      ├── Document Intelligence (OCR & PyMuPDF / Pillow)
      ├── Public Directory Scraper (BS4 + Requests + Rate Limiting)
      └── Robotic Workflow Engine (APScheduler)
            │
            ▼
[ PostgreSQL / Supabase Compatible Database ]
      ├── Normalized Tables (Patients, Documents, Appointments, Audits)
      └── Alembic Schema Migrations
            │
            ▼
[ AI Foundation Layer ]
      ├── Anthropic Claude 3 Haiku / 3.5 Sonnet
      ├── OpenAI GPT-4o Fallback
      └── Prompt Engineering Lab (Prompt V1 vs V2 vs V3)
```

## Security & Data Isolation
1. **Zero Real PHI:** All demonstration patient profiles are synthetic records using reserved test numbers.
2. **Clinical Guardrails:** Automated rejection of medical diagnoses or prescription changes; emergency language triggers instant escalation to Australian emergency services (`000`).
3. **Idempotency & Deduplication:** All robotic workflows employ idempotency checks to prevent duplicate booking confirmations or repeated external alerts.
