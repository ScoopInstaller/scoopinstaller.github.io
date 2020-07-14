import React, { PureComponent } from 'react';

class CopyToClipboardHandler extends PureComponent<
  ICopyToClipboardHandlerProps
> {
  private textAreaRef = React.createRef<HTMLTextAreaElement>();

  componentDidUpdate() {
    if (this.props.content) {
      const textArea = this.textAreaRef.current!;

      textArea.value = this.props.content;
      textArea.select();
      document.execCommand('copy');
      textArea.blur();

      this.props.onContentCopied();
    }
  }

  render() {
    return (
      <textarea
        ref={this.textAreaRef}
        readOnly
        style={{ position: 'absolute', left: -9999 }}
      />
    );
  }
}

interface ICopyToClipboardHandlerProps {
  content?: string;
  onContentCopied: () => void;
}

export default CopyToClipboardHandler;
