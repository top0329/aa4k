// src/components/ui/ErrorToast/ErrorToastProvider.tsx
import * as RadixToast from "@radix-ui/react-toast";
import { ReactNode, createContext, useCallback, useContext, useRef, useState } from 'react';
import { ToastPosition } from "~/types/ToastPosition";
import ErrorToast from './ErrorToast';
import { sToastPosition } from "./ErrorToast.css";

type ToastContextType = {
  showToast: (message: string, timeout?: number, isTimeout?: boolean, position?: ToastPosition) => void;
};

type ErrorToastProviderProps = {
  children: ReactNode;
} & ToastMessage;

type ToastMessage = {
  id?: string;
  message?: string;
  timeout?: number;
  isTimeout?: boolean;
  position?: ToastPosition;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ErrorToastProvider = ({ children, ...props }: ErrorToastProviderProps) => {
  const { timeout, isTimeout } = props;
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const toastElementsMapRef = useRef(new Map());

  const showToast = useCallback((message: string, timeout = 3000, isTimeout = true, position: ToastPosition = 'bottom-right') => {
    const newMessage = {
      id: Date.now().toString(),
      message,
      timeout,
      isTimeout,
      position,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  }, [setMessages]);

  const removeToast = useCallback((id: string) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
  }, [setMessages]);


  const toastPositions: ToastPosition[] = ['top-left', 'top-center', 'top-right', 'bottom-right', 'bottom-center', 'bottom-left'];

  return (
    <RadixToast.Provider duration={isTimeout ? timeout : 0}>
      <ToastContext.Provider value={{ showToast }}>
        {children}
      </ToastContext.Provider>
      {toastPositions.map((pos) => (
        <RadixToast.ToastViewport key={pos} className={sToastPosition[pos]}>
          {messages
            .filter((msg) => msg.position === pos)
            .map((msg, index) => (
              <ErrorToast
                key={msg.id}
                isOpen={true}
                setOpen={() => removeToast(msg.id || '')}
                timeout={msg.timeout}
                isTimeout={msg.isTimeout}
                ref={(el) => toastElementsMapRef.current.set(msg.id, el)}
                position={msg.position}
                style={{
                  ...(pos.includes('top') ? { top: `${index * 100}px` } : { bottom: `${index * 100}px` }),
                  ...(pos.includes('center') ? { transform: 'translateX(-50%)' } : {}),
                }}
              >
                {msg.message}
              </ErrorToast>
            ))}
        </RadixToast.ToastViewport>
      ))}
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
