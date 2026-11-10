import unittest
import sys
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.api.routes.api_router import (
    health_check,
    get_patients,
    create_patient,
    get_appointments,
    create_appointment,
    extract_intake,
    get_providers,
)
from app.schemas.all_schemas import PatientCreate, AppointmentCreate, ExtractionRequest
from app.core.database import SessionLocal, Base, engine

class TestApiEndpoints(unittest.TestCase):
    def setUp(self):
        Base.metadata.create_all(bind=engine)
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_health_check(self):
        data = health_check()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("MIRA Ops", data["service"])

    def test_get_patients(self):
        patients = get_patients(self.db)
        self.assertIsInstance(patients, list)

    def test_create_patient(self):
        payload = PatientCreate(
            name="Test Automated Patient",
            email="test.auto@miraops.health",
            phone="0412 888 777",
            date_of_birth="1990-01-01",
            preferred_clinic="Sydney Central Clinic",
            enquiry_category="General Consultation"
        )
        created = create_patient(payload, self.db)
        self.assertEqual(created.name, "Test Automated Patient")
        self.assertTrue(created.reference_id.startswith("MIRA-2026-"))
        self.assertEqual(created.status, "active")

    def test_ai_extraction_prompt_v3(self):
        payload = ExtractionRequest(
            text="Patient Sarah Connor born 1980-05-12, phone 0411 222 333, needs Sydney appointment",
            prompt_version=3
        )
        res = extract_intake(payload)
        self.assertTrue(res["is_valid_json"])
        self.assertGreater(res["confidence"], 0.8)
        self.assertIn("patientName", res["output"])

    def test_appointment_creation(self):
        apt_payload = AppointmentCreate(
            patient_name="Sarah Connor",
            clinic_name="Sydney Central Clinic",
            preferred_date="2026-11-25",
            preferred_time="14:00",
            appointment_type="General Consultation"
        )
        apt = create_appointment(apt_payload, self.db)
        self.assertEqual(apt.status, "requested")
        self.assertEqual(apt.patient_name, "Sarah Connor")

if __name__ == "__main__":
    unittest.main()
