import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BucketTypeIcon from './BucketTypeIcon';

describe('BucketTypeIcon', () => {
  describe('icon type', () => {
    it('renders official bucket icon (verified) for official bucket', () => {
      const { container } = render(<BucketTypeIcon official={true} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('color', '#2E86C1');
    });

    it('renders popular community bucket icon for community bucket with 50+ stars', () => {
      const { container } = render(<BucketTypeIcon official={false} stars={50} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('color', '#6B9DBF');
    });

    it('renders regular community bucket icon for community bucket with less than 50 stars', () => {
      const { container } = render(<BucketTypeIcon official={false} stars={25} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('color', '#CCCCCC');
    });

    it('renders regular community bucket icon when stars is 0', () => {
      const { container } = render(<BucketTypeIcon official={false} stars={0} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('color', '#CCCCCC');
    });

    it('renders regular community bucket icon when stars is not provided', () => {
      const { container } = render(<BucketTypeIcon official={false} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('color', '#CCCCCC');
    });
  });

  describe('tooltip configuration', () => {
    it('renders with tooltip wrapper by default', () => {
      const { container } = render(<BucketTypeIcon official={true} />);

      // The component wraps the icon in an OverlayTrigger span
      const spanWrapper = container.querySelector('span');
      expect(spanWrapper).toBeInTheDocument();
    });

    it('renders without tooltip content when showTooltip is false', () => {
      const { container } = render(<BucketTypeIcon official={true} showTooltip={false} />);

      // Icon should still render
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders icon when stars is provided', () => {
      const { container } = render(<BucketTypeIcon official={false} stars={100} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders icon when stars is not provided', () => {
      const { container } = render(<BucketTypeIcon official={true} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('props spreading', () => {
    it('passes additional props to the icon', () => {
      const { container } = render(
        <BucketTypeIcon official={true} data-testid="bucket-icon" className="custom-class" />
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('data-testid', 'bucket-icon');
      expect(svg).toHaveClass('custom-class');
    });
  });
});
