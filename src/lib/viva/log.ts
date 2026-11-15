import { supabase } from "@/integrations/supabase/client";
import type { Evaluation, VivaQuestion } from "@/lib/viva/types";

// Saves a student's viva to their own account (Supabase, row level security: a student only
// sees their own rows, admins see all). Logging must never break the exam, so errors are
// reported to the console and swallowed.

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function logSessionStart(sessionId: string, chapters: number[], topics: string[], totalQuestions?: number) {
  try {
    const userId = await currentUserId();
    if (!userId) return;
    const { error } = await supabase
      .from("viva_sessions")
      .insert({ user_id: userId, session_id: sessionId, chapters, topics, total_questions: totalQuestions ?? null });
    if (error) throw error;
  } catch (err) {
    console.error("viva log: session start failed", err);
  }
}

export async function logAnswer(sessionId: string, question: VivaQuestion, questionNumber: number, answer: string) {
  try {
    const userId = await currentUserId();
    if (!userId) return;
    const { error } = await supabase.from("viva_answers").upsert(
      {
        user_id: userId,
        session_id: sessionId,
        question_id: question.id,
        question_number: questionNumber,
        question: question.question,
        topic: question.topic,
        chapter: question.chapter,
        student_answer: answer,
      },
      { onConflict: "session_id,question_id" },
    );
    if (error) throw error;
  } catch (err) {
    console.error("viva log: answer failed", err);
  }
}

export async function logEvaluation(sessionId: string, evaluation: Evaluation) {
  try {
    const userId = await currentUserId();
    if (!userId) return;
    const { error: sErr } = await supabase
      .from("viva_sessions")
      .update({
        status: "completed",
        overall_score: evaluation.overall_score,
        correct_count: evaluation.correct_count,
        total_questions: evaluation.total_questions,
        overall_feedback: evaluation.overall_feedback,
        completed_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId);
    if (sErr) throw sErr;

    const rows = evaluation.questions.map((q) => ({
      user_id: userId,
      session_id: sessionId,
      question_id: q.question_id,
      question: q.question,
      student_answer: q.student_answer,
      score: q.score,
      is_correct: q.is_correct,
      feedback: q.feedback,
    }));
    if (rows.length) {
      const { error: aErr } = await supabase.from("viva_answers").upsert(rows, { onConflict: "session_id,question_id" });
      if (aErr) throw aErr;
    }
  } catch (err) {
    console.error("viva log: evaluation failed", err);
  }
}
