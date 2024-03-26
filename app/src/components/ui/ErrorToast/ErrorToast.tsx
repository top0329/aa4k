// src/components/ui/ErrorToast/ErrorToast.tsx
import { faClose } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Toast from '@radix-ui/react-toast';
import { Box, Text } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import { ElementRef, forwardRef, useEffect, useRef, useState } from 'react';
import { vars } from '~/styles/theme.css';
import { ToastPosition } from '~/types/ToastPosition';
import { sProgressBar, sToast, sToastPosition } from './ErrorToast.css';

type ErrorToastProps = {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  children: React.ReactNode;
  timeout?: number;
  isTimeout?: boolean;
  position?: ToastPosition;
  style?: React.CSSProperties;
};


const ErrorToast = forwardRef<ElementRef<typeof Toast.Root>, ErrorToastProps>(
  ({ isOpen, setOpen, children, timeout = 3000, isTimeout = true,
    position = 'top-left', style
  }, forwardedRef) => {
    const [progress, setProgress] = useState(0);
    const startTime = useRef<number | null>(null);
    const endTime = useRef<number | null>(null);
    const [isHovering, setIsHovering] = useState(false);
    const intervalId = useRef<NodeJS.Timeout | null>(null);

    const updateProgress = () => {
      if (!startTime.current) return;

      const now = Date.now();
      const elapsedTime = now - startTime.current;
      const newProgress = Math.min(100, (elapsedTime / timeout) * 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        setOpen(false);
        clearInterval(intervalId.current!);
      }
    };

    const handleClose = () => {
      setOpen(false);
      setProgress(0);
    }

    useEffect(() => {
      if (isTimeout && isOpen) {
        if (!isHovering) {
          // マウスがホバーしていない時、プログレスを更新する
          if (!startTime.current) {
            startTime.current = Date.now();
          } else if (endTime.current) {
            // ホバーから復帰した時、経過時間を考慮する
            const pauseDuration = Date.now() - endTime.current;
            startTime.current += pauseDuration;
          }

          intervalId.current = setInterval(updateProgress, 100);
        } else {
          // マウスホバー時、タイマーを一時停止し、終了時間を記録
          endTime.current = Date.now();
          clearInterval(intervalId.current!);
        }

        return () => {
          clearInterval(intervalId.current!);
        };
      }
    }, [isOpen, isTimeout, isHovering]);

    return (
      <Toast.Root
        ref={forwardedRef}
        duration={Infinity}
        open={isOpen} onOpenChange={setOpen}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        forceMount
        asChild
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Box
            className={sToastPosition[position]}
            style={style}
          >
            <Box
              className={sToast}
            >
              <Box style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                position: 'absolute', top: 12, right: 12,
                cursor: 'pointer',
              }}>
                <FontAwesomeIcon color={vars.color.tomato.tomato10} icon={faClose} onClick={() => handleClose()} />
              </Box>
              <Box
                p={'2'}
              >
                <Text
                  as="p"
                  size={'3'}
                  style={{
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {children}
                </Text>

                {isTimeout && (
                  <motion.div className={sProgressBar}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    style={{
                      marginTop: 16,
                    }}
                  >

                  </motion.div>
                )}
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Toast.Root>
    );
  });

export default ErrorToast;
