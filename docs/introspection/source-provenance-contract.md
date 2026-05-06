# Source Provenance Contract for Specialist Handoffs

## Summary

**Context:** The Research Orchestrator delegates finance, science, and news work to specialist agents, then synthesizes their results for the user.

**Problem:** Each specialist currently returns only prose to the orchestrator, so source dates, citations, caveats, and evidence gaps are not preserved as a stable contract.

**Impact:** Cross-domain answers can lose which source supports which claim, especially when the final synthesis combines multiple specialist results.

**Recommendation:** Add a small structured handoff contract for specialist outputs before changing synthesis behavior.

## Evidence

- [Delegation tools](https://github.com/introspection-org/multi-agent-research-sys/blob/main/src/agents/orchestrator.ts#L20-L61) accept a free-text `task`, call a specialist agent, and return `result.text`.
- [Financial analyst prompt](https://github.com/introspection-org/multi-agent-research-sys/blob/main/src/agents/financial-analyst.ts#L9-L27), [scientist prompt](https://github.com/introspection-org/multi-agent-research-sys/blob/main/src/agents/scientist.ts#L9-L25), and [journalist prompt](https://github.com/introspection-org/multi-agent-research-sys/blob/main/src/agents/journalist.ts#L9-L24) ask for citations and dates, but those requirements are not represented in the tool return shape.
- Linked issue: https://platform.introspection.dev/p/deep-research/issues/019dfcfb-a6e7-7328-91ba-37d8ddf7a067

## What I Found

The system has clear specialist roles and domain tools, but the contract between a specialist and the orchestrator is a single string. The final answer therefore depends on the orchestrator preserving provenance from generated prose instead of receiving a source-aware result object.

## Options

| Option | What changes | Pros | Cons |
| ------ | ------------ | ---- | ---- |
| A | Keep prose, but strengthen prompts to include source sections. | Smallest code change. | Still relies on model formatting and does not make citations machine-checkable. |
| B | Add structured specialist outputs with answer, sources, caveats, conflicts, and gaps; stringify a compact summary for the orchestrator if needed. | Preserves provenance explicitly and gives synthesis a reliable source contract. | Requires touching all specialist wrappers and prompts. |
| C | Add a post-synthesis citation validator only. | Can catch some unsupported final answers. | Does not prevent source loss before synthesis and may add retries without better evidence. |

## Recommended Plan

1. Define a shared specialist result shape with fields such as `summary`, `claims`, `sources`, `caveats`, `conflicts`, and `missing_evidence`.
2. Update each specialist prompt or output mode to populate that shape and include publication dates or filing/trial identifiers where available.
3. Update the orchestrator tool wrappers to return the structured payload, or a compact serialized form that preserves source-to-claim mapping.
4. Update orchestrator instructions to synthesize only from preserved sources and to surface gaps instead of smoothing them over.

## Acceptance Criteria

- [ ] Issue is linked to this PR.
- [ ] Specialist-to-orchestrator handoff preserves source identifiers and dates separately from prose.
- [ ] Final synthesis instructions require source-backed claims and visible caveats/gaps.
- [ ] Engineer can start implementation without re-reading the review notes.
