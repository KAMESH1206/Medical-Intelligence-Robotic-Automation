import unittest
import sys
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.ai_extractor import extract_entities

class TestMiraBackend(unittest.TestCase):
    def test_prompt_v1_extraction(self):
        text = "Patient Emma Watson born 12/04/1988, contact 0412 345 678 at Sydney Central Clinic."
        res = extract_entities(text, version=1)
        self.assertFalse(res["is_valid_json"])
        self.assertIn("Patient Name", res["output"])

    def test_prompt_v2_extraction(self):
        text = "Patient Emma Watson born 12/04/1988, contact 0412 345 678 at Sydney Central Clinic."
        res = extract_entities(text, version=2)
        self.assertTrue(res["is_valid_json"])
        self.assertIn('"name": "Emma Watson"', res["output"])

    def test_prompt_v3_enterprise_extraction(self):
        text = "Patient Emma Watson born 12/04/1988, contact 0412 345 678 at Sydney Central Clinic."
        res = extract_entities(text, version=3)
        self.assertTrue(res["is_valid_json"])
        self.assertIn("patientName", res["output"])
        self.assertIn("confidence", res["output"])
        self.assertGreater(res["confidence"], 0.85)

    def test_emergency_detection(self):
        text = "Patient has severe chest pain and cannot breathe, calling Sydney clinic."
        res = extract_entities(text, version=3)
        self.assertIn('"requiresImmediateCare": true', res["output"])

if __name__ == "__main__":
    unittest.main()
