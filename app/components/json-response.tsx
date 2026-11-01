import type { ReactNode } from "react";

type JsonResponseProps = { value: unknown };

// Highlight the serialized JSON as React text nodes, never as injected HTML.
export function JsonResponse({ value }: JsonResponseProps) {
  const lines = JSON.stringify(value, null, 2).split("\n");

  return (
    <div
      className="json-editor"
      role="region"
      aria-label="Portfolio JSON response"
      tabIndex={0}
    >
      <pre>
        <code>
          {lines.map((line, index) => {
            const tokens: ReactNode[] = [];
            const pattern =
              /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
            let cursor = 0;
            for (const match of line.matchAll(pattern)) {
              const start = match.index!;
              if (start > cursor) tokens.push(line.slice(cursor, start));
              const kind = match[2]
                ? "key"
                : match[1]
                  ? "string"
                  : match[3]
                    ? "literal"
                    : "number";
              // Keep the colon neutral so properties are easier to distinguish from values.
              tokens.push(
                <span
                  className={`json-${kind}`}
                  key={start}
                >
                  {match[2] ? match[1] : match[0]}
                </span>,
              );
              if (match[2]) tokens.push(match[2]);
              cursor = start + match[0].length;
            }
            if (cursor < line.length) tokens.push(line.slice(cursor));
            return (
              <span
                className="json-line"
                key={index}
              >
                <span
                  className="json-line-number"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span className="json-line-content">
                  {tokens}
                  {index < lines.length - 1 ? "\n" : ""}
                </span>
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
