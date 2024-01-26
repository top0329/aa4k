// src/components/forms/Form/FormLogic.tsx
import { useAtom } from 'jotai';
import { exampleValueAtom } from './FormState';

type UseFormLogicReturn = {
  exampleValue: string;
  setExampleValue: (value: string) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const useFormLogic = (onSubmit: (data: { example: string }) => void): UseFormLogicReturn => {
  const [exampleValue, setExampleValue] = useAtom(exampleValueAtom);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ example: exampleValue });
  };

  return {
    exampleValue,
    setExampleValue,
    handleSubmit,
  };
};
