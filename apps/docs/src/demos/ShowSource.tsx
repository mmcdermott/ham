import { useState, type ReactElement } from "react";

/** A "Copy" button that flashes confirmation; used by the source panel. */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="doc-source-copy"
      onClick={() => {
        const done = () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        };
        navigator.clipboard?.writeText(text).then(done, done);
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

/** The revealed source: the React/JSX that produced the example, plus a copy. */
export function SourcePanel({ source }: { source: string }) {
  return (
    <div className="doc-source">
      <CopyButton text={source} />
      <pre className="doc-code">
        <code>{source.trim()}</code>
      </pre>
    </div>
  );
}

/**
 * A toggle button + a piece of revealed state, so a host can place the button in
 * a caption and render the panel elsewhere. Returns `[shown, button]`.
 */
export function useShowSource(): [boolean, ReactElement] {
  const [shown, setShown] = useState(false);
  const button = (
    <button
      type="button"
      className="demo-btn"
      aria-pressed={shown}
      onClick={() => setShown((s) => !s)}
    >
      {shown ? "Hide source" : "</> Source"}
    </button>
  );
  return [shown, button];
}
