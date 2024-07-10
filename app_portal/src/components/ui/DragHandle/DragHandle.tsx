// src/components/ui/DragHandle/DragHandle.tsx

import { faGripDots } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import React from 'react';
import { vars } from '~/styles/theme.css';

import { Tooltip } from '@radix-ui/themes';

const DragHandle: React.FC = () => {
  return (
    <motion.div
      className="drag-handle"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: -8,
        right: -8,
        width: 24,
        height: 24,
        backgroundColor: vars.color.primaryEleHoverbg,
        borderRadius: 100,
        cursor: 'grab',
        zIndex: 1,
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Tooltip content="ドラッグして移動" side="bottom" align="center"
        delayDuration={0}
        style={{
          zIndex: 10000,
        }}>
        <FontAwesomeIcon icon={faGripDots} size='xs' />
      </Tooltip>
    </motion.div>
  );
};

export default DragHandle;
