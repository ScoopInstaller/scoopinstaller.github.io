import React, { PureComponent } from 'react';

import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { GoVerified } from 'react-icons/go';

const DELAY_TOOLTIP = 250;
const ICON_COLOR = '#2E86C1';

class KnownBucketIcon extends PureComponent {
  render(): JSX.Element {
    return (
      <OverlayTrigger
        placement="auto"
        delay={DELAY_TOOLTIP}
        overlay={<Tooltip id="tooltip">Well known bucket</Tooltip>}
      >
        <GoVerified className="ml-1 faIconVerticalAlign" color={ICON_COLOR} />
      </OverlayTrigger>
    );
  }
}

export default KnownBucketIcon;
