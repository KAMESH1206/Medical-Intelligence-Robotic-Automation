from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Patient Schemas ---
class PatientBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    preferred_clinic: Optional[str] = None
    enquiry_category: Optional[str] = None
    notes: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: str
    reference_id: str
    status: str
    validation_score: Optional[int] = 100
    missing_fields: Optional[List[str]] = None
    created_at: datetime
    is_demo_data: bool = True

    class Config:
        from_attributes = True

# --- Document Schemas ---
class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    status: str
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    confidence: Optional[float] = None
    extracted_data: Optional[Dict[str, Any]] = None
    ocr_text: Optional[str] = None
    missing_fields: Optional[List[str]] = None

    class Config:
        from_attributes = True

# --- Appointment Schemas ---
class AppointmentCreate(BaseModel):
    patient_name: str
    clinic_name: Optional[str] = None
    preferred_date: str
    preferred_time: Optional[str] = "10:00"
    appointment_type: Optional[str] = "General Consultation"
    notes: Optional[str] = None

class AppointmentResponse(AppointmentCreate):
    id: str
    patient_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Provider Schemas ---
class ProviderResponse(BaseModel):
    id: str
    clinic_name: str
    provider_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    category: Optional[str] = None
    state: Optional[str] = None
    source_url: Optional[str] = None
    collected_at: datetime
    status: str

    class Config:
        from_attributes = True

# --- AI & Prompt Schemas ---
class ExtractionRequest(BaseModel):
    text: str
    prompt_version: int = 3

class ExtractionResponse(BaseModel):
    patient_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    preferred_clinic: Optional[str] = None
    confidence_score: float
    missing_fields: List[str]
    processing_ms: int
    is_valid_json: bool
