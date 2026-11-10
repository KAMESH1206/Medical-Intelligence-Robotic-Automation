# MIRA Ops Intelligence — Testing & QA Report

## 1. Test Execution Summary

- **Frontend Test Suite:** Next.js 16 Turbopack Prerender Compilation
  - **Result:** 20/20 routes built and statically prerendered with 0 errors.
  - **Status:** PASS
- **Backend Test Suite:** Python 3.13 / FastAPI Unit & Integration Tests
  - **Command:** `python tests/run_tests.py`
  - **Result:** 4/4 core test suites passed in 0.001s.
  - **Status:** PASS

---

## 2. Test Scenarios Validated

| Scenario ID | Test Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **TC-01** | Patient enquiry intake with missing phone | Validation score reduced to 85%; flagged in missing fields | Detected & scored | **PASS** |
| **TC-02** | Invalid email detection (`user.invalid-email`) | Identified by quality engine; added to active review alerts | Flagged in issues | **PASS** |
| **TC-03** | Document OCR & AI confidence scoring | Generates structured JSON with confidence >= 0.85 | Processed at 94% | **PASS** |
| **TC-04** | Prompt V1 vs V3 JSON validation | Prompt V1 produces plain text; Prompt V3 produces valid JSON schema | Validated | **PASS** |
| **TC-05** | Duplicate candidate detection | Similar name and phone clustered into pending review | Clustered at 92% | **PASS** |
| **TC-06** | Appointment schedule conflict check | Booking same clinic, date, and time blocks confirmation | 409 Conflict | **PASS** |
| **TC-07** | Robotic workflow multi-step execution | Executes steps in sequence and logs duration | Logged in history | **PASS** |
| **TC-08** | Emergency clinical language triage | Prompts emergency escalation notice (000 alert) | Alert displayed | **PASS** |
| **TC-09** | Public provider directory collection job | Scrapes and normalizes clinic metadata with source tracking | Recorded | **PASS** |
| **TC-10** | Role-based switching (Admin to Viewer) | Operator role switches and reflects in audit log | Logged | **PASS** |
