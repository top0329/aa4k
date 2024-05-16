// src/components/ui/Skeleton/Skeleton.tsx
import { Box, Flex } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import { vars } from '~/styles/theme.css';



const Prompt = () => (
  <motion.div
    initial={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
    style={{
      padding: 32,
      width: '100%',
      height: 196,
      backgroundColor: vars.color.gray.gray6,
      borderRadius: `0 0 16px 16px`,
    }}
  >
    <Flex
      gap={'4'}
      direction={'column'}
    >
      <Box
        width={'100%'}
        style={{
          height: 88,
          background: vars.color.gray.gray2,
          borderRadius: 8,
        }}
      />
      <Flex
        gap={'2'}
        width={'100%'}
        height={'100%'}
        justify={'end'}
      >
        <Box
          style={{
            width: 40,
            height: 40,
            background: vars.color.gray.gray2,
            borderRadius: 8,
          }}
        />
        <Box
          style={{
            width: 40,
            height: 40,
            background: vars.color.gray.gray2,
            borderRadius: 8,
          }}
        />
        <Box
          style={{
            width: 40,
            height: 40,
            background: vars.color.gray.gray2,
            borderRadius: 8,
          }}
        />
      </Flex>
    </Flex>
  </motion.div>
);

const SkeletonLine = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ opacity: 0.2 }}
    animate={{ opacity: 1, width: '100%' }}
    transition={{ repeat: Infinity, duration: 1.8, repeatType: "reverse", delay }}
    style={{
      height: '12px',
      backgroundColor: vars.color.gray.gray8,
      marginBottom: 8
    }}
  />
);



const ChatSkeleton = () => (
  <motion.div
    initial={{ boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)', backgroundColor: vars.color.gray.gray4, opacity: 0.8 }}
    animate={{ boxShadow: "0px 0px 32px 0px rgba(0, 0, 0, 0.12)", backgroundColor: vars.color.gray.gray2, opacity: 1 }}
    transition={{ repeat: Infinity, duration: 2.4, repeatType: "reverse" }}
    style={{
      background: `rgba(255, 255, 255, 0.96)`,
      boxShadow: `0px 0px 32px 0 ${vars.color.grayA.grayA4}`,
      borderRadius: 16,
      position: `fixed`,
      bottom: `68px`,
      right: 12,
      display: `flex`,
      justifyContent: "flex-end",
      alignItems: "flex-end",
      flexDirection: "column",
      width: 640,
      height: `90vh`,
      msOverflowY: `auto`,
      zIndex: 101,
    }}
  >
    <Flex
      gap={'3'}
      width={'100%'}
      height={'100%'}
      direction={'column'}
    >
      <Box
        p={'8'}
        width={'100%'}
        height={'100%'}
      >
        <SkeletonLine delay={0.4} />
        <SkeletonLine delay={1.2} />
        <SkeletonLine delay={1.6} />
      </Box>
      <Box
        p={'8'}
        width={'100%'}
        height={'100%'}
      >
        <SkeletonLine delay={0.8} />
        <SkeletonLine delay={1.6} />
        <SkeletonLine delay={2} />
      </Box>
      <Box
        p={'8'}
        width={'100%'}
        height={'100%'}
      >
        <SkeletonLine delay={1.2} />
        <SkeletonLine delay={2} />
        <SkeletonLine delay={2.4} />
      </Box>
    </Flex>
    <Prompt />
  </motion.div>
);

export default ChatSkeleton;
