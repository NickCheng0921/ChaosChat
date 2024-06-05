// src/components/HealthIcon.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

interface HealthIconProps {
	color: string;
  }

const HealthIcon: React.FC<HealthIconProps> = ({ color }) => {
  return (
    <div>
      <FontAwesomeIcon icon={faCircle} size="1x" style={{color}}/>
    </div>
  );
};

export default HealthIcon;
