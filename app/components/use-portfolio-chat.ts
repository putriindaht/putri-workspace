"use client";

import { useEffect, useRef, useState } from "react";
import type { WebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { getPortfolioAnswer, type ChatMessage } from "../../lib/portfolio-chat";
import { waitForWebLLMWorker } from "../../lib/webllm-runtime";
import { buildWebLLMMessages, WEBLLM_MODEL_ID } from "../../lib/webllm-prompt";
import {
  profile,
  projects,
  experience,
  skills,
  education,
  contact,
} from "../../lib/portfolio-data";

export type ChatEngine = "guide" | "webllm";
export type ModelStatus =
  | "idle"
  | "loading"
  | "ready"
  | "unsupported"
  | "error";
async function withTimeout<T>(
  task: Promise<T>,
  milliseconds: number,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      task,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("WebLLM operation timed out")),
          milliseconds,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const portfolio = { profile, projects, experience, skills, education, contact };

export function usePortfolioChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [chatEngine, setChatEngine] = useState<ChatEngine>("guide");
  const [modelStatus, setModelStatus] = useState<ModelStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [loadStage, setLoadStage] = useState("Checking browser support");
  const [chatError, setChatError] = useState("");
  const [generating, setGenerating] = useState(false);
  const engine = useRef<WebWorkerMLCEngine | null>(null);
  const worker = useRef<Worker | null>(null);
  const abortLoad = useRef<AbortController | null>(null);
  const session = useRef(0);
  const busy = useRef(false);
  const history = useRef<ChatMessage[]>([]);
  const nextId = useRef(0);
  const activeReply = useRef<number | null>(null);
  const generation = useRef(0);
  const guideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearGuideTimer() {
    if (guideTimer.current !== null) clearTimeout(guideTimer.current);
    guideTimer.current = null;
  }

  function updateMessages(update: (previous: ChatMessage[]) => ChatMessage[]) {
    const next = update(history.current);
    history.current = next;
    setMessages(next);
  }
  function finishPartialReply() {
    const id = activeReply.current;
    if (id !== null)
      updateMessages((previous) =>
        previous.map((message) =>
          message.id === id
            ? { ...message, text: message.text || "Reply stopped." }
            : message,
        ),
      );
    activeReply.current = null;
  }
  function stopReply() {
    clearGuideTimer();
    generation.current++;
    engine.current?.interruptGenerate();
    busy.current = false;
    setGenerating(false);
    finishPartialReply();
  }
  function releaseModel() {
    clearGuideTimer();
    session.current++;
    generation.current++;
    abortLoad.current?.abort();
    abortLoad.current = null;
    worker.current?.terminate();
    worker.current = null;
    engine.current = null;
    busy.current = false;
    setGenerating(false);
    finishPartialReply();
  }
  useEffect(
    () => () => {
      clearGuideTimer();
      abortLoad.current?.abort();
      worker.current?.terminate();
    },
    [],
  );

  function changeChatEngine(value: ChatEngine) {
    if (value === chatEngine) return;
    if (value === "guide") releaseModel();
    else stopReply();
    setChatEngine(value);
    setModelStatus("idle");
    setProgress(0);
    setChatError("");
  }
  function cancelModelLoad() {
    releaseModel();
    setModelStatus("idle");
    setProgress(0);
    setChatError("");
  }
  async function loadModel() {
    if (modelStatus === "loading" || modelStatus === "ready") return;
    const run = ++session.current;
    const controller = new AbortController();
    abortLoad.current = controller;
    setModelStatus("loading");
    setChatError("");
    setProgress(0);
    try {
      const gpu = (
        navigator as Navigator & {
          gpu?: { requestAdapter: () => Promise<unknown> };
        }
      ).gpu;
      setLoadStage("Checking browser support");
      if (!gpu || !(await withTimeout(gpu.requestAdapter(), 12000))) {
        if (run !== session.current) return;
        setModelStatus("unsupported");
        setChatError(
          "WebLLM needs WebGPU, which isn’t available in this browser. You can keep chatting with the portfolio guide.",
        );
        return;
      }
      setLoadStage("Preparing AI runtime");
      const { CreateWebWorkerMLCEngine } = await withTimeout(
        import("@mlc-ai/web-llm"),
        20000,
      );
      if (run !== session.current) return;
      const modelWorker = new Worker(
        new URL("../../lib/webllm.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.current = modelWorker;
      setLoadStage("Starting AI worker");
      await waitForWebLLMWorker(modelWorker, controller.signal);
      if (run !== session.current) return;
      setLoadStage("Downloading model files");
      const cancelledOrFailed = new Promise<never>((_, reject) => {
        controller.signal.addEventListener(
          "abort",
          () => reject(new Error("Model load cancelled")),
          { once: true },
        );
        modelWorker.addEventListener(
          "error",
          () => reject(new Error("AI worker could not start")),
          { once: true },
        );
      });
      const loaded = await withTimeout(
        Promise.race([
          CreateWebWorkerMLCEngine(
            modelWorker,
            WEBLLM_MODEL_ID,
            {
              initProgressCallback: (report) => {
                if (run === session.current) {
                  setProgress(Math.max(0, Math.min(1, report.progress)));
                  setLoadStage(
                    report.progress > 0.95
                      ? "Preparing model"
                      : "Loading model files",
                  );
                }
              },
            },
            { context_window_size: 8192 },
          ),
          cancelledOrFailed,
        ]),
        300000,
      );
      if (run !== session.current) {
        modelWorker.terminate();
        return;
      }
      engine.current = loaded;
      abortLoad.current = null;
      setProgress(1);
      setModelStatus("ready");
    } catch {
      if (run !== session.current) return;
      worker.current?.terminate();
      worker.current = null;
      engine.current = null;
      abortLoad.current = null;
      setModelStatus("error");
      setChatError(
        "The AI model couldn’t load. Check your connection and available device memory, then retry or use the portfolio guide.",
      );
    }
  }

  async function sendChat(question: string) {
    const text = question.trim();
    if (!text || busy.current) return;
    if (chatEngine === "webllm" && (modelStatus !== "ready" || !engine.current))
      return;
    const previous = history.current;
    const user: ChatMessage = { id: nextId.current++, role: "user", text };
    setDraft("");
    setChatError("");
    if (chatEngine === "guide") {
      const answer = getPortfolioAnswer(text, portfolio, previous);
      const id = nextId.current++;
      const run = ++generation.current;
      activeReply.current = id;
      busy.current = true;
      setGenerating(true);
      updateMessages((messages) => [
        ...messages,
        user,
        { id, role: "assistant", engine: "guide", text: "" },
      ]);
      guideTimer.current = setTimeout(() => {
        const words = answer.text.match(/\S+\s*/g) ?? [answer.text];
        const chunkSize = Math.max(2, Math.ceil(words.length / 30));
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        let visibleWords = 0;

        function revealReply() {
          guideTimer.current = null;
          if (run !== generation.current) return;

          visibleWords = reduceMotion
            ? words.length
            : Math.min(words.length, visibleWords + chunkSize);
          const complete = visibleWords === words.length;
          const reply = words.slice(0, visibleWords).join("");

          updateMessages((messages) =>
            messages.map((message) => {
              if (message.id !== id) return message;
              return complete
                ? { ...message, ...answer }
                : { ...message, text: reply };
            }),
          );

          if (complete) {
            busy.current = false;
            activeReply.current = null;
            setGenerating(false);
          } else {
            guideTimer.current = setTimeout(revealReply, 60);
          }
        }

        revealReply();
      }, 2000);
      return;
    }
    const model = engine.current!;
    const id = nextId.current++;
    const run = ++generation.current;
    activeReply.current = id;
    busy.current = true;
    setGenerating(true);
    updateMessages((messages) => [
      ...messages,
      user,
      { id, role: "assistant", engine: "webllm", text: "" },
    ]);
    try {
      const stream = await model.chat.completions.create({
        messages: buildWebLLMMessages(text, previous, portfolio),
        stream: true,
        temperature: 0.2,
        max_tokens: 320,
      });
      let reply = "";
      for await (const chunk of stream) {
        if (run !== generation.current) return;
        reply += chunk.choices[0]?.delta?.content ?? "";
        updateMessages((messages) =>
          messages.map((message) =>
            message.id === id ? { ...message, text: reply } : message,
          ),
        );
      }
      if (run === generation.current && !reply.trim())
        throw new Error("Empty reply");
    } catch {
      if (run !== generation.current) return;
      updateMessages((messages) =>
        messages.map((message) =>
          message.id === id
            ? {
                ...message,
                text:
                  message.text ||
                  "I couldn’t finish that reply. Please try again or switch to the portfolio guide.",
              }
            : message,
        ),
      );
      setChatError(
        "The AI reply was interrupted. Try a shorter question or switch to the portfolio guide.",
      );
    } finally {
      if (run === generation.current) {
        busy.current = false;
        activeReply.current = null;
        setGenerating(false);
      }
    }
  }
  return {
    messages,
    draft,
    onDraftChange: setDraft,
    onSend: sendChat,
    chatEngine,
    onEngineChange: changeChatEngine,
    modelStatus,
    progress,
    loadStage,
    chatError,
    generating,
    onLoadModel: loadModel,
    onCancelLoad: cancelModelLoad,
    onStopReply: stopReply,
  };
}
