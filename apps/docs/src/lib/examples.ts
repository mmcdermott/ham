import type { DemoCanvasState } from "./demoHost";
import type { HamExampleAnnotationContext } from "@ham/editor";

export const annotationContext: HamExampleAnnotationContext = {
  references: {
    vaswani2017: { title: "Attention Is All You Need", year: 2017 },
    eq2024: { title: "EQ-based forecasting on eICU", year: 2024 },
  },
  people: {
    alice: { name: "Alice Researcher" },
    bob: { name: "Bob Engineer" },
  },
};

export const annotatedMarkdown = `# Related work

The transformer was introduced by @vaswani2017 and remains the backbone of
modern forecasting. See https://arxiv.org/abs/1706.03762 for the original paper.
Ask @alice to double-check the eICU cohort.

## Tasks

- [ ] summarize @vaswani2017
- [x] import the .bib file
- [ ] reproduce the EQ baseline ($AUROC > 0.85$)
`;

/** A project overview with two branchable sections — the canvas starting point. */
export const overviewCanvas: DemoCanvasState = {
  surfaces: {
    s_root: {
      id: "s_root",
      rootBlockId: "blk_root",
      title: "Project overview",
      content: {
        kind: "markdown",
        markdown:
          "# EQ-based forecasting\n\nWe show that EQ-based forecasting beats the baseline on eICU.\n\n## Background\n\nClinical forecasting is hard; calibration matters.\n\n## Experiment plan\n\n- [ ] pull the eICU cohort\n- [ ] train the EQ model\n- [ ] evaluate calibration\n\nHover a block and click ↳ to branch it into its own surface.",
      },
    },
  },
  branchEdges: [],
};

/** A multi-surface canvas: two sections already branched, one with a sibling. */
export const branchedCanvas: DemoCanvasState = {
  surfaces: {
    s_root: {
      id: "s_root",
      rootBlockId: "blk_root",
      title: "Root",
      content: {
        kind: "markdown",
        markdown: "# Method\n\n## Data\n\nThe eICU cohort.\n\n## Model\n\nAn EQ-based forecaster.",
      },
    },
    s_data: {
      id: "s_data",
      rootBlockId: "blk_data",
      title: "Data",
      content: { kind: "markdown", markdown: "# Data\n\nCohort selection and preprocessing." },
    },
    s_model: {
      id: "s_model",
      rootBlockId: "blk_model",
      title: "Model",
      content: { kind: "markdown", markdown: "# Model\n\nArchitecture and training." },
    },
    s_model_alt: {
      id: "s_model_alt",
      rootBlockId: "blk_model_alt",
      title: "Model (alternative)",
      content: { kind: "markdown", markdown: "# Alternative model\n\nA simpler baseline." },
    },
  },
  branchEdges: [
    {
      id: "e_data",
      fromSurfaceId: "s_root",
      fromBlockId: "blk_data_h",
      toSurfaceId: "s_data",
      order: 0,
    },
    {
      id: "e_model",
      fromSurfaceId: "s_root",
      fromBlockId: "blk_model_h",
      toSurfaceId: "s_model",
      order: 0,
    },
    {
      id: "e_model_alt",
      fromSurfaceId: "s_root",
      fromBlockId: "blk_model_h",
      toSurfaceId: "s_model_alt",
      order: 1,
    },
  ],
};

/** A single-paragraph paper, to grow by progressive decomposition. */
export const paperCanvas: DemoCanvasState = {
  surfaces: {
    s_paper: {
      id: "s_paper",
      rootBlockId: "blk_paper",
      title: "Paper (thesis)",
      content: {
        kind: "markdown",
        markdown:
          "# Thesis\n\nWe show that EQ-based forecasting beats the baseline on eICU.\n\nBranch this paragraph into Intro / Method / Results, then branch each of those again. The canvas lays the argument out as *levels left → right, sections top → down*.",
      },
    },
  },
  branchEdges: [],
};
