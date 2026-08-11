from pydantic import BaseModel

class VivaRequest(BaseModel):
    chapters: list[int]
    topics: list[str]
class AnswerRequest(BaseModel):
    session_id: str
    answer: str