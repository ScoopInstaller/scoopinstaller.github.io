import React, { PureComponent } from 'react';
import { Card, Container, Row, Col, Form, InputGroup } from 'react-bootstrap';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import { Img } from 'react-image';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { GoVerified } from 'react-icons/go';
import { ISearchResultProps } from '../interfaces/ISearchResult.interfaces';
import CopyToClipboardButton from './CopyToClipboardButton';

dayjs.extend(localizedFormat);

class SearchResult extends PureComponent<ISearchResultProps> {
  handleCopyToClipboard = (content: string) => {
    this.props.onCopyToClipbard(content);
  };

  private displayHighlight = (content?: string) => {
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

  render() {
    const {
      id,
      score,
      name,
      favicon,
      highlightedName,
      highlightedDescription,
      highlightedLicense,
      highlightedRepository,
      highlightedAuthorName,
      highlightedVersion,
      metadata,
      homepage,
    } = this.props.result;

    return (
      <Card key={id} className="mb-2">
        <Card.Header>
          {favicon && (
            <Img className="mr-2" src={favicon} width={20} height={20} />
          )}
          <strong>{this.displayHighlight(highlightedName)}</strong>
          {' - '}
          {this.displayHighlight(highlightedVersion)}
          {metadata.repositoryOfficial && (
            <GoVerified className="ml-2 faIconVerticalAlign" color="#2E86C1" />
          )}
          {process.env.NODE_ENV === 'development' && ` - @score: ${score}`}
        </Card.Header>
        <Card.Body>
          <Container>
            {highlightedDescription && (
              <Row className="mb-3">
                <Col>{this.displayHighlight(highlightedDescription)}</Col>
              </Row>
            )}
            <small>
              <Row>
                <Col lg={6}>
                  Updated: {dayjs(metadata.committed).format('LLL')}
                </Col>
                <Col lg={6}>
                  License: {this.displayHighlight(highlightedLicense)}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col lg={6}>
                  Bucket:{' '}
                  <a href={metadata.repository}>
                    {this.displayHighlight(highlightedRepository)}
                  </a>
                  {metadata.repositoryOfficial && (
                    <GoVerified className="ml-1" color="#2E86C1" />
                  )}
                  {!metadata.repositoryOfficial && (
                    <CopyToClipboardButton
                      className="ml-1 ms copyToClipbardMiniButton"
                      tooltipPlacement="right"
                      onClick={() =>
                        this.handleCopyToClipboard(
                          `scoop bucket add ${metadata.repository
                            .split('/')
                            .pop()} ${metadata.repository}`
                        )
                      }
                    />
                  )}
                </Col>
                <Col lg={6}>
                  Commiter: {this.displayHighlight(highlightedAuthorName)}
                </Col>
              </Row>
              <Row className="text-center" noGutters>
                <Col lg xs={4} className="mt-1 mb-2">
                  <a href={homepage}>
                    Homepage <FaExternalLinkAlt />
                  </a>
                </Col>
                <Col lg xs={4} className="mt-1 mb-2">
                  <a
                    href={`${metadata.repository}/blob/master/${metadata.filePath}`}
                  >
                    Manifest <FaExternalLinkAlt />
                  </a>
                </Col>
                <Col lg xs={4} className="mt-1 mb-2">
                  <a href={`${metadata.repository}/commit/${metadata.sha}`}>
                    Commit <FaExternalLinkAlt />
                  </a>
                </Col>
                <Col lg={5}>
                  <InputGroup size="sm">
                    <InputGroup.Prepend>
                      <InputGroup.Text className="prompt border-right-0">
                        &gt;
                      </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      className="border-left-0"
                      readOnly
                      type="text"
                      value={`scoop install ${name}`}
                    />

                    <InputGroup.Append>
                      <CopyToClipboardButton
                        tooltipPlacement="left"
                        onClick={() =>
                          this.handleCopyToClipboard(`scoop install ${name}`)
                        }
                      />
                    </InputGroup.Append>
                  </InputGroup>
                </Col>
              </Row>
            </small>
          </Container>
        </Card.Body>
      </Card>
    );
  }
}

export default SearchResult;
