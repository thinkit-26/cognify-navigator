"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import Microphone from "./Microphone";
import { transcribeAudio } from "@/lib/viva/api";

export type RecordingPhase = "reading" | "recording" | "processing";

interface Props {
  phase: RecordingPhase;
  onTranscriptChange: (transcript: string) => void;
  onTranscriptionDone?: () => void;
}

export default function MicrophoneContainer({
  phase,
  onTranscriptChange,
  onTranscriptionDone,
}: Props) {
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const prevPhase = useRef<RecordingPhase>(phase);

  const handleStop = useCallback(
    async (_blobUrl: string, blob: Blob) => {
      setError(null);

      try {
        const text = await transcribeAudio(blob);
        setTranscript(text);
        onTranscriptChange(text);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to transcribe audio"
        );
      } finally {
        onTranscriptionDone?.();
      }
    },
    [onTranscriptChange, onTranscriptionDone]
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
      startRecording();
    }

    if (wasRecording && !isRecording) {
      stopRecording();
    }

    prevPhase.current = phase;
  }, [phase, startRecording, stopRecording, onTranscriptChange]);

  return <Microphone phase={phase} transcript={transcript} error={error} />;
}
