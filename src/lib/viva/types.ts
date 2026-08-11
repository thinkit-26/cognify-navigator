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
  diagram_required: boolean;
}

export interface QuestionResponse {
  question_number: number;
  total_questions: number;
  question: VivaQuestion;
}

export interface AnswerResponse {
  status: string;
  next_question?: VivaQuestion;
  question_number?: number;
  total_questions?: number;
}
