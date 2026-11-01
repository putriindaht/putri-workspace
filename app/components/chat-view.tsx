import { useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CornerDownLeft,
  Maximize2,
  MessageSquare,
  Square,
  PanelRightClose,
} from "lucide-react";
import { sections, type SectionId } from "../../lib/portfolio-data";
import { WEBLLM_MODEL_NAME } from "../../lib/webllm-prompt";
import type { usePortfolioChat } from "./use-portfolio-chat";

type ChatViewProps = ReturnType<typeof usePortfolioChat> & {
  onExplore: () => void;
  onNavigate: (section: SectionId) => void;
  sidebar?: boolean;
  onExpand?: () => void;
  onClose?: () => void;
};

export function ChatView({
  messages,
  draft,
  onDraftChange,
  onSend,
  onExplore,
  onNavigate,
  sidebar = false,
  onExpand,
  onClose,
  chatEngine,
  onEngineChange,
  modelStatus,
  progress,
  loadStage,
  chatError,
  generating,
  onLoadModel,
  onCancelLoad,
  onStopReply,
}: ChatViewProps) {
  const historyRef = useRef<HTMLDivElement>(null);
  const questionIndexRef = useRef<number | null>(null);
  const prefix = sidebar ? "sidebar-chat" : "full-chat";
  useEffect(() => {
    const history = historyRef.current;
    if (history) history.scrollTop = history.scrollHeight;
  }, [messages, sidebar]);
  const canSend =
    !generating && (chatEngine === "guide" || modelStatus === "ready");
  function submit() {
    if (canSend && draft.trim()) {
      questionIndexRef.current = null;
      onSend(draft);
    }
  }
  const suggestions = [
    "What is her current role?",
    "Tell me about her gRPC work",
    "Tell me about her projects",
  ];
  return (
    <section
      id={sidebar ? "sidebar-chat-view" : "dedicated-chat-view"}
      className={`chat-view ${sidebar ? "chat-view--sidebar" : "chat-view--full"}`}
      aria-label={
        sidebar ? "Portfolio sidebar chat" : "Dedicated portfolio chat"
      }
    >
      <header className="chat-view-header">
        <span>
          <MessageSquare
            size={16}
            aria-hidden="true"
          />
          Chat
        </span>
        <div className="chat-header-actions">
          {onExpand && (
            <button
              className="icon-button"
              onClick={onExpand}
              aria-label="Open dedicated chat"
              title="Open dedicated chat"
            >
              <Maximize2 size={16} />
            </button>
          )}
          {onClose && (
            <button
              className="icon-button"
              onClick={onClose}
              aria-label="Collapse chat sidebar"
              title="Collapse right sidebar"
            >
              <PanelRightClose size={16} />
            </button>
          )}
          {!sidebar && (
            <button
              className="text-button"
              onClick={onExplore}
            >
              <ArrowLeft size={15} />
              Portfolio
            </button>
          )}
        </div>
      </header>
      <div className="chat-engine-controls">
        <div
          className="chat-engine-switch"
          role="group"
          aria-label="Chat mode"
        >
          <button
            type="button"
            aria-pressed={chatEngine === "guide"}
            onClick={() => onEngineChange("guide")}
          >
            Portfolio guide
          </button>
          <button
            type="button"
            aria-pressed={chatEngine === "webllm"}
            onClick={() => onEngineChange("webllm")}
          >
            WebLLM AI
          </button>
        </div>
        {chatEngine === "webllm" && (
          <div className="chat-model-panel">
            {modelStatus === "idle" && (
              <>
                <p>
                  {WEBLLM_MODEL_NAME}. Runs on this device. First use downloads
                  several hundred MB and needs WebGPU.
                </p>
                <button
                  type="button"
                  className="chat-model-action"
                  onClick={onLoadModel}
                >
                  Load WebLLM
                </button>
              </>
            )}
            {modelStatus === "loading" && (
              <>
                <div className="chat-model-progress">
                  <span role="status">
                    {loadStage}… {Math.round(progress * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={onCancelLoad}
                  >
                    Cancel
                  </button>
                </div>
                <progress
                  value={progress}
                  max={1}
                  aria-label="WebLLM model loading"
                />
              </>
            )}
            {modelStatus === "ready" && (
              <p className="chat-model-ready">
                <span className="status-dot" />
                WebLLM ready · on this device
              </p>
            )}
            {chatError && (
              <p
                className="chat-error"
                role="alert"
              >
                {chatError}
              </p>
            )}
            {modelStatus === "error" && (
              <button
                type="button"
                className="chat-model-action"
                onClick={onLoadModel}
              >
                Retry loading
              </button>
            )}
            {(modelStatus === "error" || modelStatus === "unsupported") && (
              <button
                type="button"
                className="text-button"
                onClick={() => onEngineChange("guide")}
              >
                Use portfolio guide
              </button>
            )}
          </div>
        )}
      </div>
      {messages.length === 0 ? (
        <div className="chat-empty-state">
          {sidebar ? <h2>Hi, I’m Pia.</h2> : <h1>Hi, I’m Pia.</h1>}
          <p>
            I can help you explore Putri’s work, projects, and career journey.
          </p>
          <div
            className="chat-topics"
            aria-label="Suggested questions"
          >
            {suggestions.map((question) => (
              <button
                key={question}
                onClick={() => onSend(question)}
                disabled={!canSend}
              >
                {question}
                <ArrowUpRight size={14} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="chat-history"
          ref={historyRef}
          role="log"
          aria-label="Conversation"
          aria-live="polite"
          aria-relevant="additions text"
          aria-busy={generating}
        >
          {messages.map((message) => (
            <article
              key={message.id}
              className={`chat-message chat-message--${message.role}`}
              data-streaming={
                generating &&
                message.role === "assistant" &&
                message.id === messages[messages.length - 1]?.id
                  ? true
                  : undefined
              }
            >
              <span className="chat-message-author">
                {message.role === "user"
                  ? "You"
                  : `Pia · ${message.engine === "webllm" ? "WebLLM AI" : "Portfolio guide"}`}
              </span>
              {message.text ? (
                <p>{message.text}</p>
              ) : (
                <div
                  className="chat-typing"
                  role="status"
                  aria-label="Pia is preparing a reply"
                >
                  <span
                    className="chat-typing-dots"
                    aria-hidden="true"
                  >
                    <i />
                    <i />
                    <i />
                  </span>
                  <span aria-hidden="true">Preparing reply…</span>
                </div>
              )}
              {message.suggestions &&
                message.id === messages[messages.length - 1]?.id && (
                  <div
                    className="chat-topics chat-followups"
                    aria-label="Follow-up questions"
                  >
                    {message.suggestions.map((question) => (
                      <button
                        key={question}
                        onClick={() => onSend(question)}
                        disabled={!canSend}
                      >
                        {question}
                        <ArrowUpRight size={14} />
                      </button>
                    ))}
                  </div>
                )}
              {message.section && (
                <button
                  className="text-button chat-source"
                  onClick={() => onNavigate(message.section!)}
                >
                  View{" "}
                  {sections
                    .find((s) => s.id === message.section)
                    ?.label.toLowerCase()}
                  <ArrowUpRight size={13} />
                </button>
              )}
            </article>
          ))}
        </div>
      )}
      <form
        className="chat-composer"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="chat-composer-field">
          <label
            className="sr-only"
            htmlFor={`${prefix}-message`}
          >
            Ask about Putri
          </label>
          <textarea
            id={`${prefix}-message`}
            rows={2}
            value={draft}
            onChange={(event) => {
              questionIndexRef.current = null;
              onDraftChange(event.target.value);
            }}
            placeholder="Ask about Putri…"
            maxLength={2000}
            aria-describedby={`${prefix}-note`}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;

              const browsingQuestions = questionIndexRef.current !== null;
              if (
                (event.key === "ArrowUp" || event.key === "ArrowDown") &&
                !event.shiftKey &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey &&
                (draft === "" || browsingQuestions)
              ) {
                const questions = messages.filter(
                  (message) => message.role === "user",
                );
                if (questions.length === 0) return;
                if (event.key === "ArrowDown" && !browsingQuestions) return;

                event.preventDefault();
                const currentIndex =
                  questionIndexRef.current ?? questions.length;
                const nextIndex =
                  event.key === "ArrowUp"
                    ? Math.max(0, currentIndex - 1)
                    : currentIndex + 1;

                if (nextIndex >= questions.length) {
                  questionIndexRef.current = null;
                  onDraftChange("");
                } else {
                  questionIndexRef.current = nextIndex;
                  onDraftChange(questions[nextIndex].text);
                }
                return;
              }

              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                submit();
              }
            }}
          />
          {generating ? (
            <button
              type="button"
              aria-label="Stop reply"
              title="Stop reply"
              onClick={onStopReply}
            >
              <Square size={14} />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send message"
              aria-keyshortcuts="Enter"
              title="Send message (Enter). Shift+Enter adds a new line."
              disabled={!draft.trim() || !canSend}
            >
              <CornerDownLeft
                size={14}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
        <p id={`${prefix}-note`}>
          {chatEngine === "guide"
            ? "Answers from this portfolio. No AI download needed."
            : "AI answers may be inaccurate. Check the portfolio for details."}
        </p>
      </form>
    </section>
  );
}
