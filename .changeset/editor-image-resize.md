---
"@ham/editor": minor
---

Enable image resize handles. A selected image can be drag-resized; width/height
persist as schema attrs (kept in JSON / collaboration; markdown export stays
size-agnostic). The node view keeps a real `<img>`, so click-to-edit alt and
the block gutter still resolve the image.
