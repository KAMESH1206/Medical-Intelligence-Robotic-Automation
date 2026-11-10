# MIRA Ops Intelligence 🏥⚡🤖

**Healthcare Data Intelligence & Robotic Workflow Automation SaaS Platform**

> **Important Positioning Notice:**  
> This application is an independent healthcare technology prototype inspired by publicly described healthcare automation and administrative workflow challenges. It is **not** an official Gokul Infocare product, and must never be represented as an implementation of its proprietary MIRA platform. The application is developed to demonstrate practical AI engineering, prompt engineering, Python programming, data intelligence, workflow automation, and full-stack development capabilities.

---

## 🎨 Mandatory Brand Identity & Color System
The entire application strictly follows the required healthcare color palette:
- **Primary Color:** Powder Blue (`#8DB9F0`) — Primary actions, active navigation, indicators
- **Secondary Surface:** Soft Lavender White (`#E9E8F8`) — Section backgrounds, cards, modal surfaces
- **Accent Color:** Warm Sunset Peach (`#F5B69E`) — Notifications, review alerts, KPI accents
- **Supporting Neutrals:** White (`#FFFFFF`), Text (`#25283A`), Muted Text (`#74778A`), Border (`#DFDEEB`)

---

## 🚀 Key Modules & Capabilities

1. **Operations Command Center (`/dashboard`)**  
   Real-time operational metrics: Patient enquiries, OCR documents processed, pending reviews, duplicate candidates, and robotic automation success rates.
2. **AI Patient Intake Automation (`/patients`)**  
   Intake form parsing, automatic data quality scoring (0–100), and missing field identification.
3. **Healthcare Document Intelligence (`/documents`)**  
   Drag-and-drop PDF/image upload, OCR parsing, field confidence indicators, JSON inspection, and human approval/rejection.
4. **Healthcare Data Quality Engine (`/data-quality`)**  
   Continuous format validation, duplicate candidate clustering with similarity matching, and human authorization safeguards.
5. **Smart Appointment Operations (`/appointments`)**  
   Calendar/list appointment management with automatic clinic scheduling conflict prevention.
6. **Healthcare Provider Intelligence (`/providers`)**  
   Australian public directory scraper (HealthEngine/HotDoc) with rate limiting, source URL tracking, and CSV export.
7. **AI Administrative Assistant (`/ai-assistant`)**  
   Operational chat assistant with clinical safety guardrails (emergency `000` notice, strict administrative advice only).
8. **Intelligent Workflow Automation (`/automation`)**  
   Multi-step robotic execution engine with trigger pipelines and execution history.
9. **Operations Analytics & Reports (`/analytics`)**  
   Cross-department throughput charts, accuracy curves, and CSV export.
10. **Prompt Engineering Evaluation Lab (`/prompt-lab`)**  
    Empirical benchmark comparing **Prompt V1** (Naive), **Prompt V2** (Schema JSON), and **Prompt V3** (Enterprise Guardrail with field-level confidence).
11. **Security & Audit Trail (`/audit-logs`)**  
    Immutable event logs adhering to the Australian Privacy Principles and HIPAA Security guidelines.
12. **System Settings (`/settings`)**  
    Role-based access control tiering, AI provider key management, and one-click demo data reset.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 16 (App Router, Turbopack, React 19) |
| **Language & Styling** | TypeScript 5, Tailwind CSS v4, Lucide React |
| **Data Visualizations** | Recharts (Area, Bar, Pie, Line) |
| **Backend API** | Python 3.12+ / 3.13, FastAPI, Pydantic, SQLAlchemy |
| **Database** | PostgreSQL (Supabase Compatible) / SQLite 3 Local |
| **AI Foundation** | Anthropic Claude 3 Haiku / OpenAI GPT-4o |
| **Document Processing** | PyMuPDF, Tesseract OCR, Pillow |
| **Web Scraping** | Requests, BeautifulSoup4 (Rate-limited, Public records only) |

---

## 🏃 Quick Start Guide

### 1. Frontend Setup
```bash
npm install
npm run dev
# Open http://localhost:3000 in your browser
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# OpenAPI Swagger docs at http://localhost:8000/docs
```

### 3. Run Backend Test Suite
```bash
cd backend
python tests/run_tests.py
```

---

## 📑 Comprehensive Documentation Links
- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [AI Prompt Documentation](docs/AI_PROMPT_DOCUMENTATION.md)
- [Prompt Evaluation Report](docs/PROMPT_EVALUATION.md)
- [Testing & QA Report](docs/TESTING_REPORT.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Security & Privacy Guide](docs/SECURITY_AND_PRIVACY.md)
- [Video Presentation Script](docs/VIDEO_PRESENTATION_SCRIPT.md)
"# Medical-Intelligence-Robotic-Automation" 
