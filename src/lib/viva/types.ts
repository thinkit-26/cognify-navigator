export interface Chapter {
  chapter_no: number;
  chapter: string;
  topics: string[];
}

export interface VivaStartResponse {
  session_id: string;
  total_questions: number;
  status: string;
}

export interface VivaQuestion {
  id: number;
  chapter: string;
  chapter_no: number;
  topic: string;
  question: string;
  answer?: string;
  diagram_required: boolean;
}

export interface QuestionResponse {
  question_number: number;
  total_questions: number;
  question: VivaQuestion;
}

export type AnswerResponse =
  | { status: "completed" }
  | {
      status: "running";
      next_question: VivaQuestion;
      question_number: number;
      total_questions: number;
    };

export interface QuestionResult {
  question_id: number;
  question: string;
  student_answer: string;
  score: number;
  is_correct: boolean;
  feedback: string;
}

export interface Evaluation {
  overall_score: number;
  overall_feedback: string;
  total_questions: number;
  correct_count: number;
  accuracy_of_correct: number;
  questions: QuestionResult[];
}
