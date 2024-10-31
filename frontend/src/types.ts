export type Message =
  | { kind: "text"; data: TextMessage }
  | { kind: "users"; data: string[] };

export type TextMessage = {
  author: string;
  content: string;
};
