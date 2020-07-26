import React, { PureComponent } from 'react';

import { Button } from 'react-bootstrap';
import { FaClipboard, FaCheck } from 'react-icons/fa';

const CLIPBOARD_COPY_NOTIFICATION = 1500;

type CopyToClipboardButtonState = {
  copied: boolean;
};

type CopyToClipboardButtonProps = {
  className?: string;
  onClick: () => void;
};

class CopyToClipboardButton extends PureComponent<
  CopyToClipboardButtonProps,
  CopyToClipboardButtonState
> {
  constructor(props: CopyToClipboardButtonProps) {
    super(props);
    this.state = { copied: false };
  }

  componentDidUpdate(
    prevProps: CopyToClipboardButtonProps,
    prevState: CopyToClipboardButtonState
  ): void {
    const { copied } = this.state;
    if (copied && copied !== prevState.copied) {
      setTimeout(() => {
        this.setState({ copied: false });
      }, CLIPBOARD_COPY_NOTIFICATION);
    }
  }

  handleClick = (): void => {
    const { onClick } = this.props;
    onClick();
    this.setState({ copied: true });
  };

  render(): JSX.Element {
    const { className } = this.props;
    const { copied } = this.state;

    return (
      <Button
        className={className}
        variant="secondary"
        onClick={this.handleClick}
        disabled={copied}
      >
        {copied ? (
          <FaCheck className="faIconVerticalAlign" />
        ) : (
          <FaClipboard className="faIconVerticalAlign" />
        )}
      </Button>
    );
  }
}

export default CopyToClipboardButton;
