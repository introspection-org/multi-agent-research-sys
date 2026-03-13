# Multi-Agent Research System

A multi-agent research system built with **Vercel AI SDK v6** and **Valyu AI SDK**. An orchestrator agent routes queries to three specialist agents based on the domain.

## Agents

| Agent | Domain | Valyu Tools |
|-------|--------|-------------|
| **Financial Analyst** | SEC filings, stock data, earnings, economic indicators | `secSearch`, `financeSearch`, `economicsSearch` |
| **Medical Researcher** | Clinical trials, drug discovery, FDA data, biomedical papers | `bioSearch`, `paperSearch` |
| **Journalist** | Real-time news, current events, web research | `webSearch` |

The **Orchestrator** analyzes each query and delegates to the right specialist(s). For cross-domain questions, it calls multiple agents and synthesizes the results.

## Setup

```bash
pnpm install
```

Create `.env.local` with your API keys:

```
ANTHROPIC_API_KEY=your_anthropic_api_key
VALYU_API_KEY=your_valyu_api_key
```

Get your keys:
- Anthropic: https://console.anthropic.com
- Valyu: https://platform.valyu.ai

## Run

```bash
pnpm dev
```

Open http://localhost:3000

## Architecture

```
User → Chat UI → /api/chat → Orchestrator Agent
                                ├── Financial Analyst Agent (SEC, finance, economics)
                                ├── Medical Researcher Agent (bio, papers)
                                └── Journalist Agent (web search)
```

Each specialist agent is wrapped as a tool that the orchestrator can call. The orchestrator decides which agent(s) to invoke based on the query content.

## Tech Stack

- Next.js 16 (App Router)
- Vercel AI SDK v6 (`ToolLoopAgent`, `createAgentUIStreamResponse`)
- Valyu AI SDK (`@valyu/ai-sdk`)
- Anthropic Claude (claude-sonnet-4-6)
- Tailwind CSS v4
