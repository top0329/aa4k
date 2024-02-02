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

// デバイス区分
export const DeviceDiv = {
  desktop: "desktop",
  mobile: "mobile",
} as const;
export type DeviceDiv = (typeof DeviceDiv)[keyof typeof DeviceDiv];

// 契約区分
export const ContractDiv = {
  trial: "trial",
  active: "active",
  expired: "expired",
} as const;
export type ContractDiv = (typeof ContractDiv)[keyof typeof ContractDiv];
