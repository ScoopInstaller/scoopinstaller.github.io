import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { GoVerified } from 'react-icons/go';

export const KnownBucketIcon: React.FC = () => {
  return (
    <OverlayTrigger
      placement="auto"
      delay={250}
      overlay={<Tooltip id="tooltip">Well known bucket</Tooltip>}
    >
      <GoVerified className="ml-1 faIconVerticalAlign" color="#2E86C1" />
    </OverlayTrigger>
  );
};
