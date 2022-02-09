import React, { useState, useEffect, useCallback } from 'react';

import { Button, ButtonProps } from 'react-bootstrap';
import { FaClipboard, FaCheck } from 'react-icons/fa';

const CLIPBOARD_COPY_NOTIFICATION_DELAY = 1500;

const CopyToClipboardButton = (props: ButtonProps): JSX.Element => {
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
    <Button {...props} onClick={handleClick} disabled={copied}>
      {copied ? <FaCheck /> : <FaClipboard />}
    </Button>
  );
};

export default React.memo(CopyToClipboardButton);
