// src/components/ui/Loading/RippleLoading/RippleLoading.tsx
import { Box } from '@radix-ui/themes';
import { AnimatePresence, motion } from 'framer-motion';
import { sRippleCircle, sRippleContainer } from './RippleLoading.css';

type RippleLoadingProps = {
  isLoading: boolean;
};

const RippleLoading: React.FC<RippleLoadingProps> = ({ isLoading }) => (
  <AnimatePresence>
    {isLoading && (
      <motion.div
        initial={{ opacity: 0 }}
        exit={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 1 : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <Box className={sRippleContainer}>
          <Box className={sRippleCircle}></Box>
          <Box className={sRippleCircle}></Box>
        </Box>
      </motion.div>
    )}
  </AnimatePresence>
);

export default RippleLoading;
