import test from "node:test";
import assert from "node:assert/strict";
import { waitForWebLLMWorker } from "../lib/webllm-runtime.ts";

test("model requests wait until the worker has installed its message handler", async () => {
  const worker = new EventTarget();
  const loading = waitForWebLLMWorker(worker, new AbortController().signal);
  worker.dispatchEvent(
    new MessageEvent("message", { data: { type: "portfolio-webllm-ready" } }),
  );
  await loading;
});

test("worker startup can be cancelled before or during initialization", async () => {
  const controller = new AbortController();
  const loading = waitForWebLLMWorker(new EventTarget(), controller.signal);
  controller.abort();
  await assert.rejects(loading, /cancelled/);
  await assert.rejects(
    waitForWebLLMWorker(new EventTarget(), controller.signal),
    /cancelled/,
  );
});

test("worker failures and unresponsive startups return recoverable errors", async () => {
  const worker = new EventTarget();
  const loading = waitForWebLLMWorker(worker, new AbortController().signal);
  worker.dispatchEvent(new Event("error"));
  await assert.rejects(loading, /failed to start/);
  await assert.rejects(
    waitForWebLLMWorker(new EventTarget(), new AbortController().signal, 5),
    /timed out/,
  );
});
