from uuid import uuid4
from random import shuffle
from datetime import datetime


class VivaSession:

    def __init__(self, questions):

        self.session_id = str(uuid4())

        self.questions = questions

        self.current_index = 0

        self.answers = []

        self.started_at = datetime.now()

        self.status = "running"

        self.evaluation = None

    def get_current_question(self):

        if self.current_index >= len(self.questions):
            return None

        q = self.questions[self.current_index]

        # Never expose the answer to frontend
        return {
            "id": q["id"],
            "chapter": q["chapter"],
            "chapter_no": q["chapter_no"],
            "topic": q["topic"],
            "question": q["question"],
            "diagram_required": q["diagram_required"]
        }

    def submit_answer(self, answer):

        question = self.questions[self.current_index]

        self.answers.append({
            "question_id": question["id"],
            "question": question["question"],
            "correct_answer": question["answer"],
            "student_answer": answer
        })

        self.current_index += 1

        if self.current_index >= len(self.questions):
            self.status = "completed"

    def is_completed(self):
        return self.status == "completed"

    def set_evaluation(self, evaluation):
        self.evaluation = evaluation


class SessionManager:

    def __init__(self):

        self.sessions = {}

    def create_session(self, all_questions, chapters, topics):

        filtered = []

        for q in all_questions:

            if (
                q["chapter_no"] in chapters
                and q["topic"] in topics
            ):
                filtered.append(q)

        shuffle(filtered)

        session = VivaSession(filtered)

        self.sessions[session.session_id] = session

        return session

    def get_session(self, session_id):

        return self.sessions.get(session_id)


session_manager = SessionManager()