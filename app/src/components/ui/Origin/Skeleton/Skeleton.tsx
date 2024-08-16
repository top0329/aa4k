// src/components/ui/Skeleton/Skeleton.tsx
import { motion } from 'framer-motion';
import { vars } from '~/styles/theme.css';

const SkeletonLine = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ opacity: 0.5, width: 0 }}
    animate={{ opacity: 1, width: '100%' }}
    transition={{ repeat: Infinity, duration: 1.8, repeatType: "reverse", delay }}
    style={{
      height: '12px',
      backgroundColor: vars.color.primary6,
      marginBottom: 8
    }}
  />
);

const DockSkeleton = () => (
  <motion.div
    initial={{ boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)', backgroundColor: vars.color.gray.gray4 }}
    animate={{ boxShadow: "0px 0px 32px 0px rgba(0, 0, 0, 0.12)", backgroundColor: vars.color.gray.gray2 }}
    transition={{ repeat: Infinity, duration: 2.4, repeatType: "reverse" }}
    style={{ width: '100vw', height: 56 }}>
    <SkeletonLine delay={0.4} />
    <SkeletonLine delay={1.2} />
    <SkeletonLine delay={1.6} />
  </motion.div>
);

export default DockSkeleton;
