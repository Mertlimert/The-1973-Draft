from __future__ import annotations

import base64
import json
import math
import os
import re
import sys
import struct
import wave
from io import BytesIO
from typing import Any

import httpx


HEX_PATTERN = re.compile(r"^[0-9a-fA-F]+$")


class MiniMaxTextService:
    def __init__(self) -> None:
        self.api_key = os.getenv("MINIMAX_API_KEY")
        self.api_url = os.getenv("MINIMAX_TEXT_API_URL", "https://api.minimax.io/v1/chat/completions")
        self.model = os.getenv("MINIMAX_TEXT_MODEL", "MiniMax-M2.7")

    async def chat_json(self, *, system: str, user: str, temperature: float = 0.8) -> dict[str, Any]:
        if not self.api_key:
            return {"feedback": "Make the farewell feel more personal, with grief and resistance sharing the same final image."}

        content = await self._chat(
            system=system,
            user=user,
            temperature=temperature,
            max_completion_tokens=250,
            response_format={"type": "json_object"},
        )

        try:
            output = json.loads(content)
        except json.JSONDecodeError:
            return {"feedback": "Tighten the ending so the farewell lands with quiet revolt."}

        if isinstance(output, dict) and "feedback" in output:
            return output

        return {"feedback": "Tighten the ending so the farewell lands with quiet revolt."}

    async def chat_text(self, *, system: str, user: str, temperature: float = 0.9) -> str:
        if not self.api_key:
            return self._fallback_text(system=system)

        try:
            content = await self._chat(
                system=system,
                user=user,
                temperature=temperature,
                max_completion_tokens=400,
            )
            return content or self._fallback_text(system=system)
        except Exception:
            return self._fallback_text(system=system)

    async def _chat(
        self,
        *,
        system: str,
        user: str,
        temperature: float,
        max_completion_tokens: int,
        response_format: dict[str, str] | None = None,
    ) -> str:
        payload: dict[str, Any] = {
            "model": self.model,
            "messages": [
                {"role": "system", "name": "System", "content": system},
                {"role": "user", "name": "User", "content": user},
            ],
            "temperature": min(max(temperature, 0.01), 1.0),
            "max_completion_tokens": max_completion_tokens,
        }
        if response_format:
            payload["response_format"] = response_format

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=90) as client:
            response = await client.post(self.api_url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        content = data["choices"][0]["message"].get("content", "")
        return self._strip_think_block(content)

    def _strip_think_block(self, content: str) -> str:
        text = content.strip()
        if text.startswith("<think>") and "</think>" in text:
            text = text.split("</think>", 1)[1]
        return text.strip()

    def _fallback_text(self, *, system: str) -> str:
        if "music director" in system.lower():
            return "Melancholic anti-war folk ballad, 72 BPM, fingerpicked acoustic guitar, brushed snare, low harmonica, intimate male vocal, dusty tape warmth."
        if "agent 1 again" in system.lower():
            return "\n".join(
                [
                    "I leave my mother's name inside the kitchen light,",
                    "A jacket on the chair and a prayer against the rain,",
                    "This war wants my body, not the mercy in my hands,",
                    "So I walk into the dark still singing what remains.",
                ]
            )
        return "\n".join(
            [
                "I leave my shadow hanging on the backyard line,",
                "My father's quiet hammer, my sister's Sunday song,",
                "The papers call it duty, but the wind calls it goodbye,",
                "And every mile to nowhere tells me I don't belong.",
            ]
        )


class MiniMaxLyricsService:
    def __init__(self) -> None:
        self.api_key = os.getenv("MINIMAX_API_KEY")
        self.api_url = os.getenv("MINIMAX_LYRICS_API_URL", "https://api.minimax.io/v1/lyrics_generation")

    async def write_full_song(self, *, prompt: str, title: str = "The 1973 Draft") -> dict[str, str]:
        if not self.api_key:
            return {
                "song_title": title,
                "style_tags": "Anti-war folk, melancholic, 1973, male vocals",
                "lyrics": self._fallback_song_lyrics(),
            }

        payload = {
            "mode": "write_full_song",
            "prompt": prompt,
            "title": title,
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=90) as client:
                response = await client.post(self.api_url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
        except Exception:
            return {
                "song_title": title,
                "style_tags": "Anti-war folk, melancholic, 1973, male vocals",
                "lyrics": self._fallback_song_lyrics(),
            }

        lyrics = (data.get("lyrics") or "").strip()
        if not lyrics:
            lyrics = self._fallback_song_lyrics()

        return {
            "song_title": data.get("song_title") or title,
            "style_tags": data.get("style_tags") or "Anti-war folk, melancholic, 1973, male vocals",
            "lyrics": lyrics,
        }

    def _fallback_song_lyrics(self) -> str:
        return "\n".join(
            [
                "[Intro]",
                "Train whistle moaning through the morning rain",
                "",
                "[Verse]",
                "I left my mother's apron by the kitchen door",
                "My name inside a jacket and my boots beside the floor",
                "They called it duty in a voice as cold as steel",
                "But the fields I leave behind are the only country real",
                "",
                "[Chorus]",
                "Knockin' at the dark with a song I cannot hide",
                "Half goodbye, half fury, with the whole world on my side",
                "If they take my number let them never take my soul",
                "I was born for human mercy, not another bloody roll",
                "",
                "[Verse]",
                "My sister's Sunday laughter still hangs above the sink",
                "My father folds his silence like a note in faded ink",
                "Every mile toward nowhere makes the young men disappear",
                "So I sing against the engine and I keep their voices near",
                "",
                "[Outro]",
                "Let the badge fall softly, let the home fire stay",
                "I walk into the unknown but I do not go their way",
            ]
        )


class MiniMaxMusicService:
    def __init__(self) -> None:
        self.api_key = os.getenv("MINIMAX_API_KEY")
        self.api_url = os.getenv("MINIMAX_MUSIC_API_URL", "https://api.minimax.io/v1/music_generation")
        self.model = os.getenv("MINIMAX_MUSIC_MODEL", "music-2.6")
        self.output_format = os.getenv("MINIMAX_MUSIC_OUTPUT_FORMAT", "url")

    async def generate_song(self, *, lyrics: str, audio_prompt: str) -> dict[str, Any]:
        if not self.api_key:
            return {
                "audio_url": None,
                "audio_base64": self._demo_wav_base64(),
                "audio_mime": "audio/wav",
                "provider": "mock",
            }

        normalized_lyrics = (lyrics or "").strip()
        if not normalized_lyrics:
            return self._fallback_song("MiniMax request skipped: lyrics were empty after generation.")

        payload = {
            "model": self.model,
            "prompt": audio_prompt,
            "lyrics": normalized_lyrics,
            "output_format": self.output_format,
            "audio_setting": {
                "sample_rate": 44100,
                "bitrate": 256000,
                "format": "mp3",
            },
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=90) as client:
                response = await client.post(self.api_url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
        except Exception as exc:
            return self._fallback_song(f"MiniMax request failed: {exc}")

        audio_data = data.get("data") or {}
        audio_url = audio_data.get("audio_url")
        audio_value = audio_data.get("audio")

        if not audio_url and isinstance(audio_value, str) and audio_value.startswith(("http://", "https://")):
            audio_url = audio_value

        audio_hex = audio_value if self._looks_like_hex(audio_value) else None

        if not audio_url and not audio_hex:
            base_resp = data.get("base_resp") or {}
            status_msg = base_resp.get("status_msg") or "MiniMax returned no audio payload."
            trace_id = data.get("trace_id", "n/a")
            print(
                f"[MiniMax music] No audio returned. model={self.model} trace_id={trace_id} status={base_resp.get('status_code')} msg={status_msg}",
                file=sys.stderr,
            )
            print(json.dumps(data, indent=2, ensure_ascii=False), file=sys.stderr)
            return self._fallback_song(status_msg)

        return {
            "audio_url": audio_url,
            "audio_base64": self._hex_to_base64(audio_hex) if audio_hex else None,
            "audio_mime": "audio/mpeg",
            "provider": "minimax",
            "duration_ms": (data.get("extra_info") or {}).get("music_duration"),
        }

    def _fallback_song(self, reason: str) -> dict[str, Any]:
        return {
            "audio_url": None,
            "audio_base64": self._demo_wav_base64(),
            "audio_mime": "audio/wav",
            "provider": f"mock ({reason})",
            "duration_ms": 3000,
        }

    def _hex_to_base64(self, value: str) -> str:
        return base64.b64encode(bytes.fromhex(value)).decode("utf-8")

    def _looks_like_hex(self, value: Any) -> bool:
        return isinstance(value, str) and len(value) % 2 == 0 and bool(HEX_PATTERN.fullmatch(value))

    def _demo_wav_base64(self) -> str:
        sample_rate = 22050
        duration_seconds = 3
        amplitude = 10000
        frequency = 196.0
        buffer = BytesIO()

        with wave.open(buffer, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)

            for index in range(sample_rate * duration_seconds):
                fade = min(index / 4000, 1.0, (sample_rate * duration_seconds - index) / 4000)
                sample = int(amplitude * fade * math.sin(2 * math.pi * frequency * index / sample_rate))
                wav_file.writeframes(struct.pack("<h", sample))

        return base64.b64encode(buffer.getvalue()).decode("utf-8")
