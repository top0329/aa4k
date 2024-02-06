// src/components/feature/CornerDialog/state.tsx
import { atom } from "jotai";
import { Conversation } from "~/types/agents";

export const ConversationsState = atom<Conversation[]>([
  {
    message: {
      role: 'human',
      content: 'Hello, how can I help you?'
    },
    chatHistory: [
      {
        role: 'ai',
        content: 'Hello, I have a problem with my account'
      },
    ],
  }]);
