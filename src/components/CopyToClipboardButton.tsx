import React, { PureComponent } from 'react';
import { Button } from 'react-bootstrap';
import { FaClipboard, FaCheck } from 'react-icons/fa';

const CLIPBOARD_COPY_NOTIFICATION: number = 1500;

class CopyToClipboardButton extends PureComponent<
  ICopyToClipboardButtonProps,
  ICopyToClipboardButtonState
> {
  constructor(props: ICopyToClipboardButtonProps) {
    super(props);
    this.state = { copied: false };
  }

  componentDidUpdate(
    prevProps: ICopyToClipboardButtonProps,
    prevState: ICopyToClipboardButtonState
  ) {
    if (this.state.copied && this.state.copied !== prevState.copied) {
      setTimeout(() => {
        this.setState({ copied: false });
      }, CLIPBOARD_COPY_NOTIFICATION);
    }
  }

  handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.props.onClick();
    this.setState({ copied: true });
  };

  render() {
    return (
      <Button
        className={this.props.className}
        variant="secondary"
        onClick={this.handleClick}
        disabled={this.state.copied}
      >
        {this.state.copied ? (
          <FaCheck className="faIconVerticalAlign" />
        ) : (
          <FaClipboard className="faIconVerticalAlign" />
        )}
      </Button>
    );
  }
}

interface ICopyToClipboardButtonState {
  copied: boolean;
}

interface ICopyToClipboardButtonProps {
  className?: string;
  onClick: () => void;
}

export default CopyToClipboardButton;
