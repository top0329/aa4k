// src/components/forms/Form/FormLogic.tsx
import { useAtom } from 'jotai';
import { useState } from 'react';
import { ConversationsState } from '../CornerDialog/CornerDialogState';

export const usePromptFormLogic = () => {
  const [conversations, setConversations] = useAtom(ConversationsState);
  const [humanMessage, setHumanMessage] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setConversations([
      ...conversations,
      {
        message: {
          role: 'human',
          content: humanMessage
        },
      },
    ]);
    setHumanMessage('');
  };

  return {
    conversations,
    setConversations,
    humanMessage,
    setHumanMessage,
    handleSubmit
  };
};
