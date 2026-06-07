import { Extension } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import { isHamBlockNode } from "../snapshot/blockTreePolicy";
import { surfaceSnapshotFromDoc } from "../snapshot/getHamSurfaceSnapshot";
import type {
  HamAnnotationHit,
  HamAnnotationRegistry,
  HamBlockSnapshot,
  HamSurfaceId,
} from "../types";
import { recognizeAnnotations } from "./recognize";

export interface AnnotationLayerContext<Ctx = unknown> {
  registry: HamAnnotationRegistry<Ctx>;
  context: Ctx;
  surfaceId: HamSurfaceId;
  rootBlockId: string;
}

export interface AnnotationLayerOptions {
  getContext: () => AnnotationLayerContext | null;
}

/** Plugin key — dispatch `tr.setMeta(annotationLayerKey, true)` to rebuild on ctx change. */
export const annotationLayerKey = new PluginKey<DecorationSet>("hamAnnotations");

interface BlockSpan {
  start: number; // absolute position where the block's text begins
  end: number; // absolute position of the block's end
}

function firstTextStart(node: PMNode, pos: number): number {
  let start = pos + 1;
  let done = false;
  node.descendants((child, rel) => {
    if (done) return false;
    if (child.isText) {
      start = pos + 1 + rel;
      done = true;
      return false;
    }
    return undefined;
  });
  return start;
}

function chipEl(hit: HamAnnotationHit): HTMLElement {
  const span = document.createElement("span");
  span.className = `ham-annotation-chip ham-annotation-chip-${hit.type}`;
  span.contentEditable = "false";
  span.setAttribute("data-annotation-id", hit.id);
  span.setAttribute("data-annotation-type", hit.type);
  span.textContent = hit.label ?? hit.type;
  return span;
}

function build(doc: PMNode, ctx: AnnotationLayerContext | null): DecorationSet {
  if (!ctx) return DecorationSet.empty;

  const snapshot = surfaceSnapshotFromDoc(doc, {
    surfaceId: ctx.surfaceId,
    rootBlockId: ctx.rootBlockId,
  });

  const textByBlockId: Record<string, string> = {};
  const spanByBlockId = new Map<string, BlockSpan>();
  doc.descendants((node, pos, parent) => {
    if (!isHamBlockNode(node, parent)) return;
    const id = (node.attrs?.dataBlockId as string | null) ?? null;
    if (!id) return;
    textByBlockId[id] = node.textContent;
    spanByBlockId.set(id, { start: firstTextStart(node, pos), end: pos + node.nodeSize });
  });

  const blocks: HamBlockSnapshot[] = snapshot.blockOrder
    .map((id) => snapshot.blocks[id]!)
    .filter((b) => b.id !== snapshot.rootBlockId);

  const hits = recognizeAnnotations({
    registry: ctx.registry,
    surfaceId: ctx.surfaceId,
    blocks,
    textByBlockId,
    context: ctx.context,
  });

  const placementOf = new Map(ctx.registry.types.map((t) => [t.name, t]));
  const decos: Decoration[] = [];

  for (const hit of hits) {
    const type = placementOf.get(hit.type);
    const placement = type?.placement ?? "inline";
    const span = spanByBlockId.get(hit.blockId);
    if (!span) continue;

    if (
      (placement === "inline" || placement === "decoration" || placement === "popover") &&
      hit.from != null &&
      hit.to != null
    ) {
      const classes = ["ham-annotation", `ham-annotation-${hit.type}`];
      const extra = type?.inlineClass?.(hit, ctx.context);
      if (extra) classes.push(extra);
      const from = span.start + hit.from;
      const to = span.start + hit.to;
      if (from < to) {
        decos.push(
          Decoration.inline(from, to, {
            class: classes.join(" "),
            "data-annotation-type": hit.type,
            "data-annotation-id": hit.id,
          }),
        );
      }
    } else if (placement === "block-chip" || placement === "gutter") {
      decos.push(
        Decoration.widget(Math.max(span.start, span.end - 1), () => chipEl(hit), {
          side: 1,
          key: `anno-${hit.id}`,
          ignoreSelection: true,
        }),
      );
    }
  }

  return DecorationSet.create(doc, decos);
}

/**
 * Recognizes structured annotations (tasks, citations, URLs, mentions, …) over
 * the live document and renders them as ProseMirror decorations: inline
 * highlights for in-text matches and chips for block-level annotations. Pure
 * recognition is delegated to {@link recognizeAnnotations}; this plugin only
 * derives block text/positions and builds decorations.
 */
export const AnnotationLayer = Extension.create<AnnotationLayerOptions>({
  name: "hamAnnotationLayer",

  addOptions() {
    return { getContext: () => null };
  },

  addProseMirrorPlugins() {
    const getContext = this.options.getContext;
    return [
      new Plugin<DecorationSet>({
        key: annotationLayerKey,
        state: {
          init: (_config, state) => build(state.doc, getContext()),
          apply(tr, value, _oldState, newState) {
            if (tr.docChanged || tr.getMeta(annotationLayerKey)) {
              return build(newState.doc, getContext());
            }
            return value;
          },
        },
        props: {
          decorations(state) {
            return annotationLayerKey.getState(state) ?? DecorationSet.empty;
          },
        },
      }),
    ];
  },
});
