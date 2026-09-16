import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

QUESTION_BANK = BASE_DIR / "data" / "filtered_question_bank.json"


def load_questions():
    with open(QUESTION_BANK, "r", encoding="utf-8") as file:
        return json.load(file)