import { LLM, BaseLLMParams } from "./base.js";
import { getEnvironmentVariable } from "../util/env.js";

/**
 * Type definition for AI21 penalty data.
 */
export const ai21 = type AI21PenaltyData = {
  scale: number;
  applyToWhitespaces: boolean;
  applyToPunctuations: boolean;
  applyToNumbers: boolean;
  applyToStopwords: boolean;
  applyToEmojis: boolean;
}

/**
 * Interface for AI21 input parameters.
 */
export const ai21 = interface AI21Input extends BaseLLMParams {
  ai21ApiKey?: string;
  model?: string;
  temperature?: number;
  minTokens?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: AI21PenaltyData;
  countPenalty?: AI21PenaltyData;
  frequencyPenalty?: AI21PenaltyData;
  numResults?: number;
  logitBias?: Record<string, number>;
  stop?: string[];
  baseUrl?: string;
}

/**
 * Class representing the AI21 language model. It extends the LLM (Large
 * Language Model) class, providing a standard interface for interacting
 * with the AI21 language model.
 */
export class AI21 extends LLM implements AI21Input {
  model = "j2-jumbo-instruct";

  temperature = 0.7;

  maxTokens = 1024;

  minTokens = 0;

  topP = 1;

  presencePenalty = AI21.getDefaultAI21PenaltyData();

  countPenalty = AI21.getDefaultAI21PenaltyData();

  frequencyPenalty = AI21.getDefaultAI21PenaltyData();

  numResults = 1;

  logitBias?: Record<string, number>;

  ai21ApiKey?: string;

  stop?: string[];

  baseUrl?: string;

  constructor(fields?: AI21Input) {
    super(fields ?? {});

    this.model = fields?.model ?? this.model;
    this.temperature = fields?.temperature ?? this.temperature;
    this.maxTokens = fields?.maxTokens ?? this.maxTokens;
    this.minTokens = fields?.minTokens ?? this.minTokens;
    this.topP = fields?.topP ?? this.topP;
    this.presencePenalty = fields?.presencePenalty ?? this.presencePenalty;
    this.countPenalty = fields?.countPenalty ?? this.countPenalty;
    this.frequencyPenalty = fields?.frequencyPenalty ?? this.frequencyPenalty;
    this.numResults = fields?.numResults ?? this.numResults;
    this.logitBias = fields?.logitBias;
    this.ai21ApiKey =
      fields?.ai21ApiKey ?? getEnvironmentVariable("AI21_API_KEY");
    this.stop = fields?.stop;
    this.baseUrl = fields?.baseUrl;
  }

  /**
   * Method to validate the environment. It checks if the AI21 API key is
   * set. If not, it throws an error.
   */
  validateEnvironment() {
    if (!this.ai21ApiKey) {
      throw new Error(
        `No AI21 API key found. Please set it as "AI21_API_KEY" in your environment variables.`
      );
    }
  }

  /**
   * Static method to get the default penalty data for AI21.
   * @returns AI21PenaltyData
   */
  static getDefaultAI21PenaltyData(): AI21PenaltyData {
    return {
      scale: 0,
      applyToWhitespaces: true,
      applyToPunctuations: true,
      applyToNumbers: true,
      applyToStopwords: true,
      applyToEmojis: true,
    };
  }

  /** Get the type of LLM. */
  _llmType() {
    return "ai21";
  }

  /** Get the default parameters for calling AI21 API. */
  get defaultParams() {
    return {
      temperature: this.temperature,
      maxTokens: this.maxTokens,
      minTokens: this.minTokens,
      topP: this.topP,
      presencePenalty: this.presencePenalty,
      countPenalty: this.countPenalty,
      frequencyPenalty: this.frequencyPenalty,
      numResults: this.numResults,
      logitBias: this.logitBias,
    };
  }

  /** Get the identifying parameters for this LLM. */
  get identifyingParams() {
    return { ...this.defaultParams, model: this.model };
  }

  /** Call out to AI21's complete endpoint.
   Args:
       prompt: The prompt to pass into the model.
   stop: Optional list of stop words to use when generating.

       Returns:
   The string generated by the model.

   Example:
   let response = ai21._call("Tell me a joke.");
   */
  async _call(
    prompt: string,
    options: this["ParsedCallOptions"]
  ): Promise<string> {
    let stop = options?.stop;
    this.validateEnvironment();
    if (this.stop && stop && this.stop.length > 0 && stop.length > 0) {
      throw new Error("`stop` found in both the input and default params.");
    }
    stop = this.stop ?? stop ?? [];

    const baseUrl =
      this.baseUrl ?? this.model === "j1-grande-instruct"
        ? "https://api.ai21.com/studio/v1/experimental"
        : "https://api.ai21.com/studio/v1";

    const url = `${baseUrl}/${this.model}/complete`;
    const headers = {
      Authorization: `Bearer ${this.ai21ApiKey}`,
      "Content-Type": "application/json",
    };
    const data = { prompt, stopSequences: stop, ...this.defaultParams };
    const responseData = await this.caller.callWithOptions({}, async () => {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
        signal: options.signal,
      });
      if (!response.ok) {
        const error = new Error(
          `AI21 call failed with status code ${response.status}`
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response = response;
        throw error;
      }
      return response.json();
    });

    if (
      !responseData.completions ||
      responseData.completions.length === 0 ||
      !responseData.completions[0].data
    ) {
      throw new Error("No completions found in response");
    }

    return responseData.completions[0].data.text ?? "";
  }
}
