"""
MIRA Ops Intelligence — Synthetic Database Seeder
Seeds PostgreSQL / SQLite with 20 synthetic patients, documents, appointments, and providers.
"""
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.models.patient import PatientModel
from app.models.all_models import (
    DocumentModel,
    AppointmentModel,
    ProviderModel,
    WorkflowModel,
    AuditLogModel,
)

def seed_database():
    print("Recreating database tables for clean seed...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Seeding 20 synthetic patient records...")
        patients = [
            ("pat_001", "MIRA-2026-001", "Emma Watson", "emma.w@example.com", "0412 345 678", "1988-04-12", "Sydney Central Clinic", "New Patient Registration", 98, "active"),
            ("pat_002", "MIRA-2026-002", "Liam Johnson", "liam.j@example.com", "0423 456 789", "1975-09-23", "Melbourne Health Hub", "Chronic Disease Management", 95, "active"),
            ("pat_003", "MIRA-2026-003", "Sophia Martinez", "sophia.invalid-email", "0434 567 890", "1992-11-05", "Brisbane City Medical", "General Consultation", 62, "incomplete"),
            ("pat_004", "MIRA-2026-004", "Oliver Brown", "oliver.brown@example.com", "", "1964-02-18", "Adelaide Care Centre", "Specialist Referral", 71, "pending_review"),
            ("pat_005", "MIRA-2026-005", "Ava Wilson", "ava.wilson@example.com", "0456 789 012", "2001-07-30", "Perth General Practice", "Telehealth Appointment", 100, "active"),
            ("pat_006", "MIRA-2026-006", "Noah Taylor", "noah.taylor@example.com", "0467 890 123", "1983-12-14", "Sydney Central Clinic", "Prescription Renewal", 96, "active"),
            ("pat_007", "MIRA-2026-007", "Isabella Anderson", "isabella.a@example.com", "0478 901 234", "1995-03-22", "Melbourne Health Hub", "Allied Health Services", 92, "active"),
            ("pat_008", "MIRA-2026-008", "Lucas Thomas", "lucas.thomas@example.com", "0489 012 345", "1970-08-09", "Brisbane City Medical", "Health Assessment", 99, "active"),
            ("pat_009", "MIRA-2026-009", "Mia Jackson", "mia.j@example.com", "0490 123 456", "1989-06-17", "Hobart Family Health", "New Patient Registration", 94, "active"),
            ("pat_010", "MIRA-2026-010", "Ethan White", "ethan.white@example.com", "0401 234 567", "1958-10-03", "Darwin Community Clinic", "Chronic Disease Management", 97, "active"),
            ("pat_011", "MIRA-2026-011", "Charlotte Harris", "charlotte.h@example.com", "0412 987 654", "1997-01-25", "Canberra Medical Centre", "General Consultation", 93, "active"),
            ("pat_012", "MIRA-2026-012", "Mason Martin", "mason.m@example.com", "0423 876 543", "1979-05-11", "Sydney Central Clinic", "Specialist Referral", 82, "pending_review"),
            ("pat_013", "MIRA-2026-013", "Harper Thompson", "harper.t@example.com", "0434 765 432", "2003-09-08", "Melbourne Health Hub", "Telehealth Appointment", 98, "active"),
            ("pat_014", "MIRA-2026-014", "James Garcia", "james.garcia@example.com", "0445 654 321", "1966-12-01", "Adelaide Care Centre", "Chronic Disease Management", 91, "active"),
            ("pat_015", "MIRA-2026-015", "Evelyn Robinson", "evelyn.r@example.com", "0456 543 210", "1991-04-19", "Perth General Practice", "New Patient Registration", 95, "active"),
            ("pat_016", "MIRA-2026-016", "Alexander Clark", "alex.clark@example.com", "0467 432 109", "1985-07-13", "Sydney Central Clinic", "General Consultation", 89, "active"),
            ("pat_017", "MIRA-2026-017", "Abigail Rodriguez", "abigail.rod@example.com", "0478 321 098", "1999-10-28", "Brisbane City Medical", "Allied Health Services", 96, "active"),
            ("pat_018", "MIRA-2026-018", "Henry Lewis", "henry.lewis@example.com", "0489 210 987", "1973-03-05", "Melbourne Health Hub", "Prescription Renewal", 100, "active"),
            ("pat_019", "MIRA-2026-019", "Ella Lee", "ella.lee@example.com", "0490 109 876", "1994-08-21", "Hobart Family Health", "Telehealth Appointment", 97, "active"),
            ("pat_020", "MIRA-2026-020", "Sebastian Walker", "sebastian.w@example.com", "0401 098 765", "1980-06-30", "Darwin Community Clinic", "Health Assessment", 94, "active"),
        ]

        for p in patients:
            db.add(PatientModel(
                id=p[0], reference_id=p[1], name=p[2], email=p[3], phone=p[4],
                date_of_birth=p[5], preferred_clinic=p[6], enquiry_category=p[7],
                validation_score=p[8], status=p[9], is_demo_data=True
            ))

        print("Seeding documents...")
        db.add(DocumentModel(
            id="doc_001", filename="referral_cardiology_emma_watson.pdf",
            file_type="pdf", file_size=245000, status="completed", confidence=0.96,
            is_demo_data=True
        ))
        db.add(DocumentModel(
            id="doc_002", filename="prescription_scan_liam_johnson.jpg",
            file_type="jpg", file_size=180000, status="needs_review", confidence=0.65,
            is_demo_data=True
        ))

        print("Seeding appointments...")
        db.add(AppointmentModel(
            id="apt_001", patient_id="pat_001", patient_name="Emma Watson",
            clinic_name="Sydney Central Clinic", preferred_date="2026-11-12",
            preferred_time="09:00", appointment_type="General Consultation",
            status="confirmed", is_demo_data=True
        ))

        print("Seeding providers...")
        db.add(ProviderModel(
            id="prv_001", clinic_name="Sydney Premier Health", provider_name="Dr. Andrew Wong",
            address="124 Pitt Street, Sydney NSW 2000", phone="(02) 9234 5678",
            category="General Practice", state="NSW", suburb="Sydney",
            source_url="https://healthengine.com.au/sydney/gp", status="active", is_demo_data=True
        ))

        db.commit()
        print("✓ Database seeding complete! All synthetic records created.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
