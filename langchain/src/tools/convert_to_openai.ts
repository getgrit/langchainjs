import { zodToJsonSchema } from "zod-to-json-schema";
import { OpenAI as OpenAIClient } from "openai";

import { StructuredTool } from "./base.js";

export function formatToOpenAIFunction(
  tool: StructuredTool
): OpenAIClient.Chat.CompletionCreateParams.Function {
  return {
    name: tool.name,
    description: tool.description,
    parameters: zodToJsonSchema(tool.schema),
  };
}
