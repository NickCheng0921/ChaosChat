// src/components/LockIcon.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';

interface LockIconProps {
  locked: boolean;
  toggleLock: () => void;
}

const LockIcon: React.FC<LockIconProps> = ({ locked, toggleLock }) => {
  return (
    <div onClick={toggleLock} style={{ cursor: 'pointer' }}>
      <FontAwesomeIcon icon={locked ? faLock : faUnlock} size="2x" />
    </div>
  );
};

export default LockIcon;
