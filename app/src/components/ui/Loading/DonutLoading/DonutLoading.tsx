// src/components/ui/Loading/DonutLoading/DonutLoading.tsx
import { Box } from "@radix-ui/themes";
import { AnimatePresence, motion } from 'framer-motion';
import { vars } from "~/styles/theme.css";
import { sDonut } from "./DonutLoading.css";

type DonutLoadingProps = {
  borderColor?: string;
  isLoading: boolean;
};

const DonutLoading: React.FC<DonutLoadingProps> = ({ borderColor: borderColor = `${vars.color.indigo.indigo10} ${vars.color.indigo.indigo6} ${vars.color.indigo.indigo6}`, isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 1 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <Box
            style={{
              borderColor: borderColor
            }}
            className={sDonut} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DonutLoading;
