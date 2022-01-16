import React, { PureComponent } from 'react';

import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { GoVerified, GoUnverified } from 'react-icons/go';

const DELAY_TOOLTIP = 250;
const OFFICIAL_ICON_COLOR = '#2E86C1';
const COMMUNITY_ICON_COLOR = '#CCCCCC';

type BucketTypeIconProps = {
  official: boolean;
  showTooltip?: boolean;
};

class BucketTypeIcon extends PureComponent<BucketTypeIconProps> {
  render(): JSX.Element {
    const { official, showTooltip = true } = this.props;
    return (
      <OverlayTrigger
        placement="auto"
        delay={DELAY_TOOLTIP}
        overlay={
          showTooltip ? (
            <Tooltip id="tooltip">
              {official ? 'Known bucket' : 'Community bucket'}
            </Tooltip>
          ) : (
            <span />
          )
        }
      >
        {official ? (
          <GoVerified
            className="ml-1 faIconVerticalAlign"
            color={OFFICIAL_ICON_COLOR}
          />
        ) : (
          <GoUnverified
            className="ml-1 faIconVerticalAlign"
            color={COMMUNITY_ICON_COLOR}
          />
        )}
      </OverlayTrigger>
    );
  }
}

export default BucketTypeIcon;
