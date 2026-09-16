const API_BASE =
  (import.meta.env.VITE_ORALBOT_BACKEND as string | undefined) ??
  "http://127.0.0.1:8000";

const TIMEOUT_MS = 30_000;

async function timedFetch(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export async function getChapters() {
  const response = await timedFetch(`${API_BASE}/chapters`);

  if (!response.ok) {
    throw new Error(`Failed to fetch chapters (${response.status})`);
  }

  return response.json();
}

export async function getTopics(chapters: number[]) {
  const params = new URLSearchParams();

  chapters.forEach((chapter) =>
    params.append("chapters", chapter.toString())
  );

  const response = await timedFetch(
    `${API_BASE}/topics?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch topics (${response.status})`);
  }

  return response.json();
}

export async function startViva(
  chapters: number[],
  topics: string[]
) {
  const response = await timedFetch(`${API_BASE}/viva/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chapters,
      topics,
    }),
  });

  if (!response.ok) {
    throw new Error(`Unable to start viva (${response.status})`);
  }

  return response.json();
}

export async function getQuestion(sessionId: string) {
  const response = await timedFetch(
    `${API_BASE}/viva/question/${sessionId}`
  );

  if (!response.ok) {
    throw new Error(`Unable to fetch question (${response.status})`);
  }

  return response.json();
}

export async function submitAnswer(
  sessionId: string,
  answer: string
) {
  const response = await timedFetch(
    `${API_BASE}/viva/answer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        answer,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Unable to submit answer (${response.status})`);
  }

  return response.json();
}

export async function transcribeAudio(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");

  const response = await timedFetch(`${API_BASE}/transcribe/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Transcription request failed (${response.status})`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error("Transcription failed");
  }

  return data.transcript || "";
}

export async function getEvaluation(sessionId: string) {
  const response = await timedFetch(`${API_BASE}/viva/evaluation/${sessionId}`);

  if (!response.ok) {
    throw new Error(`Unable to fetch evaluation (${response.status})`);
  }

  return response.json();
}
