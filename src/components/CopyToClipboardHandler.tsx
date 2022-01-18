import React, { PureComponent } from 'react';

type CopyToClipboardHandlerProps = {
  content?: string;
  onContentCopied: () => void;
};

class CopyToClipboardHandler extends PureComponent<CopyToClipboardHandlerProps> {
  private textAreaRef = React.createRef<HTMLTextAreaElement>();

  componentDidUpdate(): void {
    const { content, onContentCopied } = this.props;
    if (content) {
      const textArea = this.textAreaRef.current;
      if (textArea) {
        textArea.value = content;
        textArea.select();
        document.execCommand('copy');
        textArea.blur();

        onContentCopied();
      }
    }
  }

  render(): JSX.Element {
    return (
      <textarea
        ref={this.textAreaRef}
        readOnly
        style={{ position: 'absolute', left: -9999 }}
      />
    );
  }
}

export default CopyToClipboardHandler;
