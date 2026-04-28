"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, ExternalLink, Pause, Play, QrCode, SkipBack, SkipForward } from "lucide-react";

import { GenerationResult } from "@/lib/types";

type Props = {
  result: GenerationResult;
};

export function ResultSheet({ result }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioSrc = result.audio_url
    ? result.audio_url
    : result.audio_base64
      ? `data:${result.audio_mime};base64,${result.audio_base64}`
      : undefined;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
  const downloadHref = result.audio_url
    ? `${apiBaseUrl}/api/audio/download?url=${encodeURIComponent(result.audio_url)}`
    : audioSrc;

  const duration = useMemo(() => {
    if (audioRef.current?.duration && Number.isFinite(audioRef.current.duration)) {
      return audioRef.current.duration;
    }
    return result.audio_duration_ms ? result.audio_duration_ms / 1000 : 0;
  }, [result.audio_duration_ms, currentTime]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  function togglePlayback() {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    void audioRef.current.play();
    setIsPlaying(true);
  }

  function jump(seconds: number) {
    if (!audioRef.current) {
      return;
    }
    audioRef.current.currentTime = Math.max(
      0,
      Math.min(audioRef.current.duration || duration || 0, audioRef.current.currentTime + seconds),
    );
    setCurrentTime(audioRef.current.currentTime);
  }

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <section className="relative w-full max-w-[1000px] border-2 border-[#27231d] bg-[#f5f0e6] px-7 py-6 shadow-[0_24px_80px_rgba(39,35,29,0.08)] sm:px-14 sm:py-12">
      <div className="absolute right-8 top-8 rotate-[12deg] border-[5px] border-[#b85b52] p-2 text-[#b85b52]">
        <div className="border-[3px] border-[#b85b52] px-6 py-3 text-4xl font-bold uppercase tracking-[0.08em]">Approved</div>
      </div>

      <header className="flex justify-between gap-6 border-b-2 border-[#27231d] pb-5">
        <div>
          <h1 className="text-[22px] font-bold uppercase tracking-[0.26em] text-[#27231d]">Form 73-D: Selective Service System</h1>
          <p className="mt-2 text-sm uppercase tracking-[0.08em] text-[#373129]">Department of Defense - Bureaucracy Division (1973)</p>
        </div>
        <div className="pt-3 text-right text-sm uppercase tracking-[0.12em] text-[#373129]">
          <p>Status: Complete</p>
          <p>File No. 1973-042</p>
        </div>
      </header>

      <div className="grid gap-10 py-10 md:grid-cols-[1fr_400px]">
        <div className="border-l-[3px] border-[#27231d] pl-8">
          <pre className="whitespace-pre-wrap font-document text-[20px] leading-[2.1] text-[#27231d]">{result.final_lyrics}</pre>
          <div className="mt-10 max-w-xl border border-[#27231d]/15 bg-[#efe9dd] p-4 text-xs uppercase tracking-[0.08em] text-[#60594e]">
            <p className="font-bold tracking-[0.18em]">Judge&apos;s note</p>
            <p className="mt-3 text-sm normal-case leading-7 text-[#3d382f]">{result.judge_feedback}</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="border border-[#27231d] bg-[#ded8d1] p-8">
            <div className="flex items-center justify-between text-sm uppercase tracking-[0.16em] text-[#27231d]">
              <span>Audio Dossier</span>
              <span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="mt-6 h-[6px] bg-[#27231d]/15">
              <div className="relative h-full bg-[#27231d]" style={{ width: `${progress}%` }}>
                <span className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 bg-[#27231d]" />
              </div>
            </div>
            <div className="mt-8 flex items-center justify-center gap-8">
              <button type="button" onClick={() => jump(-10)} className="flex h-10 w-10 items-center justify-center border border-[#27231d]">
                <SkipBack className="h-5 w-5 text-[#27231d]" />
              </button>
              <button type="button" onClick={togglePlayback} className="flex h-14 w-14 items-center justify-center border-2 border-[#27231d]">
                {isPlaying ? <Pause className="h-6 w-6 text-[#27231d]" /> : <Play className="h-6 w-6 text-[#27231d]" />}
              </button>
              <button type="button" onClick={() => jump(10)} className="flex h-10 w-10 items-center justify-center border border-[#27231d]">
                <SkipForward className="h-5 w-5 text-[#27231d]" />
              </button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {downloadHref ? (
                <a
                  href={downloadHref}
                  className="inline-flex items-center gap-2 border border-[#27231d] px-4 py-2 text-xs uppercase tracking-[0.16em] text-[#27231d] hover:bg-[#27231d] hover:text-[#f5f0e6]"
                >
                  <Download className="h-4 w-4" />
                  Download Audio
                </a>
              ) : null}
              {result.audio_url ? (
                <a
                  href={result.audio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-[#27231d]/50 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[#27231d] hover:bg-[#27231d] hover:text-[#f5f0e6]"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Source URL
                </a>
              ) : null}
            </div>
            <audio ref={audioRef} src={audioSrc} preload="metadata" className="hidden" />
          </div>

          <div className="flex gap-5">
            <div className="flex h-40 w-40 items-center justify-center bg-[#27231d] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]">
              {result.qr_code ? (
                <img src={result.qr_code} alt="Generated QR code" className="h-full w-full bg-white object-contain p-3" />
              ) : (
                <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-[#f5f0e6]">
                  <QrCode className="h-8 w-8 text-[#f5f0e6]" />
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[18px] font-bold uppercase tracking-[0.18em] text-[#27231d]">Scan to Retrieve</p>
              <p className="text-[18px] font-bold uppercase tracking-[0.18em] text-[#27231d]">Audio Dossier</p>
              <p className="mt-4 text-sm uppercase tracking-[0.16em] text-[#8b8478]">
                {result.qr_code ? "External link authorized" : "Link unavailable for this run"}
              </p>
            </div>
          </div>

          <div className="border border-[#27231d]/15 bg-[#efe9dd] p-4 text-xs uppercase tracking-[0.1em] text-[#60594e]">
            <p>Audio status: {result.audio_status}</p>
            <p className="mt-2 normal-case leading-6 text-[#3d382f]">{result.audio_prompt}</p>
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-between border-t-2 border-[#27231d] pt-5 text-sm uppercase tracking-[0.12em] text-[#8b8478]">
        <span>End of transmission</span>
        <span className="text-[#373129]">
          Verified by: <span className="inline-block w-28 border-b border-[#27231d] align-middle" />
        </span>
      </footer>
    </section>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
