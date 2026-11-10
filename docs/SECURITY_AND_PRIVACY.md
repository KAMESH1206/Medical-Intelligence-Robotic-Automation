# MIRA Ops Intelligence — Security & Privacy Architecture

## 1. Compliance Standard
MIRA Ops Intelligence is engineered adhering to:
- **Australian Privacy Principles (APPs)** under the *Privacy Act 1988*.
- **HIPAA Security & Breach Notification Guidelines** (Security by Design).
- **ISO/IEC 27001 Operational Logging Controls**.

---

## 2. Core Security Guarantees

### A. Zero Real Protected Health Information (PHI)
- All demonstration datasets use fictional identities, reserved Australian phone numbers (`0412 000 000` prefix range), and test clinic locations.
- No live Medicare card numbers, patient health identifiers (IHIs), or biometric files are ever processed or persisted.

### B. Input Validation & Injection Hardening
- **Pydantic Data Schemas:** All incoming REST payloads undergo strict type coercion and regex sanitation.
- **SQLAlchemy ORM Parametrization:** Zero raw SQL concatenations; all queries are parameterized to eliminate SQL injection vectors.
- **File Validation:** Document ingestion restricts MIME types to `.pdf`, `.png`, `.jpg`, and `.jpeg` with a 15MB file ceiling.

### C. Role-Based Access Control (RBAC)
- Five distinct operational tiers:
  1. **Super Admin:** System configuration, LLM API keys, full audit clearance.
  2. **Healthcare Administrator:** Review queues, appointment confirmations, patient triage.
  3. **Data Coordinator:** Duplicate candidate review, validation error resolution.
  4. **Operations Executive:** Scraper execution, analytics monitoring.
  5. **Viewer:** Read-only dashboard access.

### D. Human-in-the-Loop Safeguards
- Duplicate patient candidates are **never automatically merged** without explicit human confirmation.
- AI document extractions with confidence `< 0.80` are automatically routed to the `needs_review` holding state.
- Clinical emergencies trigger a mandatory redirection notice to Australian emergency services (`000`).
