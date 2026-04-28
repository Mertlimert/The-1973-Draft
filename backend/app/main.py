from __future__ import annotations

import os
from pathlib import PurePosixPath
from urllib.parse import urlparse

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi import Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.responses import StreamingResponse
import httpx

from app.schemas import GenerateRequest
from app.services.pipeline import DraftPipeline

load_dotenv()

app = FastAPI(title="The 1973 Draft API", version="0.1.0")
pipeline = DraftPipeline()

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
allowed_origins = {
    frontend_origin,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
}
app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/api/generate")
async def generate(request: GenerateRequest) -> StreamingResponse:
    generator = pipeline.stream(request.user_input.strip())
    return StreamingResponse(generator, media_type="text/event-stream")


@app.get("/api/audio/download")
async def download_audio(url: str = Query(..., min_length=8)) -> Response:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        raise HTTPException(status_code=400, detail="Only http/https audio URLs are supported.")

    try:
        async with httpx.AsyncClient(timeout=300, follow_redirects=True) as client:
            response = await client.get(url)
            response.raise_for_status()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Unable to fetch remote audio: {exc}") from exc

    content_type = response.headers.get("content-type", "application/octet-stream").split(";")[0].strip().lower()
    final_url = str(response.url)
    filename = _build_audio_filename(content_type=content_type, url=final_url, content=response.content)

    if not content_type.startswith("audio/") and filename.endswith(".bin"):
        raise HTTPException(status_code=502, detail=f"Downloaded content was not recognized as audio. content-type={content_type}")

    return Response(
        content=response.content,
        media_type=content_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _build_audio_filename(*, content_type: str, url: str, content: bytes) -> str:
    extension_map = {
        "audio/mpeg": ".mp3",
        "audio/mp3": ".mp3",
        "audio/wav": ".wav",
        "audio/x-wav": ".wav",
        "audio/wave": ".wav",
        "audio/flac": ".flac",
        "audio/ogg": ".ogg",
        "audio/mp4": ".m4a",
        "audio/aac": ".aac",
        "audio/webm": ".webm",
    }

    if content_type in extension_map:
        return f"the-1973-draft-audio{extension_map[content_type]}"

    suffix = PurePosixPath(urlparse(url).path).suffix.lower()
    if suffix in {".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aac", ".webm"}:
        return f"the-1973-draft-audio{suffix}"

    sniffed = _sniff_audio_extension(content)
    return f"the-1973-draft-audio{sniffed}"


def _sniff_audio_extension(content: bytes) -> str:
    if content.startswith(b"ID3") or content[:2] == b"\xff\xfb":
        return ".mp3"
    if content.startswith(b"RIFF") and b"WAVE" in content[:16]:
        return ".wav"
    if content.startswith(b"fLaC"):
        return ".flac"
    if content.startswith(b"OggS"):
        return ".ogg"
    if len(content) > 8 and content[4:8] == b"ftyp":
        return ".m4a"
    return ".bin"
