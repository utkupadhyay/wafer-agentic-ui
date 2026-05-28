# wafer-agentic-ui

Agentic UI library architecture proposal for building rich, reliable interfaces for AI agents.

## TL;DR

This project should be a **frontend library for agent experiences**, not another agent framework.

In simple words:

- The **LLM** is the brain that generates text.
- The **agent** is the workflow that decides what to do next.
- The **tools** are actions like search, fetch data, run code, or ask for approval.
- The **agentic UI** is the screen that helps a human watch, guide, interrupt, approve, and understand all of that.

The best architecture for this project is a **layered library**:

1. A shared event protocol.
2. A framework-agnostic core runtime.
3. React hooks for app developers.
4. Accessible UI components.
5. A docs/playground app where we test the whole thing.

That gives us a library that is:

- easy to understand,
- easy to extend,
- not tied to one backend,
- and friendly to both beginners and advanced teams.

## Confirmed V1 Direction (May 27, 2026)

These decisions are now locked for v1:

- React-only in v1 (we can add adapters for other UI frameworks later).
- Full prebuilt UI kit with polished defaults.
- Local-first backend with Ollama so development has near-zero model cost.

## Local Dev Baseline (Ollama)

Recommended local setup:

1. Install Ollama and make sure it is running on `http://localhost:11434`.
2. Pull a local model (example): `ollama pull gpt-oss:20b`
3. Start the monorepo: `pnpm install`
4. Run playground app: `pnpm dev:playground`

Environment variables for the playground are in:

- `apps/playground/.env.example`

## Pre-Push Secret Scan (Recommended)

Before pushing to GitHub, enable the local git hook once:

1. `pnpm hooks:install`

You can run the scan manually any time:

1. `pnpm scan:secrets`

Notes:

- If `gitleaks` is installed, it runs first.
- If `gitleaks` is not installed, a fallback heuristic scanner still runs.
- Install `gitleaks` for stronger scanning: <https://github.com/gitleaks/gitleaks>

## Publishing Only Library Packages

This monorepo separates product pages/apps from publishable libraries:

- `apps/*` (like `apps/playground`) are demos and stay out of npm.
- `packages/*` are the publishable Wafer libraries.

Release commands:

1. `pnpm release:check`  
   Builds + typechecks, then runs `pack` for every package in `packages/*` and stores tarballs in `.release/tarballs`.
2. `pnpm release:publish`  
   Publishes only `packages/*` to npm.

The root workspace and playground are `private`, so they are never published.

---

## What Problem This Library Solves

Most chat UIs only handle one thing well: `user sends message -> AI returns text`.

Agentic products are more complex. The UI must also show:

- intermediate steps,
- tool calls,
- loading states,
- approval requests,
- streaming updates,
- retries,
- errors,
- human takeover,
- structured outputs,
- memory and session state.

If we mix all of that logic directly inside app components, the code becomes messy very fast.

So this library should give developers a clean system for building interfaces like:

- AI copilots,
- autonomous task assistants,
- internal ops agents,
- coding agents,
- research agents,
- customer support agents,
- workflow approval tools.

---

## Beginner Glossary

If you are new, these terms matter a lot:

### Model

A model is the text-generating engine, like OpenAI GPT models. It can answer, summarize, classify, and reason.

### Agent

An agent is a system that uses a model plus rules plus tools to complete tasks over multiple steps.

Example:

1. User says "find my last invoice and summarize it".
2. The agent decides to search invoices.
3. Then it opens the matching file.
4. Then it summarizes the result.

That multi-step behavior is what makes it "agentic".

### Tool

A tool is any capability the agent can call:

- search API,
- database query,
- browser automation,
- file reader,
- code runner,
- payment action,
- email sender.

### Run

A run is one execution cycle of the agent. A single run may include many steps and tool calls.

### Thread

A thread is the conversation history and related state for one user session.

### Event

An event is a small fact that happened in the system.

Examples:

- `message.created`
- `run.started`
- `tool.called`
- `tool.completed`
- `approval.requested`
- `run.failed`

The UI should react to events, not guess what happened.

---

## Product Vision

We are not trying to build:

- a new LLM provider,
- a full backend agent framework,
- or a one-off chat widget.

We are trying to build a **reusable UI system for agent-driven applications**.

The library should let a product team plug in any serious agent backend and get:

- a stable event model,
- consistent React hooks,
- high-quality agent components,
- clear human-in-the-loop controls,
- and strong debugging visibility.

---

## Core Design Principles

### 1. Backend-agnostic

The UI library should work with:

- OpenAI Responses/Agents style backends,
- custom Node/Python agent servers,
- LangGraph-like workflows,
- tool pipelines exposed over SSE or WebSocket,
- or even mocked local data for demos.

This means the UI should depend on a **normalized event protocol**, not on one vendor's raw response shape.

### 2. Event-first

Agent interfaces are much easier to reason about when everything important becomes an event.

Instead of directly mutating UI state everywhere, we collect events and derive UI state from them.

Why this is good:

- easier debugging,
- easier replay,
- easier testing,
- easier persistence,
- easier support for streaming.

### 3. Headless core, optional styled UI

Some teams want only hooks and state management.
Some want complete ready-made components.

So the library should provide both:

- a **headless layer** for developers who want full control,
- a **prebuilt UI layer** for speed.

### 4. Human-in-the-loop by default

Real agents sometimes need permission before acting.

Examples:

- "Should I send this email?"
- "Approve deleting 12 files?"
- "Confirm this refund?"

The UI must treat approvals as a first-class concept, not a hack added later.

### 5. Accessibility matters

Agent UIs are often busy and dynamic. That makes accessibility even more important.

We should design for:

- keyboard navigation,
- screen reader support,
- visible focus states,
- live regions for streaming updates,
- reduced motion preferences.

### 6. Clear separation of concerns

Each layer should have one main job:

- protocol defines the language,
- core manages state and transport,
- React layer exposes hooks,
- UI layer renders the experience,
- docs/playground proves the design works.

---

## Proposed Architecture

Here is the architecture I would use.

### Layer 1: Protocol Package

**Package idea:** `@wafer/protocol`

This package defines the shared language spoken by backend and frontend.

It should contain:

- TypeScript types,
- Zod schemas,
- event names,
- payload formats,
- validation helpers,
- versioning rules.

Why this layer exists:

- frontend and backend need a contract,
- streaming payloads must be validated,
- future adapters should map into one consistent shape.

Example event categories:

- conversation events
- run lifecycle events
- tool lifecycle events
- approval events
- artifact events
- error events
- telemetry events

Example event shape:

```ts
type AgentEvent =
  | {
      type: "message.created";
      messageId: string;
      role: "user" | "assistant" | "system";
      content: Array<{ type: "text"; text: string }>;
      createdAt: string;
    }
  | {
      type: "tool.called";
      runId: string;
      toolCallId: string;
      toolName: string;
      input: unknown;
      createdAt: string;
    }
  | {
      type: "approval.requested";
      runId: string;
      approvalId: string;
      actionLabel: string;
      reason?: string;
      createdAt: string;
    };
```

Important rule: the protocol package should describe facts, not React behavior.

### Layer 2: Core Runtime

**Package idea:** `@wafer/core`

This is the heart of the library.

It should be framework-agnostic and handle:

- event ingestion,
- session state,
- run state,
- optimistic updates,
- streaming transport,
- retries,
- reconnection,
- event-to-state projection.

Think of this layer as the engine room.

It should expose concepts like:

- `AgentClient`
- `SessionStore`
- `EventReducer`
- `TransportAdapter`
- `RunController`

Its job is to take a stream of events and produce useful state like:

- current thread,
- visible messages,
- active tool calls,
- approvals waiting for user action,
- artifacts created during a run,
- loading or error status.

This layer should not know about buttons, modals, or React rendering.

### Layer 3: React Adapter

**Package idea:** `@wafer/react`

This layer turns the core runtime into developer-friendly React APIs.

It should contain:

- `AgentProvider`
- `useAgent()`
- `useThread()`
- `useComposer()`
- `useRunState()`
- `useApprovals()`
- `useArtifacts()`
- `useToolCalls()`

Why this layer matters:

- React apps need simple hooks,
- hooks hide transport/store complexity,
- component authors can focus on UX instead of protocol plumbing.

This package should use React patterns like:

- context providers,
- `useSyncExternalStore` for stable subscriptions,
- memoized selectors,
- suspense only where it truly helps.

### Layer 4: UI Components

**Package idea:** `@wafer/ui`

This is the visible layer developers drop into products.

It should include accessible, composable components like:

- `AgentThread`
- `MessageList`
- `MessageBubble`
- `Composer`
- `RunTimeline`
- `ToolCallCard`
- `ApprovalCard`
- `ArtifactCard`
- `InterruptButton`
- `StatusBadge`
- `TokenStreamText`
- `EmptyState`
- `ErrorState`

These should be built as primitives plus compositions.

For example:

- primitive: `ToolCallCard`
- composition: `AgentInspectorPanel`

This keeps the system flexible.

### Layer 5: Backend Adapters

**Package idea:** `@wafer/adapters`

This package maps backend-specific responses into the shared protocol.

Adapters may include:

- `openaiResponsesAdapter`
- `customSseAdapter`
- `websocketAgentAdapter`
- `mockDemoAdapter`

This layer matters because every backend speaks a slightly different language.

Instead of forcing UI users to clean raw backend payloads by hand, we give them adapters that normalize everything into `AgentEvent`.

### Layer 6: Docs + Playground

**App ideas:**

- `apps/docs`
- `apps/playground`

The docs app teaches the library.
The playground app stress-tests the library.

The playground should simulate:

- message streaming,
- tool execution,
- approvals,
- errors,
- reconnects,
- long-running tasks,
- artifact rendering.

This is important because agent UIs often look fine in static screenshots and then break under real event streams.

### Layer 7: Devtools and Debugging

**Package idea:** `@wafer/devtools`

This is not the first package to build, but it will become very valuable.

Possible features:

- event log viewer,
- state snapshot inspector,
- run timeline replay,
- protocol validation warnings,
- performance diagnostics.

This becomes extremely useful once real teams start integrating the library.

---

## How Data Should Flow Through the System

This is the single most important mental model.

### Example flow

1. User types a message in the composer.
2. React layer sends a command to the core runtime.
3. Core runtime creates an optimistic local message.
4. Transport sends the request to the backend.
5. Backend begins streaming events.
6. Adapter normalizes backend payloads into `AgentEvent`.
7. Core runtime reduces events into session state.
8. React hooks subscribe to that state.
9. UI components re-render the relevant parts only.
10. If approval is needed, the UI pauses and asks the human.
11. Human approves or rejects.
12. Runtime sends the decision back to the backend.
13. More events stream in.
14. Final assistant output is shown.

### Why this flow is healthy

It gives us:

- predictable state transitions,
- clean testability,
- support for streaming,
- support for partial failures,
- support for multiple UI surfaces.

---

## Suggested Monorepo Structure

I would strongly recommend starting as a monorepo even if the codebase is small on day one.

```text
wafer-agentic-ui/
  apps/
    docs/
    playground/
  packages/
    protocol/
      src/
        events.ts
        schemas.ts
        versions.ts
    core/
      src/
        client/
        runtime/
        store/
        transport/
        reducers/
    react/
      src/
        provider/
        hooks/
        selectors/
    ui/
      src/
        components/
        primitives/
        theme/
    adapters/
      src/
        openai/
        sse/
        websocket/
        mock/
    devtools/
      src/
  examples/
    nextjs-basic/
    approval-flow/
    tool-streaming/
  tests/
    e2e/
  README.md
```

Why monorepo:

- shared types stay consistent,
- examples can consume local packages,
- releases are easier to organize,
- architecture stays visible.

---

## Tech Stack I Would Use

This is the stack I would choose today for a serious, maintainable version of this project.

### 1. TypeScript

**Why:** This library is mostly contracts, state, and component APIs. TypeScript is essential.

We need type safety for:

- event payloads,
- component props,
- adapter outputs,
- public APIs,
- backend integration contracts.

### 2. React

**Why:** React is the most practical target for a first version of an agentic UI library.

Benefits:

- huge ecosystem,
- strong adoption,
- easy docs/examples,
- good fit for streaming UI,
- many teams already use it.

I would build the first version for React and keep the core framework-agnostic so Vue/Svelte adapters are possible later.

### 3. Zod

**Why:** Agent event payloads arrive from networks and can be malformed.

Zod helps us:

- validate incoming events,
- protect the UI from broken payloads,
- keep protocol contracts explicit,
- generate better developer errors.

### 4. pnpm Workspaces

**Why:** Fast, clean, and very good for monorepos with shared packages.

### 5. Turborepo

**Why:** Excellent for managing build/test/dev pipelines across apps and packages.

This becomes useful once we have:

- docs app,
- playground app,
- shared packages,
- examples,
- tests.

### 6. tsup

**Why:** Simple and reliable library bundling for TypeScript packages.

Good for:

- ESM and CJS outputs,
- declaration files,
- fast builds,
- multiple packages.

### 7. Next.js for Docs and Playground

**Why:** Great developer experience, great docs experience, and easy interactive demos.

Important note: I would use Next.js for the docs/playground apps, not force it into the library runtime itself.

### 8. Radix UI Primitives

**Why:** Accessibility is hard and Radix gives us a strong base for interactive UI parts like:

- dialogs,
- popovers,
- tabs,
- scroll areas,
- tooltips.

That lets us spend time on agent UX instead of rebuilding accessibility primitives from scratch.

### 9. Tailwind CSS for Docs/Examples, CSS Variables for the Library

This choice needs explanation.

For the library itself, I would avoid making consumers depend on Tailwind just to use core components.

So:

- use **CSS variables and minimal packaged styles** inside the library,
- use **Tailwind CSS** in docs, examples, and maybe an optional themed package.

This keeps the library portable.

### 10. Vitest + React Testing Library

**Why:** Fast unit and component tests.

We need to test:

- reducers,
- event projections,
- hooks,
- component behavior,
- approval flows.

### 11. Playwright

**Why:** Agent UIs are interaction-heavy and timing-sensitive.

End-to-end tests should cover:

- streaming output,
- tool call cards appearing live,
- approval pause/resume,
- reconnect handling,
- keyboard navigation.

### 12. Changesets

**Why:** If this becomes a real library, release management matters early.

Changesets helps with:

- versioning,
- changelogs,
- package publishing discipline.

---

## Why I Would Not Start With These

These are useful sometimes, but I would not make them the foundation right away.

### XState

Powerful, but may add learning overhead too early unless the workflow complexity becomes very state-machine-heavy.

### WebSocket-only transport

I would start with **SSE first** for streamed server-to-client events because it is easier to understand and simpler to operate for many teams.

Then add WebSocket when we need:

- bidirectional low-latency updates,
- collaborative sessions,
- or frequent live control signals.

### Tailwind-dependent component library

This can reduce portability. A reusable library should not force one styling system unless that is a deliberate product decision.

---

## Recommended Public API Shape

The public API should feel simple from the app developer's point of view.

Example:

```tsx
import {
  AgentThread,
  Composer,
} from "@wafer/ui";
import { AgentProvider, createAgentClient } from "@wafer/react";
import { openaiResponsesAdapter } from "@wafer/adapters/openai";

const client = createAgentClient({
  transport: {
    type: "sse",
    endpoint: "/api/agent",
  },
  adapter: openaiResponsesAdapter(),
});

export function SupportAgentPage() {
  return (
    <AgentProvider client={client}>
      <AgentThread />
      <Composer />
    </AgentProvider>
  );
}
```

This is the right kind of simple:

- easy to explain,
- powerful underneath,
- flexible when needed.

---

## Important Domain Objects

These objects should be designed carefully because many other APIs will depend on them.

### Session

Represents one user's ongoing interaction context.

### Thread

Represents the ordered conversation and execution history.

### Message

Represents visible conversational content.

### Run

Represents one agent execution pass tied to a user action or system action.

### Tool Call

Represents a tool invocation, its status, inputs, outputs, and any errors.

### Approval Request

Represents a moment where the agent must wait for the human.

### Artifact

Represents something created during a run:

- document,
- table,
- chart,
- code block,
- file,
- image,
- report.

---

## State Management Strategy

I would use an **internal event store plus selectors**, not a big pile of local React state.

Why:

- agent UIs receive streamed updates,
- multiple components need the same shared truth,
- event logs are valuable for debugging,
- we need deterministic replay behavior.

A good strategy is:

1. Receive event.
2. Validate it.
3. Store it.
4. Reduce it into derived state.
5. Expose memoized selectors to React.

This is much more reliable than updating many separate component states by hand.

---

## Error Handling Strategy

Agent systems fail in many ways, so the UI architecture should plan for failure from day one.

We should expect:

- network disconnects,
- malformed events,
- tool timeouts,
- duplicate events,
- partial run completion,
- approval expiration,
- backend restarts.

The UI should make failure states understandable.

That means showing:

- what failed,
- where it failed,
- whether retry is possible,
- whether user action is needed.

---

## Streaming Strategy

Streaming is a core feature, not a bonus.

The UI should support:

- partial assistant text,
- live tool status updates,
- run progress,
- partial structured results,
- cancellation.

My recommendation:

- **SSE first** for server-to-client event streams,
- optional POST calls for user actions,
- later WebSocket support for advanced live control cases.

This keeps the first version easier to build and easier to teach.

---

## Human-in-the-Loop Strategy

This is one of the most important parts of agent UX.

Approval flows should be modeled as a first-class state, not a popup bolted on top.

An approval object should include:

- what action is being requested,
- why it is needed,
- risk level,
- what data will be affected,
- allowed responses,
- timeout behavior.

The UI should support:

- approve,
- reject,
- request changes,
- inspect details before deciding.

---

## Accessibility Strategy

Agent UIs are often noisy, fast, and dynamic. That is exactly where accessibility work matters most.

We should plan for:

- screen-reader readable tool statuses,
- keyboard-only interaction for approvals,
- live regions for streamed updates,
- color contrast in status badges,
- motion reduction for token streaming and transitions.

---

## Testing Strategy

### Unit tests

For:

- event reducers,
- protocol validation,
- adapter normalization,
- selector correctness.

### Component tests

For:

- thread rendering,
- composer behavior,
- approval cards,
- tool call state transitions.

### End-to-end tests

For:

- full chat flow,
- streamed answer rendering,
- approval pause/resume,
- retry and reconnect handling.

### Contract tests

For:

- backend adapter input/output expectations,
- protocol version compatibility.

---

## MVP Roadmap

If we wanted to build this in a sensible order, I would do it like this:

### Phase 1: Foundation

- set up monorepo,
- create `protocol`,
- create `core`,
- define core event types,
- support mocked event streams.

### Phase 2: React integration

- create provider,
- create hooks,
- render basic thread and composer,
- add simple streaming text.

### Phase 3: Agent-native features

- tool call cards,
- run timeline,
- approval requests,
- retry/cancel actions,
- artifact rendering.

### Phase 4: Hardening

- adapter layer,
- reconnection support,
- tests,
- docs,
- playground scenarios.

### Phase 5: Polish

- theming,
- devtools,
- analytics hooks,
- release automation.

---

## My Recommendation in One Sentence

Build `wafer-agentic-ui` as a **TypeScript monorepo with a backend-agnostic event protocol, a framework-agnostic core runtime, React bindings, accessible UI components, and a Next.js docs/playground app**.

That gives us the cleanest foundation for a serious agentic UI library.

---

## Questions I Need From You

I can keep moving without blocking, but these answers will help shape the next steps:

1. Do you want this library to be:
   - `React-only` for v1, or
   - `framework-agnostic core + React adapter` from day one?
2. Do you want the library to be:
   - mostly `headless primitives`, or
   - a `full prebuilt UI kit` with polished components?
3. Which backend do you want to support first:
   - OpenAI Responses/Agents style APIs,
   - your own custom backend,
   - or multiple backends?
4. Do you want styling to be:
   - design-system neutral,
   - or opinionated and beautiful out of the box?
5. Should I next scaffold the actual monorepo/package structure based on this README?
