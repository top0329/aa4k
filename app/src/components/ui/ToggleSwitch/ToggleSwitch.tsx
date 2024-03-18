import { Flex } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import React from 'react';
import { vars } from '~/styles/theme.css';

interface SwitchProps {
  isOn: boolean;
  onToggle: () => void;
}

const ToggleSwitch: React.FC<SwitchProps> = ({ isOn, onToggle }) => {
  return (
    <Flex
      align={'center'}
      style={{
        cursor: 'pointer',
      }}
      onClick={onToggle}>
      <motion.div
        style={{
          width: '44px',
          height: '24px',
          backgroundColor: '#ccc',
          borderRadius: 20,
          padding: 2
        }}
        animate={{ backgroundColor: isOn ? vars.color.iris.iris9 : vars.color.cyan.cyan9 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          style={{
            width: 20,
            height: 20,
            backgroundColor: 'white',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
          animate={{ x: isOn ? '18px' : '2px' }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </Flex>
  );
};

export default ToggleSwitch;
