import OpenAI, { ClientOptions } from "openai";
import { BaseChain, ChainInputs } from "./base.js";
import { ChainValues } from "../schema/index.js";
import { AsyncCaller, AsyncCallerParams } from "../util/async_caller.js";
import { getEnvironmentVariable } from "../util/env.js";

export interface OpenAIModerationChainInput
  extends ChainInputs,
    AsyncCallerParams {
  openAIApiKey?: string;
  openAIOrganization?: string;
  throwError?: boolean;
  configuration?: ClientOptions;
}

export class OpenAIModerationChain
  extends BaseChain
  implements OpenAIModerationChainInput
{
  get lc_secrets(): { [key: string]: string } | undefined {
    return {
      openAIApiKey: "OPENAI_API_KEY",
    };
  }

  inputKey = "input";

  outputKey = "output";

  openAIApiKey?: string;

  openAIOrganization?: string;

  clientConfig: ClientOptions;

  client: OpenAI;

  throwError: boolean;

  caller: AsyncCaller;

  constructor(fields?: OpenAIModerationChainInput) {
    super(fields);
    this.throwError = fields?.throwError ?? false;
    this.openAIApiKey =
      fields?.openAIApiKey ?? getEnvironmentVariable("OPENAI_API_KEY");

    if (!this.openAIApiKey) {
      throw new Error("OpenAI API key not found");
    }

    this.openAIOrganization = fields?.openAIOrganization;

    this.clientConfig = {
      ...fields?.configuration,
      apiKey: this.openAIApiKey,
      organization: this.openAIOrganization,
      ...fields?.configuration,
    };

    this.client = new OpenAI(this.clientConfig);

    this.caller = new AsyncCaller(fields ?? {});
  }

  _moderate(text: string, results: OpenAI.Moderation): string {
    if (results.flagged) {
      const errorStr = "Text was found that violates OpenAI's content policy.";
      if (this.throwError) {
        throw new Error(errorStr);
      } else {
        return errorStr;
      }
    }
    return text;
  }

  async _call(values: ChainValues): Promise<ChainValues> {
    const text = values[this.inputKey];
    const moderationRequest: OpenAI.ModerationCreateParams = {
      input: text,
    };
    let mod;
    try {
      mod = await this.caller.call(() =>
        this.client.moderations.create(moderationRequest)
      );
    } catch (error) {
      // eslint-disable-next-line no-instanceof/no-instanceof
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(error as string);
      }
    }
    const output = this._moderate(text, mod.results[0]);
    return {
      [this.outputKey]: output,
    };
  }

  _chainType() {
    return "moderation_chain";
  }

  get inputKeys(): string[] {
    return [this.inputKey];
  }

  get outputKeys(): string[] {
    return [this.outputKey];
  }
}
