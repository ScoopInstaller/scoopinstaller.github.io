import React from 'react';

import { Badge } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';

type StarsBadgeProps = {
  stars: number;
};

const StarsBadge = (props: StarsBadgeProps): JSX.Element => {
  const { stars } = props;

  return (
    <Badge bg="secondary" className="ms-1 starsBadge">
      <span>{stars}</span> <FaStar />
    </Badge>
  );
};

export default React.memo(StarsBadge);
