import React, { useEffect } from 'react';

type CopyToClipboardHandlerProps = {
  content?: string;
  onContentCopied: () => void;
};

const CopyToClipboardHandler = (props: CopyToClipboardHandlerProps): JSX.Element => {
  const { content, onContentCopied } = props;

  useEffect(() => {
    const copyClipboardAsync = async (data: string) => {
      await navigator.clipboard.writeText(data);
    };

    if (content) {
      copyClipboardAsync(content)
        .then(() => onContentCopied())
        .finally(() => {});
    }
  });

  return <></>;
};

export default React.memo(CopyToClipboardHandler);
