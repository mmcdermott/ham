import { useEffect, useState, type ReactNode } from "react";

import { SourcePanel } from "./ShowSource";

export function DemoFrame({
  title,
  children,
  onReset,
  controls,
  source,
  height = 460,
}: {
  title: string;
  children: ReactNode;
  onReset?: () => void;
  /** Extra controls rendered in the caption (e.g. layout toggles). */
  controls?: ReactNode;
  /** When given, adds a "</> Source" toggle revealing this React snippet. */
  source?: string;
  height?: number | string;
}) {
  const [full, setFull] = useState(false);
  const [showSource, setShowSource] = useState(false);

  // Allow Escape to exit the expanded view.
  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full]);

  return (
    <>
      {full && <div className="demo-backdrop" onClick={() => setFull(false)} />}
      <figure className={"demo" + (full ? " demo-full" : "")}>
        <figcaption className="demo-caption">
          <span className="demo-title">{title}</span>
          <span className="demo-actions">
            {controls}
            {source && (
              <button
                type="button"
                className="demo-btn"
                aria-pressed={showSource}
                onClick={() => setShowSource((s) => !s)}
              >
                {showSource ? "Hide source" : "</> Source"}
              </button>
            )}
            {onReset && (
              <button type="button" className="demo-btn" onClick={onReset}>
                Reset
              </button>
            )}
            <button
              type="button"
              className="demo-btn"
              aria-pressed={full}
              onClick={() => setFull((f) => !f)}
            >
              {full ? "✕ Close" : "⛶ Expand"}
            </button>
          </span>
        </figcaption>
        <div className="demo-stage" style={full ? undefined : { height }}>
          {children}
        </div>
        {source && showSource && <SourcePanel source={source} />}
      </figure>
    </>
  );
}
