# MIRA Ops Intelligence — Interview Video Presentation Script

**Target Duration:** 5–7 Minutes  
**Audience:** Technical Interviewers, Healthcare Technology Leaders & AI Engineers

---

## [0:00 - 1:00] Introduction & Problem Statement
> *"Hello! Today I'm excited to present **MIRA Ops Intelligence**, an AI-powered healthcare data intelligence and robotic workflow automation SaaS platform.*
>
> *Healthcare clinics spend nearly a third of their administrative time manually sorting referral PDFs, cleaning up fragmented patient records, resolving duplicate files, and handling scheduling conflicts.*
>
> *I designed and built MIRA Ops Intelligence as an independent full-stack prototype to demonstrate how modern AI engineering, strict prompt guardrails, and robotic automation can solve these operational bottlenecks while strictly upholding healthcare privacy standards."*

---

## [1:00 - 2:30] Architecture & Operations Dashboard Walkthrough
> *(Navigate to `/dashboard`)*
>
> *"Here on the Operations Command Center, you can see real-time metrics derived from actual database records. We track total patient enquiries, documents processed with OCR, active data quality flags, duplicate candidates, and robotic automation success rates.*
>
> *The entire interface follows our mandatory healthcare brand palette: Powder Blue for primary actions, Soft Lavender White for calm surfaces, and Warm Sunset Peach for review alerts.*
>
> *Notice our top navigation bar: it includes a dynamic Role-Based Access Control switcher. We can switch between Super Admin, Healthcare Administrator, Data Coordinator, Operations Executive, and Viewer to demonstrate role-tiered governance."*

---

## [2:30 - 3:45] AI Patient Intake & Document Intelligence
> *(Navigate to `/patients` and `/documents`)*
>
> *"Let's look at the Patient Intake engine. When a new enquiry comes in, our system validates required contact details and assigns a real-time Data Quality score. If an email or phone number is missing, the record is flagged for administrative follow-up.*
>
> *Next, in the Document Intelligence module, we can upload referral PDFs or scans. The system performs OCR extraction and parses structured clinical entities with field-level confidence scores.*
>
> *If confidence drops below 80%, the document enters a 'Needs Review' state so human staff can approve or correct the extraction before any downstream record update."*

---

## [3:45 - 5:00] Data Quality & Prompt Engineering Lab (The Core AI Highlight)
> *(Navigate to `/prompt-lab`)*
>
> *"Now let's examine the Prompt Engineering Evaluation Lab—one of the core modules of this prototype.*
>
> *To avoid hallucination in healthcare workflows, we developed and benchmarked three prompt iterations:*
> - *Prompt V1 is a naive unconstrained prompt. It achieved only 20% JSON validity and hallucinates missing phone numbers.*
> - *Prompt V2 enforces a strict JSON schema, jumping validity to 92%.*
> - *Prompt V3 is our production enterprise prompt. It introduces field-level confidence scores, explicit uncertainty handling with null values, and emergency keyword detection.*
>
> *As you can see in the comparative benchmark chart, Prompt V3 achieves 99.8% JSON validity and 97.4% field accuracy, giving us the reliability needed to trigger automated downstream workflows safely."*

---

## [5:00 - 6:00] Robotic Workflow Automation & Provider Intelligence
> *(Navigate to `/automation` and `/providers`)*
>
> *"In the Workflow Automation module, our event-driven engine executes multi-step robotic sequences—from enquiry validation and AI summary generation to administrative task creation and audit logging.*
>
> *In Provider Intelligence, we built an Australian public healthcare directory scraper that respects rate limits, tracks source URLs, and normalizes clinic metadata without collecting private patient data."*

---

## [6:00 - 6:45] Conclusion & Positioning Note
> *"MIRA Ops Intelligence combines a Next.js 16 App Router frontend, a Python FastAPI microservice, PostgreSQL persistence, and Anthropic Claude / OpenAI foundation models.*
>
> *As a reminder, this is an independent prototype inspired by public healthcare operational challenges, developed to showcase end-to-end AI engineering, prompt evaluation, and full-stack software craftsmanship.*
>
> *Thank you, and I look forward to your questions!"*

