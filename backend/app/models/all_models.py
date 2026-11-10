from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, JSON, Text
from datetime import datetime
from app.core.database import Base

class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_type = Column(String, default="pdf")
    file_size = Column(Integer, default=0)
    status = Column(String, default="uploaded")
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)
    patient_id = Column(String, nullable=True)
    extracted_data = Column(JSON, nullable=True)
    confidence = Column(Float, nullable=True)
    ocr_text = Column(Text, nullable=True)
    missing_fields = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    is_demo_data = Column(Boolean, default=True)

class AppointmentModel(Base):
    __tablename__ = "appointments"

    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, index=True, nullable=False)
    patient_name = Column(String, nullable=False)
    clinic_name = Column(String, nullable=True)
    preferred_date = Column(String, nullable=False)
    preferred_time = Column(String, nullable=True)
    appointment_type = Column(String, default="General Consultation")
    status = Column(String, default="requested")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    confirmed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    is_demo_data = Column(Boolean, default=True)

class ProviderModel(Base):
    __tablename__ = "providers"

    id = Column(String, primary_key=True, index=True)
    clinic_name = Column(String, index=True, nullable=False)
    provider_name = Column(String, nullable=True)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    website = Column(String, nullable=True)
    category = Column(String, nullable=True)
    state = Column(String, nullable=True)
    suburb = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    collected_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="active")
    is_demo_data = Column(Boolean, default=True)

class WorkflowModel(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    trigger = Column(String, nullable=False)
    steps = Column(JSON, nullable=False)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    last_executed_at = Column(DateTime, nullable=True)
    total_executions = Column(Integer, default=0)
    successful_executions = Column(Integer, default=0)

class PromptVersionModel(Base):
    __tablename__ = "ai_prompt_versions"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    version = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    system_prompt = Column(Text, nullable=False)
    user_prompt_template = Column(Text, nullable=False)
    category = Column(String, default="intake")
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=False)

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    user_name = Column(String, nullable=False)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=True)
    resource_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
