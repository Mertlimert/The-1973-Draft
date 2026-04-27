export type StreamStage = {
  message: string;
};

export type GenerationResult = {
  contexts: Array<{ id: string; text: string; source: string }>;
  draft_1: string;
  judge_feedback: string;
  final_lyrics: string;
  song_lyrics: string;
  audio_prompt: string;
  audio_url: string | null;
  audio_base64: string | null;
  audio_mime: string;
  audio_status: string;
  audio_duration_ms: number | null;
  qr_code: string | null;
  provider: string;
};
