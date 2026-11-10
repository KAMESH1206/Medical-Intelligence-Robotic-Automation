# MIRA Ops Intelligence — REST API Documentation

## Base URL
- **Local Development:** `http://localhost:8000/api`
- **Interactive Swagger Documentation:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## Endpoints

### 1. Health Check
`GET /api/health`
- **Description:** Verifies service health, active version, and compliance state.
- **Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "MIRA Ops Intelligence API",
  "version": "2.0.0",
  "compliance": "Australian Healthcare Privacy Principles Aligned"
}
```

---

### 2. Patient Intake
`GET /api/patients`
- **Description:** Returns all active and pending patient records.

`POST /api/patients`
- **Description:** Ingests a new patient enquiry, calculates validation score, and flags missing fields.
- **Request Body:**
```json
{
  "name": "Emma Watson",
  "email": "emma@example.com",
  "phone": "0412 345 678",
  "date_of_birth": "1988-04-12",
  "preferred_clinic": "Sydney Central Clinic",
  "enquiry_category": "General Consultation",
  "notes": "Routine checkup"
}
```

---

### 3. Smart Appointments
`GET /api/appointments`
- **Description:** Returns clinical appointments schedule.

`POST /api/appointments`
- **Description:** Creates an appointment with automated conflict detection.
- **Response (409 Conflict):** If time slot at clinic is already booked.

---

### 4. Healthcare Provider Intelligence
`GET /api/providers`
- **Description:** Returns collected Australian clinic directory records.

`POST /api/providers/collect`
- **Description:** Triggers a rate-limited extraction job against permitted public directory sources.

---

### 5. AI Prompt Extraction Engine
`POST /api/ai/extract`
- **Description:** Executes Prompt V1, V2, or V3 against unstructured intake text.
- **Request Body:**
```json
{
  "text": "Patient Sarah Connor born 12/05/1980, contact 0411 222 333, needs Sydney appointment",
  "prompt_version": 3
}
```
- **Response (200 OK):**
```json
{
  "output": "{ ... valid JSON with confidence scores ... }",
  "is_valid_json": true,
  "fields_extracted": 4,
  "missing_fields": ["email"],
  "processing_ms": 75,
  "confidence": 0.95
}
```

