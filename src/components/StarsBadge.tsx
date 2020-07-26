import React, { PureComponent } from 'react';

import { Badge } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';

type StarsBadgeProps = {
  stars: number;
};

class StarsBadge extends PureComponent<StarsBadgeProps> {
  render(): JSX.Element {
    const { stars } = this.props;

    return (
      <Badge variant="secondary" className="ml-1 starsBadge">
        <span>{stars}</span> <FaStar />
      </Badge>
    );
  }
}

export default StarsBadge;
