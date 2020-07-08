import { Placement } from 'react-bootstrap/Overlay';

export interface ICopyToClipboardButtonState {
  copied: boolean;
}

export interface ICopyToClipboardButtonProps {
  tooltipPlacement?: Placement;
  className?: string;
  onClick: () => void;
}
