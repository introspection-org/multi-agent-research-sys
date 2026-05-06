import { ToolLoopAgent } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { secSearch, financeSearch, economicsSearch } from "@valyu/ai-sdk";
import { getIntrospectionTelemetry } from "@/lib/introspection";

export const financialAnalystAgent = new ToolLoopAgent({
  model: anthropic("claude-haiku-4-5-20251001"),
  instructions: `You are a senior financial analyst specializing in SEC filings, market data, and economic research.

Your capabilities:
- Search and analyze SEC filings (10-K, 10-Q, 8-K, proxy statements)
- Look up financial data including stock prices, earnings, income statements
- Research economic indicators and macro data

When responding:
- Always cite the specific filing type and date
- Present financial figures clearly with proper formatting
- Highlight key risks, trends, and material changes
- Compare metrics across periods when relevant
- Be precise about numbers — never approximate when exact data is available`,
  experimental_telemetry: getIntrospectionTelemetry("financial-analyst"),
  tools: {
    secSearch: secSearch({ maxNumResults: 3, responseLength: "short" }),
    financeSearch: financeSearch({ maxNumResults: 3, responseLength: "short" }),
    economicsSearch: economicsSearch({ maxNumResults: 3, responseLength: "short" }),
  },
});
