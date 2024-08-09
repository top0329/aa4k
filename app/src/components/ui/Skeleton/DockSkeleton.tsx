// src/components/ui/Skeleton/Skeleton.tsx
import { Flex, Separator } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import { vars } from '~/styles/theme.css';


const DockSkeleton = () => (
  <motion.div
    initial={{ boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)', backgroundColor: vars.color.gray.gray4 }}
    animate={{ boxShadow: "0px 0px 32px 0px rgba(0, 0, 0, 0.12)", backgroundColor: vars.color.gray.gray2 }}
    transition={{ repeat: Infinity, duration: 2.4, repeatType: "reverse" }}
    style={{ width: '100vw', height: 56 }}>
    <Flex
      width={'100%'}
      height={'100%'}
      justify={'between'}
      py={'2'}
      px={'4'}
    >
      <Flex
        align={'center'}
        gap={'3'}
      >
        <motion.div
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.8, repeatType: "reverse" }}
          style={{
            width: 70,
            height: 40,
            backgroundColor: vars.color.gray.gray8,
            borderRadius: 8
          }}
        />
        <Separator orientation="vertical" />
        <motion.div
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.8, repeatType: "reverse" }}
          style={{
            width: 40,
            height: 40,
            backgroundColor: vars.color.gray.gray8,
            borderRadius: 8
          }}
        />
        <Separator orientation="vertical" />
        <motion.div
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.8, repeatType: "reverse" }}
          style={{
            width: 40,
            height: 40,
            backgroundColor: vars.color.gray.gray8,
            borderRadius: 8
          }}
        />
      </Flex>
      <motion.div
        initial={{ opacity: 0.2 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1.8, repeatType: "reverse" }}
        style={{
          width: 40,
          height: 40,
          backgroundColor: vars.color.gray.gray8,
          borderRadius: 8
        }}
      />

    </Flex>
  </motion.div>
);

export default DockSkeleton;
