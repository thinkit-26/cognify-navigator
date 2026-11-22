from pydantic import BaseModel, Field


class VivaRequest(BaseModel):
    chapters: list[int]
    topics: list[str]
    # Optional override for tuning/testing. Omitted means adaptive length:
    # 2 per topic, min 8, max 20, capped by unique concepts.
    question_count: int | None = Field(default=None, ge=1, le=100)


class AnswerRequest(BaseModel):
    session_id: str
    answer: str
