import React, { useRef, useEffect } from 'react';

type CopyToClipboardHandlerProps = {
  content?: string;
  onContentCopied: () => void;
};

const CopyToClipboardHandler = (props: CopyToClipboardHandlerProps): JSX.Element => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { content, onContentCopied } = props;

  useEffect(() => {
    if (content) {
      const textArea = textAreaRef.current;
      if (textArea) {
        textArea.value = content;
        textArea.select();
        document.execCommand('copy');
        textArea.blur();

        onContentCopied();
      }
    }
  });

  return <textarea ref={textAreaRef} readOnly style={{ position: 'absolute', left: -9999 }} />;
};

export default React.memo(CopyToClipboardHandler);
