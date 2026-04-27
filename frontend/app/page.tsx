"use client";

import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Hourglass, Stamp } from "lucide-react";

import { ResultSheet } from "@/components/result-sheet";
import { startGeneration } from "@/lib/stream";
import { GenerationResult } from "@/lib/types";

const initialStage = "Waiting for your farewell...";

export default function HomePage() {
  const [userInput, setUserInput] = useState("");
  const [activeStage, setActiveStage] = useState(initialStage);
  const [stageHistory, setStageHistory] = useState<string[]>([]);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const archiveLabel = useMemo(() => "Form 73-D / Farewell Record", []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setStageHistory([]);

    try {
      await startGeneration(userInput, {
        onStage: (stage) => {
          setActiveStage(stage.message);
          setStageHistory((prev) => [...prev, stage.message]);
        },
        onResult: (payload) => {
          setActiveStage("The record has been stamped.");
          setResult(payload);
        },
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Something drifted off the page.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1120px] items-center justify-center px-4 py-10">
      {result ? (
        <ResultSheet result={result} />
      ) : isLoading ? (
        <section className="relative w-full max-w-[1000px] border-2 border-[#27231d] bg-[#f5f0e6] px-7 py-6 shadow-[0_24px_80px_rgba(39,35,29,0.08)] sm:px-14 sm:py-12">
          <div className="absolute right-0 top-0 border-b-2 border-l-2 border-[#27231d] px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-[#27231d]">
            Status: Processing
          </div>
          <Hourglass className="h-6 w-6 text-[#6a665f]" />
          <div className="mx-auto mt-10 max-w-2xl border-b border-[#27231d]/20 pb-8 text-center">
            <h1 className="font-document text-5xl uppercase tracking-[0.04em] text-[#241f18]">Department of Defense</h1>
            <p className="mt-4 text-4xl font-bold uppercase tracking-[0.2em] text-[#241f18]">Bureaucracy Division</p>
            <p className="mt-7 text-sm uppercase tracking-[0.18em] text-[#7b7264]">Form 73-D : Awaiting Data Retrieval</p>
          </div>
          <div className="mt-12 min-h-[360px] border-l border-[#27231d]/20 pl-10">
            <ul className="space-y-8">
              {stageHistory.map((stage, index) => (
                <motion.li
                  key={`${stage}-${index}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-[18px] tracking-[0.08em] ${index === stageHistory.length - 1 ? "text-[#9c342d]" : "text-[#241f18]"}`}
                >
                  <span className="mr-5 text-[#8e8679]">&gt;</span>
                  {stage}
                </motion.li>
              ))}
              {stageHistory.length === 0 ? <li className="text-[#241f18]">{activeStage}</li> : null}
            </ul>
          </div>
          <div className="mt-8 flex items-end justify-between border-t border-[#27231d]/20 pt-6 text-xs uppercase tracking-[0.16em] text-[#7b7264]">
            <p>System ID: 73-A-009</p>
            <div className="flex items-center gap-3">
              <Stamp className="h-16 w-16 rounded-full border border-[#d3cec4] p-3 text-[#d3cec4]" />
              <p>Do not abort sequence</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="flex w-full max-w-[1000px] flex-col border-2 border-[#27231d] bg-[#f5f0e6] px-7 py-6 shadow-[0_24px_80px_rgba(39,35,29,0.08)] sm:px-14 sm:py-12">
          <header className="flex flex-col justify-between gap-6 border-b-2 border-[#27231d] pb-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-[12px] uppercase tracking-[0.34em] text-[#6d665d]">{archiveLabel}</p>
              <h1 className="mt-4 font-document text-5xl text-[#241f18] sm:text-6xl">The 1973 Draft</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-[#3a342c]">
                Before the unknown takes its due, what are you leaving behind?
              </p>
            </div>
            <div className="border border-[#a35146] px-4 py-3 text-sm uppercase tracking-[0.18em] text-[#a35146]">
              Classified
            </div>
          </header>

          <div className="grid gap-12 pt-12 lg:grid-cols-[240px_1fr]">
            <aside className="hidden border-r border-[#27231d] pr-8 lg:block">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#27231d] text-2xl">
                73
              </div>
              <h2 className="mt-6 font-document text-3xl text-[#241f18]">Draft Status</h2>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#6d665d]">File No. 1973-042</p>
              <div className="mt-8 space-y-1 text-xs font-bold uppercase tracking-[0.16em]">
                <div className="border-y border-[#27231d] bg-[#a35146] px-4 py-4 text-[#f5f0e6]">Registration</div>
                <div className="border-b border-[#27231d]/15 px-4 py-4 text-[#27231d]">Examination</div>
                <div className="border-b border-[#27231d]/15 px-4 py-4 text-[#27231d]">Classification</div>
                <div className="border-b border-[#27231d]/15 px-4 py-4 text-[#27231d]">Induction</div>
              </div>
            </aside>

            <div className="flex flex-col">
              <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-[560px] flex-col gap-10">
                <div className="text-center">
                  <p className="text-[13px] uppercase tracking-[0.2em] text-[#7b7264]">Department of the Unknown - Form 73</p>
                  <p className="mt-2 font-document text-4xl uppercase text-[#241f18]">Selective Service Statement</p>
                </div>
                <div className="space-y-3">
                  <label htmlFor="farewell" className="block text-sm uppercase tracking-[0.12em] text-[#3a342c]">
                    What burden are you leaving behind at Heaven&apos;s Door?
                  </label>
                  <textarea
                    id="farewell"
                    rows={3}
                    maxLength={240}
                    required
                    value={userInput}
                    onChange={(event) => setUserInput(event.target.value)}
                    placeholder="Type here..."
                    className="w-full resize-none border-0 border-b-2 border-[#27231d] bg-transparent px-0 py-3 text-[18px] leading-8 text-[#241f18] outline-none focus:border-[#a35146] focus:ring-0"
                  />
                </div>
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isLoading || userInput.trim().length < 3}
                    className="border-2 border-[#27231d] px-8 py-4 text-[15px] uppercase tracking-[0.18em] text-[#241f18] transition hover:border-[#a35146] hover:bg-[#a35146] hover:text-[#f5f0e6] disabled:opacity-50"
                  >
                    [ Sign &amp; Submit ]
                  </button>
                </div>
              </form>

              <div className="mt-auto border-t border-[#27231d]/20 pt-8 text-center text-[11px] uppercase tracking-[0.16em] text-[#7b7264]">
                Official use only - do not duplicate
              </div>
            </div>
          </div>
        </section>
      )}

      {error ? (
        <section className="absolute bottom-6 left-1/2 w-full max-w-[1000px] -translate-x-1/2 rounded-sm border border-red-900/30 bg-[#f3dfd8] px-6 py-4 text-red-950">
          <p className="text-xs uppercase tracking-[0.18em]">Transmission error</p>
          <p className="mt-2 text-sm">{error}</p>
        </section>
      ) : null}
    </main>
  );
}
