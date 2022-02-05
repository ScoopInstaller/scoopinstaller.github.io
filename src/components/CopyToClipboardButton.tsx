import React, { useState, useEffect, useCallback } from 'react';

import { Button } from 'react-bootstrap';
import { FaClipboard, FaCheck } from 'react-icons/fa';

const CLIPBOARD_COPY_NOTIFICATION = 1500;

type CopyToClipboardButtonProps = {
  className?: string;
  onClick: () => void;
};

const CopyToClipboardButton = (props: CopyToClipboardButtonProps): JSX.Element => {
  const [copied, setCopied] = useState<boolean>(false);
  const { onClick, className } = props;

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, CLIPBOARD_COPY_NOTIFICATION);
    }
  }, [copied]);

  const handleClick = useCallback((): void => {
    onClick();
    setCopied(true);
  }, [onClick]);

  return (
    <Button className={className} variant="secondary" onClick={handleClick} disabled={copied}>
      {copied ? <FaCheck className="faIconVerticalAlign" /> : <FaClipboard className="faIconVerticalAlign" />}
    </Button>
  );
};

export default React.memo(CopyToClipboardButton);
