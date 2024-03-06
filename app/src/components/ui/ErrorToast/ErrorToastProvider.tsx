// src/components/ui/ErrorToast/ToastContext.tsx
import * as RadixToast from "@radix-ui/react-toast";
import { AnimatePresence } from "framer-motion";
import { ReactNode, createContext, useCallback, useContext, useRef, useState } from 'react';
import ErrorToast from './ErrorToast';
import { sToastViewport } from "./ErrorToast.css";

type ToastContextType = {
  showToast: (message: string, timeout?: number, isTimeout?: boolean) => void;
};

type ErrorToastProviderProps = {
  children: ReactNode;
} & ToastMessage;

type ToastMessage = {
  id?: string;
  message?: string;
  timeout?: number;
  isTimeout?: boolean;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ToastMessage
export const ErrorToastProvider = ({ children, ...props }: ErrorToastProviderProps) => {
  const { timeout, isTimeout } = props;
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const toastElementsMapRef = useRef(new Map());

  const showToast = useCallback((message: string, timeout = 3000, isTimeout = true) => {
    const newMessage = {
      id: Date.now().toString(),
      message,
      timeout,
      isTimeout,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  }, [setMessages]);

  const removeToast = useCallback((id: string) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
  }, [setMessages]);

  return (
    <RadixToast.Provider
      duration={isTimeout ? timeout : 0}
    >
      <ToastContext.Provider value={{ showToast }}>
        {children}
      </ToastContext.Provider>
      <AnimatePresence mode="popLayout">
        {messages.map((msg) => (
          <ErrorToast
            key={msg.id}
            isOpen={true}
            setOpen={() => removeToast(msg.id || '')}
            timeout={msg.timeout}
            isTimeout={msg.isTimeout}
            ref={(el) => toastElementsMapRef.current.set(msg.id, el)}
          >
            {msg.message}
          </ErrorToast>
        ))}
      </AnimatePresence>
      <RadixToast.ToastViewport className={sToastViewport} />
    </RadixToast.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ErrorToastProvider');
  }
  return context;
}
