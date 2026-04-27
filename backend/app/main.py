from __future__ import annotations

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.schemas import GenerateRequest
from app.services.pipeline import DraftPipeline

load_dotenv()

app = FastAPI(title="The 1973 Draft API", version="0.1.0")
pipeline = DraftPipeline()

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
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
