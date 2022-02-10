import React, { useState, useEffect, useCallback } from 'react';

import { Button } from 'react-bootstrap';
import { FaRegClipboard, FaCheck } from 'react-icons/fa';

const CLIPBOARD_COPY_NOTIFICATION_DELAY = 1500;

type Props = { title: string; variant: string; id: string; onClick: React.MouseEventHandler<HTMLButtonElement> };

const CopyToClipboardButton = React.forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const [copied, setCopied] = useState<boolean>(false);
  const { onClick } = props;

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, CLIPBOARD_COPY_NOTIFICATION_DELAY);
    }
  }, [copied]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      onClick?.call(this, e);
      setCopied(true);
    },
    [onClick]
  );

  return (
    <Button {...props} onClick={handleClick} disabled={copied} ref={ref}>
      {copied ? <FaCheck /> : <FaRegClipboard />}
    </Button>
  );
});

CopyToClipboardButton.displayName = 'CopyToClipboardButton';
export default React.memo(CopyToClipboardButton);
