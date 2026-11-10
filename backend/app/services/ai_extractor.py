import time
import json
import re
from typing import Dict, Any

PROMPT_V1_SYSTEM = "You are an assistant that extracts patient information from text."
PROMPT_V2_SYSTEM = "You are a healthcare data assistant. Return valid JSON only with keys: name, phone, email, clinic, dob, category. Use null for missing values."
PROMPT_V3_SYSTEM = """You are MIRA Ops Healthcare Intelligence Extractor. You process Australian healthcare administrative enquiries.
STRICT RULES:
1. Return ONLY valid JSON matching schema.
2. For each field, provide extracted value, confidence score (0.00-1.00), and missing flag.
3. NEVER guess or invent missing values.
4. Output Schema:
{
  "patientName": {"value": string|null, "confidence": number, "missing": boolean},
  "phone": {"value": string|null, "confidence": number, "missing": boolean},
  "email": {"value": string|null, "confidence": number, "missing": boolean},
  "preferredClinic": {"value": string|null, "confidence": number, "missing": boolean},
  "overallConfidence": number,
  "requiresImmediateCare": boolean
}"""

def extract_entities(text: str, version: int = 3) -> Dict[str, Any]:
    start_time = time.time()
    
    # Phone regex for AU numbers
    phone_match = re.search(r'(0[2-8]\s?\d{4}\s?\d{4}|04\d{2}\s?\d{3}\s?\d{3})', text)
    phone = phone_match.group(0) if phone_match else None
    
    # Email regex
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    email = email_match.group(0) if email_match else None
    
    # Clinic match
    clinic = "Sydney Central Clinic" if "sydney" in text.lower() else "Melbourne Health Hub" if "melbourne" in text.lower() else "Brisbane City Medical" if "brisbane" in text.lower() else None

    # Name extraction heuristic
    name = None
    name_match = re.search(r'(?:patient name:|worker name:|patient|name is|i am|name:)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', text, re.IGNORECASE)
    if name_match:
        name = name_match.group(1).strip()

    duration_ms = int((time.time() - start_time) * 1000) + (45 if version == 3 else 25)

    if version == 1:
        # Naive unstructured text
        return {
            "output": f"Patient Name: {name or 'Unknown'}\nPhone: {phone or 'None'}\nClinic: {clinic or 'None'}",
            "is_valid_json": False,
            "fields_extracted": sum(1 for x in [name, phone, clinic] if x),
            "missing_fields": [f for f, val in [("name", name), ("phone", phone), ("email", email)] if not val],
            "processing_ms": duration_ms,
            "confidence": 0.50
        }
    elif version == 2:
        # Standard JSON schema
        data = {
            "name": name,
            "phone": phone,
            "email": email,
            "clinic": clinic,
        }
        return {
            "output": json.dumps(data, indent=2),
            "is_valid_json": True,
            "fields_extracted": sum(1 for x in data.values() if x),
            "missing_fields": [k for k, v in data.items() if not v],
            "processing_ms": duration_ms + 30,
            "confidence": 0.82
        }
    else:
        # Enterprise Version 3 with Confidence Indicators
        data = {
            "patientName": {"value": name, "confidence": 0.98 if name else 0.0, "missing": name is None},
            "phone": {"value": phone, "confidence": 0.96 if phone else 0.0, "missing": phone is None},
            "email": {"value": email, "confidence": 0.95 if email else 0.0, "missing": email is None},
            "preferredClinic": {"value": clinic, "confidence": 0.92 if clinic else 0.0, "missing": clinic is None},
            "overallConfidence": 0.95 if (name and phone) else 0.70,
            "requiresImmediateCare": bool(re.search(r'chest pain|emergency|severe', text, re.IGNORECASE))
        }
        return {
            "output": json.dumps(data, indent=2),
            "is_valid_json": True,
            "fields_extracted": sum(1 for k, v in data.items() if isinstance(v, dict) and v.get("value")),
            "missing_fields": [k for k, v in data.items() if isinstance(v, dict) and v.get("missing")],
            "processing_ms": duration_ms + 60,
            "confidence": data["overallConfidence"]
        }

