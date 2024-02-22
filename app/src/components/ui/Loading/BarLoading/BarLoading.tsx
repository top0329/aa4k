// src/components/ui/Loading/BarLoading/BarLoading.tsx
import { Box } from "@radix-ui/themes";
import { AnimatePresence, motion } from "framer-motion";
import { sBar, sBarContainer } from "./BarLoading.css";

type BarLoadingProps = {
  isLoading: boolean;
};

const BarLoading: React.FC<BarLoadingProps> = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 1 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          style={{ width: '100%', padding: 0, position: 'absolute', bottom: 64, left: 0, right: 0, zIndex: 1000 }}
        >
          <Box className={sBarContainer}>
            <Box className={sBar}></Box>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
};

export default BarLoading;
