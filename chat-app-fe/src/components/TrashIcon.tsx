// src/components/LockIcon.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';

interface TrashIconProps {
  onTrashClick: () => void;
}

const TrashIcon: React.FC<TrashIconProps> = ({ onTrashClick }) => {
  return (
    <div style={{ cursor: 'pointer' }}>
      <FontAwesomeIcon onClick={onTrashClick} icon={faTrashCan} size="2x" />
    </div>
  );
};

export default TrashIcon;
