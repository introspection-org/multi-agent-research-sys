# Route Abuse Controls for Provider-Backed Research

## Summary

**Context:** The chat route streams the orchestrator, which can call Anthropic models and Valyu search tools for each request.

**Problem:** The route starts provider-backed work without an authentication, quota, or rate-limit boundary if the app is deployed openly.

**Impact:** Unauthenticated callers can consume paid model/search capacity and degrade availability for legitimate users.

**Recommendation:** Add a deployment-appropriate request boundary before `createAgentUIStreamResponse` starts the agent stream.

## Evidence

- [Chat route](https://github.com/introspection-org/multi-agent-research-sys/blob/main/src/app/api/chat/route.ts#L1-L10) reads request JSON and immediately calls the orchestrator stream.
- [Orchestrator agent](https://github.com/introspection-org/multi-agent-research-sys/blob/main/src/agents/orchestrator.ts#L65-L87) runs an Anthropic-backed tool loop that can delegate to Valyu-backed specialists.
- The README requires `ANTHROPIC_API_KEY` and `VALYU_API_KEY`, so each successful request can spend provider capacity.
- Linked issue: https://platform.introspection.dev/p/deep-research/issues/019dfcfb-a901-7725-b26d-18f963be21f5

## What I Found

The repository is a small demo-style app, so there may be no single correct production boundary. The code should still make the intended deployment posture explicit and prevent open deployments from turning the chat endpoint into an unlimited provider-spend surface.

## Options

| Option | What changes | Pros | Cons |
| ------ | ------------ | ---- | ---- |
| A | Add a simple shared-secret or authenticated-session check before streaming. | Clear access boundary; easy to reason about. | Requires product decision on users/auth. |
| B | Add per-IP or per-session rate limiting at the route or edge layer. | Reduces abuse without full auth. | IP/session limits can be bypassed and need storage or provider support. |
| C | Add deployment documentation only. | Lowest effort. | Does not protect an accidentally open deployment. |

## Recommended Plan

1. Decide whether the app is intended to be private, authenticated, or publicly demoable.
2. Add the smallest matching gate before the agent stream starts: auth for private use, or rate/quota limiting for public demos.
3. Return a clear non-streaming error response when the boundary rejects a request.
4. Document required environment/configuration for the selected boundary.

## Acceptance Criteria

- [ ] Issue is linked to this PR.
- [ ] The route has an explicit pre-agent boundary for open deployments.
- [ ] Rejected requests do not call the orchestrator or provider-backed tools.
- [ ] Engineer can choose and implement the recommended boundary without re-reading the review notes.
