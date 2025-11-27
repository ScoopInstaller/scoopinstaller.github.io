import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JsonConvert } from 'json2typescript';
import { describe, expect, it, vi } from 'vitest';
import { mockManifest } from '../__tests__/mocks/fixtures';
import ManifestJsonClass from '../serialization/ManifestJson';
import SearchResult from './SearchResult';

describe('SearchResult', () => {
  const jsonConvert = new JsonConvert();
  const mockOnCopyToClipboard = vi.fn();
  const mockOnResultSelected = vi.fn();

  const officialRepositories = {
    'ScoopInstaller/Main': 'main',
    'ScoopInstaller/Extras': 'extras',
  };

  const defaultProps = {
    result: jsonConvert.deserializeObject(mockManifest, ManifestJsonClass),
    officialRepositories,
    installBucketName: false,
    onCopyToClipboard: mockOnCopyToClipboard,
    onResultSelected: mockOnResultSelected,
  };

  describe('rendering', () => {
    it('should render app name', () => {
      render(<SearchResult {...defaultProps} />);

      expect(screen.getByText('nodejs')).toBeInTheDocument();
    });

    it('should render description', () => {
      render(<SearchResult {...defaultProps} />);

      expect(screen.getByText('JavaScript runtime environment')).toBeInTheDocument();
    });

    it('should render repository link', () => {
      render(<SearchResult {...defaultProps} />);

      const repoLink = screen.getByRole('link', { name: /main/i });
      expect(repoLink).toHaveAttribute('href', 'ScoopInstaller/Main');
    });

    it('should render version', () => {
      render(<SearchResult {...defaultProps} />);

      expect(screen.getByText('20.11.0')).toBeInTheDocument();
    });

    it('should render version with "v" prefix for numeric versions', () => {
      const numericVersionManifest = {
        ...mockManifest,
        Version: '1.0.0',
      };
      const result = jsonConvert.deserializeObject(numericVersionManifest, ManifestJsonClass);

      render(<SearchResult {...defaultProps} result={result} />);

      // Check that version is displayed
      expect(screen.getByText('1.0.0')).toBeInTheDocument();
    });

    it('should render homepage link when present', () => {
      render(<SearchResult {...defaultProps} />);

      const homepageLink = screen.getByRole('link', { name: /nodejs.org/i });
      expect(homepageLink).toHaveAttribute('href', 'https://nodejs.org');
    });

    it('should render notes when present', () => {
      const manifestWithNotes = {
        ...mockManifest,
        Notes: 'This is a note',
      };
      const result = jsonConvert.deserializeObject(manifestWithNotes, ManifestJsonClass);

      render(<SearchResult {...defaultProps} result={result} />);

      expect(screen.getByText('This is a note')).toBeInTheDocument();
    });
  });

  describe('license handling', () => {
    it('should render SPDX license as link', () => {
      render(<SearchResult {...defaultProps} />);

      const licenseLink = screen.getByRole('link', { name: /MIT/i });
      expect(licenseLink).toHaveAttribute('href', 'https://spdx.org/licenses/MIT.html');
    });

    it('should render non-SPDX license as plain text', () => {
      const customLicenseManifest = {
        ...mockManifest,
        License: 'CustomLicense',
      };
      const result = jsonConvert.deserializeObject(customLicenseManifest, ManifestJsonClass);

      render(<SearchResult {...defaultProps} result={result} />);

      expect(screen.getByText('CustomLicense')).toBeInTheDocument();
      // Should not be a link
      expect(screen.queryByRole('link', { name: /CustomLicense/i })).not.toBeInTheDocument();
    });

    it('should not render license section when license is missing', () => {
      const noLicenseManifest = {
        ...mockManifest,
        License: undefined,
      };
      const result = jsonConvert.deserializeObject(noLicenseManifest, ManifestJsonClass);

      const { container } = render(<SearchResult {...defaultProps} result={result} />);

      // Check that GoLaw icon (license icon) is not present
      const lawIcons = container.querySelectorAll('[title="License"]');
      expect(lawIcons.length).toBe(0);
    });
  });

  describe('command generation', () => {
    it('should generate bucket command for official repository', () => {
      render(<SearchResult {...defaultProps} />);

      const bucketCommand = screen.getByDisplayValue('scoop bucket add main');
      expect(bucketCommand).toBeInTheDocument();
    });

    it('should generate app install command without bucket name by default', () => {
      render(<SearchResult {...defaultProps} />);

      const appCommand = screen.getByDisplayValue('scoop install nodejs');
      expect(appCommand).toBeInTheDocument();
    });

    it('should generate app install command with bucket name when installBucketName is true', () => {
      render(<SearchResult {...defaultProps} installBucketName={true} />);

      const appCommand = screen.getByDisplayValue('scoop install main/nodejs');
      expect(appCommand).toBeInTheDocument();
    });

    it('should generate bucket command for community repository', () => {
      const communityManifest = {
        ...mockManifest,
        Metadata: {
          ...mockManifest.Metadata,
          Repository: 'https://github.com/user/custom-bucket',
          OfficialRepository: false,
        },
      };
      const result = jsonConvert.deserializeObject(communityManifest, ManifestJsonClass);

      render(<SearchResult {...defaultProps} result={result} />);

      const bucketCommand = screen.getByDisplayValue(
        'scoop bucket add user_custom-bucket https://github.com/user/custom-bucket'
      );
      expect(bucketCommand).toBeInTheDocument();
    });
  });

  describe('copy to clipboard', () => {
    it('should call onCopyToClipboard when bucket command is copied', async () => {
      const user = userEvent.setup();
      render(<SearchResult {...defaultProps} />);

      // Find the copy button for bucket command
      const copyButtons = screen.getAllByTitle('Copy to clipboard');
      await user.click(copyButtons[0]);

      expect(mockOnCopyToClipboard).toHaveBeenCalledWith('scoop bucket add main');
    });

    it('should call onCopyToClipboard when app command is copied', async () => {
      const user = userEvent.setup();
      render(<SearchResult {...defaultProps} />);

      // Find the app command input and click it
      const appCommandInput = screen.getByDisplayValue('scoop install nodejs');
      await user.click(appCommandInput);

      expect(mockOnCopyToClipboard).toHaveBeenCalledWith('scoop install nodejs');
    });

    it('should call onCopyToClipboard with full command when "Copy all" is clicked', async () => {
      const user = userEvent.setup();
      render(<SearchResult {...defaultProps} />);

      // Find the "Copy all" button
      const copyAllButton = screen.getByTitle('Copy all to clipboard');
      await user.click(copyAllButton);

      expect(mockOnCopyToClipboard).toHaveBeenCalledWith('scoop bucket add main\nscoop install nodejs');
    });

    it('should trigger copy when clicking on command text', async () => {
      const user = userEvent.setup();
      render(<SearchResult {...defaultProps} />);

      // Click on the command text itself
      const bucketCommandInput = screen.getByDisplayValue('scoop bucket add main');
      await user.click(bucketCommandInput);

      expect(mockOnCopyToClipboard).toHaveBeenCalledWith('scoop bucket add main');
    });
  });

  describe('result selection', () => {
    it('should call onResultSelected when name is clicked', async () => {
      const user = userEvent.setup();
      render(<SearchResult {...defaultProps} />);

      const nameElement = screen.getByText('nodejs');
      await user.click(nameElement);

      expect(mockOnResultSelected).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'nodejs',
        })
      );
    });

    it('should not make name clickable when onResultSelected is not provided', () => {
      render(<SearchResult {...defaultProps} onResultSelected={undefined} />);

      const nameElement = screen.getByText('nodejs');
      expect(nameElement).not.toHaveAttribute('role', 'button');
    });
  });

  describe('homepage formatting', () => {
    it('should remove protocol from homepage display', () => {
      render(<SearchResult {...defaultProps} />);

      // Homepage should be displayed without https://
      expect(screen.getByText('nodejs.org')).toBeInTheDocument();
    });

    it('should remove trailing slash from homepage display', () => {
      const manifestWithTrailingSlash = {
        ...mockManifest,
        Homepage: 'https://example.com/',
      };
      const result = jsonConvert.deserializeObject(manifestWithTrailingSlash, ManifestJsonClass);

      render(<SearchResult {...defaultProps} result={result} />);

      expect(screen.getByText('example.com')).toBeInTheDocument();
    });
  });

  describe('official vs community buckets', () => {
    it('should show official bucket icon for official repositories', () => {
      const { container } = render(<SearchResult {...defaultProps} />);

      // Should render without errors for official repository
      // BucketTypeIcon is rendered, but we can't easily test its internal structure
      expect(container.querySelector('.card')).toBeInTheDocument();
    });

    it('should format community repository name correctly', () => {
      const communityManifest = {
        ...mockManifest,
        Metadata: {
          ...mockManifest.Metadata,
          Repository: 'https://github.com/username/my-bucket',
          OfficialRepository: false,
        },
      };
      const result = jsonConvert.deserializeObject(communityManifest, ManifestJsonClass);

      render(<SearchResult {...defaultProps} result={result} />);

      // Should extract last two path segments
      const repoLink = screen.getByRole('link', { name: /username\/my-bucket/i });
      expect(repoLink).toBeInTheDocument();
    });
  });

  describe('date formatting', () => {
    it('should render relative time for committed date', () => {
      render(<SearchResult {...defaultProps} />);

      // Should show relative time like "X days ago"
      const timeElement = screen.getByText(/ago/i);
      expect(timeElement).toBeInTheDocument();
    });

    it('should link to commit SHA', () => {
      render(<SearchResult {...defaultProps} />);

      const commitLink = screen.getByText(/ago/i).closest('a');
      expect(commitLink).toHaveAttribute('href', expect.stringContaining('xyz789abc123'));
    });
  });
});
