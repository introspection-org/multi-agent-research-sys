import { IntrospectionAISDKIntegration } from "@introspection-sdk/introspection-node";

let introspection: IntrospectionAISDKIntegration | undefined;

function getIntrospectionIntegration() {
  if (!process.env.INTROSPECTION_TOKEN) {
    return undefined;
  }

  introspection ??= new IntrospectionAISDKIntegration({
    serviceName: "multi-agent-research-sys",
  });

  return introspection;
}

export function getIntrospectionTelemetry(functionId: string) {
  const integration = getIntrospectionIntegration();

  if (!integration) {
    return {
      isEnabled: false,
      functionId,
    };
  }

  return {
    isEnabled: true,
    functionId,
    integrations: [integration],
  };
}
