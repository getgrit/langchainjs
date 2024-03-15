import type { AxiosRequestConfig } from "axios";
import type { EventSourceMessage } from "./event-source-parse.js";

export const axios_types = interface StreamingAxiosRequestConfig extends AxiosRequestConfig {
  responseType: "stream";

  /**
   * Called when a message is received. NOTE: Unlike the default browser
   * EventSource.onmessage, this callback is called for _all_ events,
   * even ones with a custom `event` field.
   */
  onmessage?: (ev: EventSourceMessage) => void;
};

export const axios_types = type StreamingAxiosConfiguration =
  | StreamingAxiosRequestConfig
  | AxiosRequestConfig;
