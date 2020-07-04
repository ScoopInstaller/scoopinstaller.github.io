import React, { Component } from 'react';
import {
  Card,
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Button,
} from 'react-bootstrap';
import moment from 'moment';
import { Img } from 'react-image';
import { FaExternalLinkAlt, FaClipboard, FaCheck } from 'react-icons/fa';
import { GoVerified } from 'react-icons/go';
import {
  ISearchResultProps,
  ISearchResultState,
} from '../interfaces/ISearchResult.interfaces';

const CLIPBOARD_COPY_NOTIFICATION: number = 500;

class SearchResult extends Component<ISearchResultProps, ISearchResultState> {
  commandInput: React.RefObject<HTMLInputElement>;

  constructor(props: ISearchResultProps) {
    super(props);

    this.state = { copied: false };

    this.commandInput = React.createRef<HTMLInputElement>();
  }

  componentDidUpdate(
    prevProps: ISearchResultProps,
    prevState: ISearchResultState
  ) {
    if (this.state.copied && this.state.copied !== prevState.copied) {
      setTimeout(() => {
        this.setState({ copied: false });
      }, CLIPBOARD_COPY_NOTIFICATION);
    }
  }

  handleCopyClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const input = this.commandInput.current!;
    input.select();
    document.execCommand('copy');
    input.selectionEnd = input.selectionStart;
    input.blur();

    this.setState({ copied: true });
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
                  Updated: {moment(metadata.committed).calendar()}
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
                      ref={this.commandInput}
                      className="border-left-0"
                      readOnly
                      type="text"
                      value={`scoop install ${name}`}
                    />
                    {document.queryCommandSupported('copy') && (
                      <InputGroup.Append>
                        <Button
                          variant="secondary"
                          onClick={this.handleCopyClick}
                          disabled={this.state.copied}
                        >
                          {this.state.copied ? (
                            <FaCheck className="faIconVerticalAlign" />
                          ) : (
                            <FaClipboard className="faIconVerticalAlign" />
                          )}
                        </Button>
                      </InputGroup.Append>
                    )}
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
