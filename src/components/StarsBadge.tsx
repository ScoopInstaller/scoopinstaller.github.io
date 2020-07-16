import React from 'react';
import { Badge } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';

export const StarsBadge: React.FC<IStarsBadgeProps> = (props) => {
  return (
    <Badge variant="secondary" className="ml-1 starsBadge">
      <span>{props.stars}</span> <FaStar />
    </Badge>
  );
};

interface IStarsBadgeProps {
  stars: number;
}
