from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, Text
from datetime import datetime
from app.core.database import Base

class PatientModel(Base):
    __tablename__ = "patients_demo"

    id = Column(String, primary_key=True, index=True)
    reference_id = Column(String, unique=True, index=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    preferred_clinic = Column(String, nullable=True)
    enquiry_category = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String, default="active")
    validation_score = Column(Integer, default=100)
    missing_fields = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_demo_data = Column(Boolean, default=True)
