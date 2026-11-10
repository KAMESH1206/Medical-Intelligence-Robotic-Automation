# MIRA Ops Intelligence — Technical Interview Q&A Cheatsheet

Use these structured answers to confidently ace the first technical interview round.

---

### Q1: "Can you explain the high-level architecture of MIRA Ops Intelligence?"
**Your Answer:**
> *"MIRA Ops Intelligence is engineered as a decoupled modern healthcare SaaS platform.
> The frontend uses **Next.js 16 with App Router, TypeScript, and Tailwind CSS**, providing 13 operational modules styled with a dedicated healthcare palette (Powder Blue, Soft Lavender, Sunset Peach).
> The backend microservice is built with **Python 3.12+ and FastAPI**, leveraging **SQLAlchemy ORM** and **Pydantic schemas** with PostgreSQL persistence.
> We also implemented an event-driven robotic workflow automation engine with APScheduler and a multi-tiered **Role-Based Access Control** system covering Super Admin down to Viewer."*

---

### Q2: "Why was AI needed, and how did you design your prompts to prevent hallucinations?"
**Your Answer:**
> *"Healthcare clinics deal with unstructured, noisy intake communications where standard regex fails.
> However, naive prompts frequently hallucinate missing phone numbers or dates of birth.
> To solve this, we built a **Prompt Engineering Evaluation Lab** and benchmarked three versions:
> - **Prompt V1 (Naive):** Achieved only 20% JSON validity and had high hallucination rates.
> - **Prompt V2 (Schema JSON):** Constrained output to strict keys with nulls, reaching 92% validity.
> - **Prompt V3 (Enterprise Production):** Added field-level confidence indicators (0.00–1.00), explicit uncertainty reasoning, and Australian emergency triage detection (`000` notice).
> Prompt V3 achieves **99.8% JSON validity** and **97.4% field accuracy**, allowing our downstream workflows to automatically approve records with >80% confidence while routing ambiguous cases to human staff."*

---

### Q3: "How does your platform handle patient privacy and healthcare compliance?"
**Your Answer:**
> *"We follow **Privacy by Design** principles aligned with the **Australian Privacy Principles (APPs)** and **HIPAA Security Guidelines**:
> 1. **Zero Real PHI:** All demonstration profiles are synthetic records with reserved contact ranges.
> 2. **Human Authorization Safeguard:** Duplicate patient candidates are **never automatically merged** by the algorithm; they require explicit administrative authorization.
> 3. **Immutable Audit Trail:** All logins, role adjustments, AI extractions, and record approvals are logged with timestamps and actor IDs.
> 4. **Clinical Safety Layer:** The AI assistant strictly declines clinical diagnosis or medication advice, acting solely as an administrative copilot."*

---

### Q4: "How does the duplicate detection and conflict checking work?"
**Your Answer:**
> *"For appointments, we query active confirmed slots for the specified clinic and time window to return a `409 Conflict` before booking can occur.
> For patient deduplication, we calculate normalized matching across phone numbers, family names, and birth years. Records with >=80% similarity are clustered into a 'Duplicate Candidate' holding state for side-by-side human comparison."*

---

### Q5: "How are the Python backend and Next.js frontend deployed and tested?"
**Your Answer:**
> *"The frontend compiles statically with Next.js 16 Turbopack (all 20+ routes prerendered with 0 errors) and deploys directly to **Vercel**.
> The Python backend runs with Uvicorn/Docker on **Render/Railway** with **Supabase PostgreSQL**.
> We have automated CI pipelines in **GitHub Actions** and unit test suites covering API health, patient intake scoring, conflict verification, and Prompt V3 extraction with 100% test pass rate."*

