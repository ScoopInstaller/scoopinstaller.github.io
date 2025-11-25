import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { type JSX, useCallback, useRef, useState } from 'react';
import { Card, Col, Container, Form, InputGroup, type InputGroupProps, Row } from 'react-bootstrap';
import { GoBook, GoClock, GoLaw, GoLinkExternal, GoPackage } from 'react-icons/go';
import { Img } from 'react-image';
import deprecatedSpdxLicenses from 'spdx-license-ids/deprecated.json';
import supportedSpdxLicenses from 'spdx-license-ids/index.json';
import type ManifestJson from '../serialization/ManifestJson';
import Utils from '../utils';
import BucketTypeIcon from './BucketTypeIcon';
import CopyToClipboardButton from './CopyToClipboardButton';

const spdxLicenses = supportedSpdxLicenses.concat(deprecatedSpdxLicenses);

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

type SearchResultProps = {
  result: ManifestJson;
  officialRepositories: { [key: string]: string };
  installBucketName: boolean;
  onCopyToClipbard: (content: string) => void;
  onResultSelected?: (result: ManifestJson) => void;
  cardRef?: React.RefObject<HTMLDivElement | null>;
};

const SearchResult = (props: SearchResultProps): JSX.Element => {
  const { result, officialRepositories, installBucketName, onCopyToClipbard, onResultSelected, cardRef } = props;
  const homepageRef = useRef<HTMLSpanElement>(null);
  const [homepageTooltipHidden, setHomepageTooltipHidden] = useState<boolean>(false);

  const handleCopyToClipboard = useCallback(
    (content: string): void => {
      onCopyToClipbard(content);
    },
    [onCopyToClipbard]
  );

  const handleSelected = useCallback((): void => {
    onResultSelected?.call(this, result);
  }, [onResultSelected, result]);

  const displayInnerHtml = (content?: string) => {
    return (
      content && (
        <span
          dangerouslySetInnerHTML={{
            __html: content,
          }}
        />
      )
    );
  };

  const CopyToClipboardComponent = (copyToClipboardProps: { value: string } & InputGroupProps): JSX.Element => {
    const { value, ...copyToClipboardRest } = copyToClipboardProps;
    const copyToClipboardButtonRef = useRef<HTMLButtonElement>(null);

    const handleClickCommand = () => {
      copyToClipboardButtonRef.current?.click();
    };

    return (
      <InputGroup size="sm" className="copy-command-group" {...copyToClipboardRest}>
        <InputGroup.Text className="border-end-0 copy-command-prefix">&gt;</InputGroup.Text>
        <Form.Control
          className="border-start-0 copy-command-text"
          readOnly
          title="Copy to clipboard"
          type="text"
          value={value}
          onClick={handleClickCommand}
        />

        <CopyToClipboardButton
          className="copy-command-button"
          ref={copyToClipboardButtonRef}
          title="Copy to clipboard"
          variant="outline-secondary"
          onClick={() => handleCopyToClipboard(value)}
        />
      </InputGroup>
    );
  };

  const handleHomepageOverlayEntering = () => {
    if (homepageRef.current) {
      setHomepageTooltipHidden(homepageRef.current.offsetWidth >= homepageRef.current.scrollWidth);
    }
  };

  const {
    id,
    name,
    favicon,
    highlightedName,
    highlightedDescription,
    notes,
    highlightedLicense,
    highlightedRepository,
    highlightedVersion,
    metadata,
    homepage,
    version,
    license,
  } = result;

  // Remove scheme and trailing slash
  const formattedHomepage = (homepage ?? '').replace(/^(?:\w+:\/\/)(.+?)\/*$/, '$1');

  // Use known repository name for official repositories and keep only organization+repo for community repositories
  const formattedHighlightedRepository = metadata.repositoryOfficial
    ? highlightedRepository?.toString().replace(metadata.repository, officialRepositories[metadata.repository])
    : highlightedRepository?.toString().replace(/^(<mark>|)(?:.*?\/){3}(.+)$/, '$1$2');

  const versionPrefix = version.length > 0 && /^\d/.test(version) && 'v';

  const bucketName = metadata.repositoryOfficial
    ? officialRepositories[metadata.repository] ||
      metadata.repository.substring(metadata.repository.lastIndexOf('/') + 1).toLowerCase()
    : `${Utils.extractPathFromUrl(metadata.repository, '_')}`;
  const bucketUrl = metadata.repositoryOfficial ? '' : `${metadata.repository}`;
  const bucketCommandLine = `${bucketName} ${bucketUrl}`.trim();

  const bucketCommand = `scoop bucket add ${bucketCommandLine}`;
  const appCommand = `scoop install ${installBucketName ? bucketName + '/' : ''}${name}`;
  const fullCommand = `${bucketCommand}\n${appCommand}`;

  return (
    <Card key={id} className="mb-2" ref={cardRef}>
      <Card.Header>
        <Row>
          <Col lg={7} className="valign-items">
            {favicon && <Img className="me-2" src={favicon} width={20} height={20} />}
            <span className="fw-bold" role={onResultSelected ? 'button' : undefined} onClick={handleSelected}>
              {displayInnerHtml(highlightedName)}
            </span>
            <span className="me-1 ms-1">in</span>
            <a href={metadata.repository}>{displayInnerHtml(formattedHighlightedRepository)}</a>
            <BucketTypeIcon className="ms-1" official={metadata.repositoryOfficial} stars={metadata.stars} />
          </Col>
          <Col lg={5} className="text-lg-end text-truncate">
            <GoClock title="Updated" className="me-1" />
            <a
              href={`${metadata.repository}/commit/${metadata.sha}`}
              title={`Diff (${dayjs(metadata.committed).format('LLL')})`}
            >
              {dayjs(metadata.committed).fromNow()}
            </a>
            <span className="ms-1 me-1">|</span>
            <GoPackage title="Version" className="me-1" />
            <a
              href={`${metadata.repository}/blob/master/${metadata.filePath.replace('#', '%23')}`}
              title="Manifest file"
            >
              {versionPrefix}
              {displayInnerHtml(highlightedVersion)}
            </a>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <Container className="p-0">
          <Row>
            <Col lg={6}>
              <Row>{highlightedDescription && displayInnerHtml(highlightedDescription)}</Row>
              <Row className="mt-2">
                {homepage && (
                  <span className="text-truncate" ref={homepageRef}>
                    <GoLinkExternal title="Homepage" className="me-1" />
                    <a
                      href={homepage}
                      onMouseOver={handleHomepageOverlayEntering}
                      title={homepageTooltipHidden ? '' : homepage}
                    >
                      <span>{displayInnerHtml(formattedHomepage)}</span>
                    </a>
                  </span>
                )}
                {license && (
                  <span>
                    <GoLaw title="License" className="me-1" />
                    {(license && spdxLicenses.includes(license) && (
                      <a href={`https://spdx.org/licenses/${license}.html`}>{displayInnerHtml(highlightedLicense)}</a>
                    )) ||
                      displayInnerHtml(highlightedLicense)}
                  </span>
                )}
                {notes && (
                  <span>
                    <GoBook title="Notes" className="me-1" />
                    {notes}
                  </span>
                )}
              </Row>
            </Col>
            <Col lg={6} className="mt-4 mt-lg-0">
              <Row>
                <Col className="pe-1">
                  <Row>
                    <CopyToClipboardComponent value={`${bucketCommand}`} id="bucket-command" />
                  </Row>
                  <Row className="mt-2">
                    <CopyToClipboardComponent value={`${appCommand}`} id="app-command" />
                  </Row>
                </Col>
                <Col xs="auto" className="copy-command-group ps-1 d-flex">
                  <CopyToClipboardButton
                    className="copy-command-button"
                    title="Copy all to clipboard"
                    variant="outline-secondary"
                    onClick={() => handleCopyToClipboard(`${fullCommand}`)}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </Card.Body>
    </Card>
  );
};

export default React.memo(SearchResult);
