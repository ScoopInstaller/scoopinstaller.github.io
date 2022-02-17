import React from 'react';

import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { GoVerified, GoUnverified, GoStar } from 'react-icons/go';

import { DELAY_TOOLTIP } from '../constants';

const OFFICIAL_ICON_COLOR = '#2E86C1';
const COMMUNITY_ICON_COLOR = '#CCCCCC';
const POPULAR_COMMUNITY_ICON_COLOR = '#6B9DBF';
const POPULAR_REPOSITORY_THRESHOLD = 50;

type BucketTypeIconProps = {
  official: boolean;
  stars?: number;
  showTooltip?: boolean;
} & React.HTMLAttributes<SVGElement>;

const BucketTypeIcon = (props: BucketTypeIconProps): JSX.Element => {
  const { official, stars = 0, showTooltip = true, ...rest } = props;
  return (
    <OverlayTrigger
      placement="bottom"
      delay={DELAY_TOOLTIP}
      overlay={
        showTooltip ? (
          <Tooltip id="buckettype-tooltip">
            <span>
              {official
                ? 'Official bucket'
                : stars >= POPULAR_REPOSITORY_THRESHOLD
                ? 'Popular community bucket'
                : 'Community bucket'}
            </span>
            {props.stars !== undefined && (
              <span className="ms-1">
                ({stars} <GoStar />)
              </span>
            )}
          </Tooltip>
        ) : (
          <span />
        )
      }
    >
      <span>
        {(official && <GoVerified {...rest} color={OFFICIAL_ICON_COLOR} />) ||
          (stars >= POPULAR_REPOSITORY_THRESHOLD && (
            <GoUnverified {...rest} color={POPULAR_COMMUNITY_ICON_COLOR} />
          )) || <GoUnverified {...rest} color={COMMUNITY_ICON_COLOR} />}
      </span>
    </OverlayTrigger>
  );
};

export default React.memo(BucketTypeIcon);
