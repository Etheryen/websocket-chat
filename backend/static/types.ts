export type State =
  | "uninitialized"
  | "connecting"
  | "reconnecting"
  | "connected"
  | "disconnected"
  | "error";

export type Message =
  | { kind: "text"; data: TextMessage }
  | { kind: "users"; data: number[] };

export type TextMessage = {
  author: string;
  content: string;
};
