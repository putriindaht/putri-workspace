export function waitForWebLLMWorker(
  worker: Pick<Worker, "addEventListener" | "removeEventListener">,
  signal: AbortSignal,
  timeout = 20000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout>;
    function finish(error?: Error) {
      clearTimeout(timer);
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
      signal.removeEventListener("abort", onAbort);
      if (error) reject(error);
      else resolve();
    }
    function onMessage(event: MessageEvent) {
      if (event.data?.type === "portfolio-webllm-ready") finish();
    }
    function onError() {
      finish(new Error("WebLLM worker failed to start"));
    }
    function onAbort() {
      finish(new Error("WebLLM worker startup cancelled"));
    }
    if (signal.aborted) {
      reject(new Error("WebLLM worker startup cancelled"));
      return;
    }
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    signal.addEventListener("abort", onAbort, { once: true });
    timer = setTimeout(
      () => finish(new Error("WebLLM worker startup timed out")),
      timeout,
    );
  });
}
