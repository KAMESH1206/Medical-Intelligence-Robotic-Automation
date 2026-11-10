from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.routes.api_router import router as api_router
from app.models.patient import PatientModel
from app.models.all_models import (
    DocumentModel,
    AppointmentModel,
    ProviderModel,
    WorkflowModel,
    PromptVersionModel,
    AuditLogModel,
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MIRA Ops Intelligence API",
    description="Intelligent Healthcare Operations & Robotic Workflow Automation Platform. REST API for AI intake parsing, document OCR, data quality engine, and Australian clinic provider registry.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix="/api")

@app.on_event("startup")
def seed_initial_data():
    db = SessionLocal()
    try:
        # Check if patients exist
        if db.query(PatientModel).count() == 0:
            demo_patients = [
                PatientModel(
                    id="pat_001",
                    reference_id="MIRA-2026-001",
                    name="Emma Watson",
                    email="emma.w@example.com",
                    phone="0412 345 678",
                    date_of_birth="1988-04-12",
                    preferred_clinic="Sydney Central Clinic",
                    enquiry_category="New Patient Registration",
                    notes="Requires comprehensive health check.",
                    status="active",
                    validation_score=98,
                    is_demo_data=True
                ),
                PatientModel(
                    id="pat_002",
                    reference_id="MIRA-2026-002",
                    name="Liam Johnson",
                    email="liam.j@example.com",
                    phone="0423 456 789",
                    date_of_birth="1975-09-23",
                    preferred_clinic="Melbourne Health Hub",
                    enquiry_category="Chronic Disease Management",
                    notes="Type 2 diabetes care plan update required.",
                    status="active",
                    validation_score=95,
                    is_demo_data=True
                ),
                PatientModel(
                    id="pat_003",
                    reference_id="MIRA-2026-003",
                    name="Sophia Martinez",
                    email="sophia.invalid-email",
                    phone="0434 567 890",
                    date_of_birth="1992-11-05",
                    preferred_clinic="Brisbane City Medical",
                    enquiry_category="General Consultation",
                    notes="Flu symptoms.",
                    status="incomplete",
                    validation_score=62,
                    missing_fields=["valid_email"],
                    is_demo_data=True
                ),
            ]
            for p in demo_patients:
                db.add(p)
            db.commit()
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "project": "MIRA Ops Intelligence",
        "tagline": "Intelligent Healthcare Operations, Powered by AI",
        "documentation": "/docs",
        "health": "/api/health"
    }

