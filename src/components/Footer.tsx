import React from 'react';

import { Container, Col, Row } from 'react-bootstrap';
import { GoMarkGithub } from 'react-icons/go';

const Footer = (): JSX.Element => {
  return (
    <Container className="footer text-lg-center">
      <hr />
      <Row className="mb-3">
        <Col lg={6} className="mb-2">
          <GoMarkGithub className="footer-icon" /> <a href="https://github.com/ScoopInstaller">Scoop</a> created by{' '}
          <a href="https://github.com/lukesampson">lukesampson</a> and maintained by the{' '}
          <a href="https://github.com/orgs/ScoopInstaller/people">community</a>
        </Col>
        <Col lg={6} className="mb-2">
          <GoMarkGithub className="footer-icon" /> <a href="https://github.com/ScoopSearch">ScoopSearch</a> created by{' '}
          <a href="https://github.com/gpailler">gpailler</a> and maintained by the{' '}
          <a href="https://github.com/orgs/ScoopSearch/people">community</a>
        </Col>
      </Row>
    </Container>
  );
};

export default React.memo(Footer);
