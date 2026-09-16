import os

from dotenv import load_dotenv
from deepgram import DeepgramClient

load_dotenv()

API_KEY = os.getenv("DEEPGRAM_API_KEY")

if not API_KEY:
    raise RuntimeError("DEEPGRAM_API_KEY not found.")

deepgram = DeepgramClient(api_key=API_KEY)


def transcribe_audio(audio_bytes: bytes) -> str:
    """
    Accepts raw audio bytes (.webm recorded by MediaRecorder)
    Returns transcript string.
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

    transcript = (
        response.results
        .channels[0]
        .alternatives[0]
        .transcript
    )

    return transcript.strip()