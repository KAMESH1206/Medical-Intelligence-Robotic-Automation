# MIRA Ops Intelligence — Database Schema Documentation

## Database Engine
- **Primary:** PostgreSQL (Supabase Compatible)
- **Local Fallback:** SQLite 3 for zero-configuration developer test environments
- **ORM:** SQLAlchemy 2.0 with Declarative Base

---

## Entity Relationship Overview

### 1. `patients_demo`
Stores synthetic patient demographic and enquiry records.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key, Index | Unique patient identifier (`pat_...`) |
| `reference_id` | String | Unique, Index | Human readable code (`MIRA-2026-001`) |
| `name` | String | Not Null, Index | Full legal or preferred name |
| `email` | String | Nullable | Primary email address |
| `phone` | String | Nullable | Primary Australian phone number |
| `date_of_birth` | String | Nullable | ISO date string (`YYYY-MM-DD`) |
| `preferred_clinic` | String | Nullable | Branch name |
| `enquiry_category` | String | Nullable | Intake triage category |
| `notes` | Text | Nullable | Administrative / referral notes |
| `status` | String | Default: 'active' | `'active'`, `'pending_review'`, `'incomplete'` |
| `validation_score` | Integer | Default: 100 | Integrity score (0–100) |
| `missing_fields` | JSON | Nullable | Array of missing attributes |
| `created_at` | DateTime | Default: UTC | Ingestion timestamp |
| `updated_at` | DateTime | Default: UTC | Last edit timestamp |
| `is_demo_data` | Boolean | Default: True | Synthetic demo flag |

### 2. `documents`
Tracks uploaded clinical documents, scans, and OCR extractions.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key | Document ID (`doc_...`) |
| `filename` | String | Not Null | Original file name |
| `file_type` | String | Default: 'pdf' | `'pdf'`, `'png'`, `'jpg'`, `'jpeg'` |
| `file_size` | Integer | Default: 0 | Size in bytes |
| `status` | String | Default: 'uploaded'| `'uploaded'`, `'processing'`, `'completed'`, `'needs_review'`, `'failed'`, `'rejected'` |
| `uploaded_at` | DateTime | Default: UTC | Upload timestamp |
| `processed_at` | DateTime | Nullable | OCR/AI completion timestamp |
| `confidence` | Float | Nullable | Overall extraction confidence (0.00–1.00) |
| `extracted_data` | JSON | Nullable | Structured JSON payload |
| `ocr_text` | Text | Nullable | Raw OCR text output |
| `error_message` | Text | Nullable | Parser error details if failed |

### 3. `appointments`
Manages clinical appointments with conflict verification.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key | Appointment ID (`apt_...`) |
| `patient_id` | String | Index, Not Null | Foreign key reference to patient |
| `patient_name` | String | Not Null | Denormalized patient name for fast queries |
| `clinic_name` | String | Nullable | Scheduled clinic |
| `preferred_date` | String | Not Null | Date of appointment (`YYYY-MM-DD`) |
| `preferred_time` | String | Nullable | Time of appointment (`HH:MM`) |
| `status` | String | Default: 'requested'| `'requested'`, `'pending_approval'`, `'confirmed'`, `'rescheduled'`, `'cancelled'` |

### 4. `providers`
Public Australian healthcare directory records collected via compliant scraping.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key | Provider ID (`prv_...`) |
| `clinic_name` | String | Not Null, Index | Practice legal/trade name |
| `provider_name` | String | Nullable | Doctor or specialist name |
| `address` | String | Nullable | Clinic address |
| `phone` | String | Nullable | Public business phone |
| `source_url` | String | Nullable | Original public directory URL |
| `collected_at` | DateTime | Default: UTC | Scraping timestamp |

### 5. `audit_logs`
Immutable audit records for compliance and traceability.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key | Audit ID (`aud_...`) |
| `user_id` | String | Not Null | Acting user ID |
| `user_name` | String | Not Null | Operator name |
| `action` | String | Not Null | Action verb (`record_created`, `ai_execution`, etc.) |
| `resource_type` | String | Nullable | Target table/entity |
| `resource_id` | String | Nullable | Target ID |
| `details` | JSON | Nullable | Operation metadata |
| `timestamp` | DateTime | Default: UTC | Event timestamp |
