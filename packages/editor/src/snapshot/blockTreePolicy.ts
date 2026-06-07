import type { Node as PMNode } from "@tiptap/pm/model";

import type { HamBlockSnapshot, HamBranchPolicy, HamSurfaceSnapshot } from "../types";

/**
 * ProseMirror node types that are HAM blocks — addressable, collapsible, and
 * (subject to policy) branchable. List/task *items* are blocks; their wrapping
 * list containers are not. A `paragraph` is a block only at the top level; a
 * paragraph nested inside a listItem/taskItem/blockquote is that block's text,
 * not a separate block (see `getHamSurfaceSnapshot`).
 */
export const DEFAULT_HAM_BLOCK_TYPES: ReadonlySet<string> = new Set([
  "paragraph",
  "heading",
  "blockquote",
  "codeBlock",
  "listItem",
  "taskItem",
]);

/** List/task container types whose children are blocks but which are not themselves blocks. */
export const LIST_CONTAINER_TYPES: ReadonlySet<string> = new Set([
  "bulletList",
  "orderedList",
  "taskList",
]);

/** Block types treated as opaque leaves (their inner paragraphs are not separate blocks). */
export const LEAF_CONTAINER_TYPES: ReadonlySet<string> = new Set(["blockquote", "codeBlock"]);

/** Item block types whose direct paragraph child is the item's text, not a block. */
export const ITEM_TYPES: ReadonlySet<string> = new Set(["listItem", "taskItem"]);

/**
 * Whether a ProseMirror node should be treated as a HAM block, given its parent.
 * Mirrors `getHamSurfaceSnapshot`: a `paragraph` counts only at the top level; a
 * paragraph nested in an item/blockquote is that block's text, not a block.
 */
export function isHamBlockNode(node: PMNode, parent: PMNode | null): boolean {
  const type = node.type.name;
  if (!DEFAULT_HAM_BLOCK_TYPES.has(type)) return false;
  if (type === "paragraph") {
    return parent == null || parent.type.name === "doc";
  }
  return true;
}

/** Whether a block node is empty (no rendered text content). */
export function isEmptyBlockNode(node: PMNode): boolean {
  return node.type.name === "paragraph" ? node.content.size === 0 : node.textContent.trim() === "";
}

/** Resolve whether a block may be branched from, given a branch policy (spec §5.12). */
export function isBranchable(
  block: HamBlockSnapshot,
  snapshot: HamSurfaceSnapshot,
  policy: HamBranchPolicy = "any-nonempty-block",
): boolean {
  if (typeof policy === "function") return policy(block, snapshot);
  switch (policy) {
    case "root-only":
      return block.id === snapshot.rootBlockId;
    case "headings-only":
      return block.type === "heading" && !block.isEmpty;
    case "any-nonempty-block":
    default:
      // The root is structural, not a branch source; empties are not branchable.
      return block.id !== snapshot.rootBlockId && !block.isEmpty;
  }
}
