import os
from typing import NamedTuple, Optional

from dotenv import load_dotenv
from deepgram import DeepgramClient

load_dotenv()

API_KEY = os.getenv("DEEPGRAM_API_KEY")

if not API_KEY:
    raise RuntimeError("DEEPGRAM_API_KEY not found.")

deepgram = DeepgramClient(api_key=API_KEY)


class TranscriptionResult(NamedTuple):
    transcript: str
    # Deepgram's own view of how much audio it received — the "audio duration
    # transmitted" figure for diagnostics. Absent on some responses.
    duration_s: Optional[float]
    deepgram_request_id: Optional[str]


def transcribe_audio(audio_bytes: bytes) -> TranscriptionResult:
    """
    Accepts raw audio bytes (.webm recorded by MediaRecorder).
    Returns the transcript plus Deepgram metadata used for diagnostics.
    """

    response = deepgram.listen.v1.media.transcribe_file(
        request=audio_bytes,
        model="nova-3",
        smart_format=True,
        punctuate=True,
        filler_words=False,
        paragraphs=False,
        diarize=False,
    )

    metadata = getattr(response, "metadata", None)
    duration_s = getattr(metadata, "duration", None)
    deepgram_request_id = getattr(metadata, "request_id", None)

    # Deepgram can return a well-formed response with no channels or no
    # alternatives — silence, an unsupported container, or an empty result.
    # Index defensively so that case is an empty transcript rather than an
    # IndexError that surfaces as HTTP 500 to the student.
    transcript = ""
    try:
        channels = response.results.channels
        alternatives = channels[0].alternatives if len(channels) > 0 else []
        if len(alternatives) > 0:
            transcript = (alternatives[0].transcript or "").strip()
    except (AttributeError, IndexError, TypeError):
        transcript = ""

    return TranscriptionResult(transcript, duration_s, deepgram_request_id)
