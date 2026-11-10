import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "MIRA Ops" in data["service"]

def test_get_patients():
    response = client.get("/api/patients")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_patient():
    new_patient = {
        "name": "Test Patient",
        "email": "test@miraops.health",
        "phone": "0412 999 888",
        "preferred_clinic": "Sydney Central Clinic",
        "enquiry_category": "General Consultation"
    }
    response = client.post("/api/patients", json=new_patient)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Patient"
    assert data["reference_id"].startswith("MIRA-2026-")

def test_ai_extraction_prompt_v3():
    payload = {
        "text": "Patient Sarah Connor born 1980-05-12, phone 0411 222 333, needs Sydney appointment",
        "prompt_version": 3
    }
    response = client.post("/api/ai/extract", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid_json"] is True
    assert data["confidence"] > 0.8
    assert "patientName" in data["output"]

def test_appointment_creation():
    apt_data = {
        "patient_name": "Sarah Connor",
        "clinic_name": "Sydney Central Clinic",
        "preferred_date": "2026-11-20",
        "preferred_time": "11:30",
        "appointment_type": "General Consultation"
    }
    response = client.post("/api/appointments", json=apt_data)
    assert response.status_code == 200
    assert response.json()["status"] == "requested"
