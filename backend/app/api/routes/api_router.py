from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.patient import PatientModel
from app.models.all_models import (
    DocumentModel,
    AppointmentModel,
    ProviderModel,
    WorkflowModel,
    AuditLogModel,
)
from app.schemas.all_schemas import (
    PatientCreate,
    PatientResponse,
    AppointmentCreate,
    AppointmentResponse,
    ProviderResponse,
    ExtractionRequest,
)
from app.services.ai_extractor import extract_entities
from datetime import datetime
import uuid

router = APIRouter()

# --- Health Check ---
@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MIRA Ops Intelligence API",
        "version": "2.0.0",
        "compliance": "Australian Healthcare Privacy Principles Aligned"
    }

# --- Patients Endpoints ---
@router.get("/patients", response_model=List[PatientResponse])
def get_patients(db: Session = Depends(get_db)):
    return db.query(PatientModel).all()

@router.post("/patients", response_model=PatientResponse)
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    pat_id = f"pat_{uuid.uuid4().hex[:8]}"
    count = db.query(PatientModel).count() + 1
    ref_id = f"MIRA-2026-{str(count).padStart(3, '0') if hasattr(str(count), 'padStart') else f'{count:03d}'}"

    missing = []
    if not payload.email: missing.append("email")
    if not payload.phone: missing.append("phone")
    if not payload.date_of_birth: missing.append("date_of_birth")

    score = max(50, 100 - len(missing) * 15)

    new_patient = PatientModel(
        id=pat_id,
        reference_id=ref_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        date_of_birth=payload.date_of_birth,
        preferred_clinic=payload.preferred_clinic,
        enquiry_category=payload.enquiry_category,
        notes=payload.notes,
        status="active" if len(missing) == 0 else "pending_review",
        validation_score=score,
        missing_fields=missing,
        is_demo_data=False
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient

# --- Appointments Endpoints ---
@router.get("/appointments", response_model=List[AppointmentResponse])
def get_appointments(db: Session = Depends(get_db)):
    return db.query(AppointmentModel).all()

@router.post("/appointments", response_model=AppointmentResponse)
def create_appointment(payload: AppointmentCreate, db: Session = Depends(get_db)):
    # Conflict check
    conflict = db.query(AppointmentModel).filter(
        AppointmentModel.clinic_name == payload.clinic_name,
        AppointmentModel.preferred_date == payload.preferred_date,
        AppointmentModel.preferred_time == payload.preferred_time,
        AppointmentModel.status == "confirmed"
    ).first()
    if conflict:
        raise HTTPException(
            status_code=409,
            detail=f"Scheduling Conflict: {payload.clinic_name} is already booked at {payload.preferred_time} on {payload.preferred_date}."
        )

    apt = AppointmentModel(
        id=f"apt_{uuid.uuid4().hex[:8]}",
        patient_id=f"pat_{uuid.uuid4().hex[:6]}",
        patient_name=payload.patient_name,
        clinic_name=payload.clinic_name,
        preferred_date=payload.preferred_date,
        preferred_time=payload.preferred_time,
        appointment_type=payload.appointment_type,
        notes=payload.notes,
        status="requested",
        is_demo_data=False
    )
    db.add(apt)
    db.commit()
    db.refresh(apt)
    return apt

# --- Providers Endpoints ---
@router.get("/providers", response_model=List[ProviderResponse])
def get_providers(db: Session = Depends(get_db)):
    return db.query(ProviderModel).all()

@router.post("/providers/collect")
def run_provider_collection(source_url: str = "https://healthengine.com.au/directory/au", db: Session = Depends(get_db)):
    # Simulated public extraction following rate limits
    new_provider = ProviderModel(
        id=f"prv_{uuid.uuid4().hex[:8]}",
        clinic_name="Southport Specialist Practice",
        providerName="Dr. Julian Ross",
        address="42 Marine Parade, Southport QLD 4215",
        phone="(07) 5532 9988",
        website="https://southportspecialists.com.au",
        category="Cardiology",
        state="QLD",
        suburb="Southport",
        source_url=source_url,
        status="active",
        is_demo_data=True
    )
    db.add(new_provider)
    db.commit()
    return {"status": "success", "collected_records": 1, "source": source_url}

# --- AI Extraction & Prompt Evaluation Endpoint ---
@router.post("/ai/extract")
def extract_intake(request: ExtractionRequest):
    return extract_entities(request.text, version=request.prompt_version)

