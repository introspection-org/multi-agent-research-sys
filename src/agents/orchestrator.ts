import { ToolLoopAgent, tool, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { financialAnalystAgent } from "./financial-analyst";
import { scientistAgent } from "./scientist";
import { journalistAgent } from "./journalist";
import { getIntrospectionTelemetry } from "@/lib/introspection";

const financialAnalystTool = tool({
  description:
    "Delegate to the Financial Analyst agent for SEC filings, stock data, earnings reports, economic indicators, and financial analysis.",
  inputSchema: z.object({
    task: z.string().describe("The financial research task to complete"),
  }),
  execute: async ({ task }, { abortSignal }) => {
    const result = await financialAnalystAgent.generate({
      prompt: task,
      abortSignal,
    });
    return result.text;
  },
});

const scientistTool = tool({
  description:
    "Delegate to the Scientist agent for clinical trials, drug information, FDA data, biomedical papers, and life sciences research.",
  inputSchema: z.object({
    task: z.string().describe("The medical/life sciences research task to complete"),
  }),
  execute: async ({ task }, { abortSignal }) => {
    const result = await scientistAgent.generate({
      prompt: task,
      abortSignal,
    });
    return result.text;
  },
});

const journalistTool = tool({
  description:
    "Delegate to the Journalist agent for real-time news, current events, breaking stories, and web-based research on any topic.",
  inputSchema: z.object({
    task: z.string().describe("The news/research task to complete"),
  }),
  execute: async ({ task }, { abortSignal }) => {
    const result = await journalistAgent.generate({
      prompt: task,
      abortSignal,
    });
    return result.text;
  },
});

export const orchestratorAgent = new ToolLoopAgent({
  model: anthropic("claude-haiku-4-5-20251001"),
  instructions: `You are a research orchestrator that routes queries to specialized agents.

You have three specialist agents available:
1. **Financial Analyst** — SEC filings, stock data, earnings, financial statements, economic data
2. **Scientist** — Clinical trials, drug discovery, FDA data, biomedical papers
3. **Journalist** — Real-time news, current events, web research

Your job:
- Analyze the user's query and delegate to the right specialist(s)
- For questions that span multiple domains, call multiple agents
- Synthesize results from multiple agents into a coherent response
- If a query doesn't fit any specialist, answer it yourself
- Always be clear about which sources informed your response`,
  tools: {
    financialAnalyst: financialAnalystTool,
    scientist: scientistTool,
    journalist: journalistTool,
  },
  stopWhen: stepCountIs(10),
  experimental_telemetry: getIntrospectionTelemetry("research-orchestrator"),
});
