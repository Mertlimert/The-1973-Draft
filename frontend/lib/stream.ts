import { GenerationResult, StreamStage } from "@/lib/types";

type StreamHandlers = {
  onStage: (stage: StreamStage) => void;
  onResult: (result: GenerationResult) => void;
};

export async function startGeneration(userInput: string, handlers: StreamHandlers) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
  const response = await fetch(`${apiBaseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_input: userInput }),
  });

  if (!response.ok || !response.body) {
    throw new Error("The archive room stayed silent.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const event = parseSseEvent(chunk);
      if (!event) {
        continue;
      }

      if (event.type === "stage") {
        handlers.onStage(event.data as StreamStage);
      }

      if (event.type === "result") {
        handlers.onResult(event.data as GenerationResult);
      }
    }
  }
}

function parseSseEvent(raw: string): { type: string; data: unknown } | null {
  const lines = raw.split("\n");
  const eventLine = lines.find((line) => line.startsWith("event: "));
  const dataLine = lines.find((line) => line.startsWith("data: "));

  if (!eventLine || !dataLine) {
    return null;
  }

  return {
    type: eventLine.replace("event: ", "").trim(),
    data: JSON.parse(dataLine.replace("data: ", "").trim()),
  };
}
