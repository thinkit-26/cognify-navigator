"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import Microphone from "./Microphone";
import { transcribeAudio } from "@/lib/viva/api";
import {
  abortResponse,
  currentResponseId,
  noteBlob,
  noteRecordingStart,
  noteRecordingStartFailed,
  noteRecordingStop,
  noteTranscribe,
  type TranscribeStatus,
} from "@/lib/viva/diagnostics";

export type RecordingPhase = "reading" | "recording" | "processing";

interface Props {
  phase: RecordingPhase;
  onTranscriptChange: (transcript: string) => void;
  onTranscriptionDone?: () => void;
  /**
   * Transcription (or capture start) failed. Without this the page sat on
   * "Processing" forever with the student's answer silently lost.
   */
  onTranscriptionFailed?: () => void;
}

/** Maps a thrown transcription error onto the status we log. */
function classifyTranscribeError(err: unknown): TranscribeStatus {
  if (err instanceof Error && err.name === "AbortError") return "timeout";
  if (err instanceof Error && /request failed \(\d+\)/.test(err.message)) return "http_error";
  if (err instanceof Error && err.message === "Transcription failed") return "http_error";
  return "network";
}

export default function MicrophoneContainer({
  phase,
  onTranscriptChange,
  onTranscriptionDone,
  onTranscriptionFailed,
}: Props) {
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const prevPhase = useRef<RecordingPhase>(phase);

  const handleStop = useCallback(
    async (_blobUrl: string, blob: Blob) => {
      setError(null);
      noteBlob(blob.size);

      try {
        const text = await transcribeAudio(blob, currentResponseId() ?? undefined);
        noteTranscribe(text.trim() ? "ok" : "empty", text);
        setTranscript(text);
        onTranscriptChange(text);
        onTranscriptionDone?.();
      } catch (err) {
        noteTranscribe(classifyTranscribeError(err), "");
        setError(err instanceof Error ? err.message : "Failed to transcribe audio");
        onTranscriptionFailed?.();
      }
    },
    [onTranscriptChange, onTranscriptionDone, onTranscriptionFailed]
  );

  const { startRecording, stopRecording } = useReactMediaRecorder({
    audio: true,
    onStop: handleStop,
  });

  // Automatically start/stop recording as `phase` changes, driven by the parent page
  useEffect(() => {
    const wasRecording = prevPhase.current === "recording";
    const isRecording = phase === "recording";

    if (!wasRecording && isRecording) {
      setTranscript("");
      setError(null);
      onTranscriptChange("");
      // startRecording() awaits getUserMedia, so stamp capture time when it
      // actually resolves rather than when we asked for it.
      void Promise.resolve(startRecording()).then(
        () => noteRecordingStart(),
        (err: unknown) => {
          noteRecordingStartFailed();
          setError(err instanceof Error ? err.message : "Microphone unavailable");
          onTranscriptionFailed?.();
        }
      );
    }

    if (wasRecording && !isRecording) {
      noteRecordingStop();
      stopRecording();
    }

    prevPhase.current = phase;
  }, [phase, startRecording, stopRecording, onTranscriptChange, onTranscriptionFailed]);

  // Capture still live when this recorder goes away: record why and flush, so
  // the loss shows up as an anomaly instead of vanishing. No-op once closed.
  useEffect(() => () => abortResponse("unmount"), []);

  return <Microphone phase={phase} transcript={transcript} error={error} />;
}
