import type { ReactNode } from "react";

import { SourcePanel, useShowSource } from "./ShowSource";

/**
 * A captioned live example: a working render on top, a "</> Source" toggle in
 * the caption that reveals the React/JSX that produced it, and room for extra
 * controls (e.g. an "edit as markdown" toggle). The shown source is authored
 * alongside the example so it stays copy-pasteable.
 */
export function LiveExample({
  title,
  source,
  children,
  controls,
}: {
  title: string;
  source: string;
  children: ReactNode;
  /** Extra caption controls, rendered before the source toggle. */
  controls?: ReactNode;
}) {
  const [shown, sourceButton] = useShowSource();
  return (
    <div className="doc-live">
      <div className="doc-live-head">
        <span>{title}</span>
        <span className="doc-live-actions">
          {controls}
          {sourceButton}
        </span>
      </div>
      <div className="doc-live-body">{children}</div>
      {shown && <SourcePanel source={source} />}
    </div>
  );
}
