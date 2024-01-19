export type ChatItem = {
  question: string;
  answer: string;
};

export type FormSchema = {
  body: string;
};

export enum AnimationStatus {
  Idle,
  ToolStart,
  ToolEnd,
  AgentEnd,
}
