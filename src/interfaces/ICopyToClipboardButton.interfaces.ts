export interface ICopyToClipboardButtonState {
  copied: boolean;
}

export interface ICopyToClipboardButtonProps {
  className?: string;
  onClick: () => void;
}
