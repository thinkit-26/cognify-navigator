/**
 * Structured diagnostics for the oral viva recording pipeline.
 *
 * One record is built in memory per answer and emitted as a single console line
 * when that answer finishes (or is lost). Filter the console for `[viva-diag]`.
 *
 * Production-safe by construction: no network calls, no storage, no new
 * dependencies, and nothing expensive on the capture path. Never records audio,
 * auth tokens, or a full transcript — only lengths and a short preview.
 */

export type StopReason = "timer" | "manual" | "unmount" | "unknown";
export type TranscribeStatus = "ok" | "empty" | "timeout" | "http_error" | "network";

export interface ResponseLog {
  /** ISO timestamp when this answer's record was opened. */
  ts: string;
  sessionId: string;
  /** `sessionId:questionNumber` — matches the backend's X-Viva-Response-Id. */
  responseId: string;
  questionId: number | null;
  questionNumber: number | null;
  /** Reading window the UI promised, in ms. */
  readingConfiguredMs: number | null;
  recordingStartedAt: string | null;
  recordingStoppedAt: string | null;
  recordingDurationMs: number | null;
  /** getUserMedia or MediaRecorder refused to start capture. */
  recordingStartFailed: boolean;
  /**
   * Why capture ended. The single most useful field for cutoff reports:
   * "timer" means the 45s cap stopped the student mid-sentence.
   */
  stopReason: StopReason | null;
  blobBytes: number | null;
  transcribeStatus: TranscribeStatus | null;
  transcriptChars: number | null;
  /** First characters only — enough to spot truncation, not a full transcript. */
  transcriptPreview: string | null;
  submitMs: number | null;
  submitted: boolean;
  anomalies: string[];
}

const PREVIEW_CHARS = 60;

let active: ResponseLog | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

/** Open a record for the question about to be asked. */
export function beginResponse(init: {
  sessionId: string;
  questionNumber: number;
  questionId: number | null;
  readingConfiguredMs: number;
}): ResponseLog {
  // A previous answer never closed out (hang, route change) — flush it first,
  // and mark it so a dropped answer is visible rather than silently absent.
  if (active) endResponse("RECORD_INCOMPLETE");

  active = {
    ts: nowIso(),
    sessionId: init.sessionId,
    responseId: `${init.sessionId}:${init.questionNumber}`,
    questionId: init.questionId,
    questionNumber: init.questionNumber,
    readingConfiguredMs: init.readingConfiguredMs,
    recordingStartedAt: null,
    recordingStoppedAt: null,
    recordingDurationMs: null,
    recordingStartFailed: false,
    stopReason: null,
    blobBytes: null,
    transcribeStatus: null,
    transcriptChars: null,
    transcriptPreview: null,
    submitMs: null,
    submitted: false,
    anomalies: [],
  };

  return active;
}

/** Correlation id for the backend's X-Viva-Response-Id header. */
export function currentResponseId(): string | null {
  return active?.responseId ?? null;
}

/** Record why the parent page decided to stop capture. Only sets once. */
export function noteStopReason(reason: StopReason): void {
  if (!active || active.stopReason) return;
  active.stopReason = reason;
}

/** Capture actually began. Ignored if the recorder already wound up. */
export function noteRecordingStart(): void {
  if (!active || active.recordingStoppedAt) return;
  active.recordingStartedAt = nowIso();
}

/** Capture was requested but never came up. */
export function noteRecordingStartFailed(): void {
  if (!active) return;
  active.recordingStartFailed = true;
}

/**
 * Capture ended. Idempotent, and requires a real start — a phase change landing
 * on a freshly opened record (a retry) must not read as capture that never ran.
 */
export function noteRecordingStop(): void {
  if (!active || active.recordingStoppedAt || !active.recordingStartedAt) return;

  active.recordingStoppedAt = nowIso();
  active.recordingDurationMs =
    Date.parse(active.recordingStoppedAt) - Date.parse(active.recordingStartedAt);
}

export function noteBlob(bytes: number): void {
  if (!active) return;
  active.blobBytes = bytes;
}

export function noteTranscribe(status: TranscribeStatus, transcript: string): void {
  if (!active) return;
  active.transcribeStatus = status;
  active.transcriptChars = transcript.length;
  active.transcriptPreview = transcript.slice(0, PREVIEW_CHARS);
}

export function noteSubmit(ok: boolean, elapsedMs: number | null): void {
  if (!active) return;
  active.submitted = ok;
  active.submitMs = elapsedMs === null ? null : Math.round(elapsedMs);
}

/**
 * Emit the record and close it out. Returns null when nothing is open, so it is
 * safe to call from more than one place. `anomaly` marks a close that was not a
 * clean completion (e.g. the record was superseded by the next question).
 */
export function endResponse(anomaly?: string): ResponseLog | null {
  if (!active) return null;

  const record = active;
  active = null;
  record.anomalies = detectAnomalies(record);
  if (anomaly) record.anomalies.push(anomaly);

  console.info("[viva-diag]", JSON.stringify(record));
  return record;
}

/**
 * Recorder went away while an answer was still open — record why and flush so
 * the loss is visible instead of silent. No-op once the answer has been closed.
 */
export function abortResponse(reason: StopReason): void {
  if (!active) return;
  noteStopReason(reason);
  noteRecordingStop();
  endResponse();
}

/**
 * Flag only genuine anomalies.
 *
 * Note what is deliberately NOT here: ending capture by clicking "Next" is the
 * instructed, normal way to finish, so it is not an anomaly — it is carried by
 * the stopReason field instead. A student pausing to think never ends capture
 * at all (there is no silence detection), so a normal pause flags nothing.
 *
 * ANSWER_HIT_TIME_LIMIT is the one flag that marks an ordinary outcome, kept
 * because it is the primary correlate of "I was cut off" reports: capture ran
 * out of time without the student signing off. It is a correlate, not proof —
 * this pipeline has no voice-activity detection, so it cannot tell "still
 * talking" from "finished and waited". Read it alongside transcriptChars and
 * recordingDurationMs.
 */
function detectAnomalies(record: ResponseLog): string[] {
  const out: string[] = [];

  if (record.stopReason === "timer") out.push("ANSWER_HIT_TIME_LIMIT");
  if (record.stopReason === "unmount") out.push("RECORDING_LOST_ON_UNMOUNT");

  if (record.recordingStartFailed) out.push("RECORDING_NEVER_STARTED");

  if (record.blobBytes === 0) out.push("EMPTY_AUDIO_BLOB");

  // Transcription was attempted and did not succeed.
  const status = record.transcribeStatus;
  if (status && status !== "ok" && status !== "empty") out.push("TRANSCRIBE_FAILED");

  // Transcription succeeded but returned nothing for speech we know we captured.
  const capturedSpeech = (record.recordingDurationMs ?? 0) > 2000;
  if (capturedSpeech && record.transcribeStatus === "empty") {
    out.push("EMPTY_TRANSCRIPT");
  }

  // Capture ran but the answer never reached the server.
  if (!record.submitted && (record.recordingStartedAt || record.transcribeStatus)) {
    out.push("ANSWER_NOT_SUBMITTED");
  }

  return out;
}
