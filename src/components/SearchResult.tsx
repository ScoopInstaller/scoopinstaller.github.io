import React, { useCallback, useState, useRef } from 'react';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Card, Col, Container, Form, InputGroup, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { GoLinkExternal, GoBook, GoPackage, GoClock } from 'react-icons/go';
import { Img } from 'react-image';
import deprecatedSpdxLicenses from 'spdx-license-ids/deprecated.json';
import supportedSpdxLicenses from 'spdx-license-ids/index.json';

import { DELAY_TOOLTIP } from '../constants';
import ManifestJson from '../serialization/ManifestJson';
import Utils from '../utils';
import BucketTypeIcon from './BucketTypeIcon';
import CopyToClipboardButton from './CopyToClipboardButton';

const spdxLicenses = supportedSpdxLicenses.concat(deprecatedSpdxLicenses);

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

type SearchResultProps = {
  result: ManifestJson;
  onCopyToClipbard: (content: string) => void;
};

const SearchResult = (props: SearchResultProps): JSX.Element => {
  const { result, onCopyToClipbard } = props;
  const homepageRef = useRef<HTMLSpanElement>(null);
  const [homepageTooltipHidden, setHomepageTooltipHidden] = useState<boolean>(false);

  const handleCopyToClipboard = useCallback(
    (content: string): void => {
      onCopyToClipbard(content);
    },
    [onCopyToClipbard]
  );

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

  const CopyToClipboardComponent = (copyToClipboardProps: { value: string; opacity?: number }): JSX.Element => {
    const { value, opacity = 1 } = copyToClipboardProps;
    return (
      <InputGroup size="sm" className="scoopCopyGroupCommand">
        <InputGroup.Text className="scoopCopyCommand border-end-0" style={{ opacity }}>
          &gt;
        </InputGroup.Text>
        <Form.Control className="border-start-0" readOnly type="text" style={{ opacity }} value={value} />

        <CopyToClipboardButton variant="outline-secondary" onClick={() => handleCopyToClipboard(value)} />
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

  // Remove scheme + host
  let formattedHighlightedRepository = highlightedRepository?.toString().replace(/^(<mark>|)(?:.*?\/){3}(.+)$/, '$1$2');

  // Remove GitHub organization part for official buckets
  formattedHighlightedRepository = metadata.repositoryOfficial
    ? formattedHighlightedRepository?.replace(/^(<mark>|)(?:[^/]+)\/(.+)$/, '$1$2')
    : formattedHighlightedRepository;

  const versionPrefix = version.length > 0 && /^\d/.test(version) && 'v';

  const bucketAddCommandLine = metadata.repositoryOfficial
    ? `scoop bucket add ${metadata.repository.substring(metadata.repository.lastIndexOf('/') + 1).toLowerCase()}`
    : `scoop bucket add ${Utils.extractPathFromUrl(metadata.repository, '_')} ${metadata.repository}`;

  const appInstallCommandLine = `scoop install ${name}`;

  return (
    <Card key={id} className="mb-2">
      <Card.Header>
        <Row>
          <Col lg={7} className="valign-items">
            {favicon && <Img className="me-2" src={favicon} width={20} height={20} />}
            <span className="fw-bold">{displayInnerHtml(highlightedName)}</span>
            <span className="me-1 ms-1">in</span>
            <a href={metadata.repository}>{displayInnerHtml(formattedHighlightedRepository)}</a>
            <BucketTypeIcon className="ms-1" official={metadata.repositoryOfficial} stars={metadata.stars} />
          </Col>
          <Col lg={5} className="text-lg-end text-truncate">
            <GoClock title="Updated" className="me-1" />
            <OverlayTrigger
              placement="bottom"
              delay={DELAY_TOOLTIP}
              overlay={<Tooltip id="date-tooltip">{dayjs(metadata.committed).format('LLL')}</Tooltip>}
            >
              <span>{dayjs(metadata.committed).fromNow()}</span>
            </OverlayTrigger>
            <span className="ms-1 me-1">|</span>
            <GoPackage title="Version" className="me-1" />
            <a href={`${metadata.repository}/blob/master/${metadata.filePath}`}>
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
                    <OverlayTrigger
                      placement="bottom"
                      delay={DELAY_TOOLTIP}
                      onEntering={handleHomepageOverlayEntering}
                      overlay={
                        <Tooltip hidden={homepageTooltipHidden} id="homepage-tooltip">
                          {homepage}
                        </Tooltip>
                      }
                    >
                      <a href={homepage}>
                        <span>{displayInnerHtml(formattedHomepage)}</span>
                      </a>
                    </OverlayTrigger>
                  </span>
                )}
                {license && (
                  <span>
                    <GoBook title="License" className="me-1" />
                    {(license && spdxLicenses.includes(license) && (
                      <a href={`https://spdx.org/licenses/${license}.html`}>{displayInnerHtml(highlightedLicense)}</a>
                    )) ||
                      displayInnerHtml(highlightedLicense)}
                  </span>
                )}
              </Row>
            </Col>
            <Col lg={6} className="mt-4 mt-lg-0">
              <Row>
                <CopyToClipboardComponent value={bucketAddCommandLine} opacity={0.7} />
              </Row>
              <Row className="mt-2">
                <CopyToClipboardComponent value={appInstallCommandLine} />
              </Row>
            </Col>
          </Row>
        </Container>
      </Card.Body>
    </Card>
  );
};

export default React.memo(SearchResult);
