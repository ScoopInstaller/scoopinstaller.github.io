import React from 'react';

import { Container, Col, Row } from 'react-bootstrap';
import { FaRegHandshake } from 'react-icons/fa';
import { GoMarkGithub } from 'react-icons/go';

const Footer = (): JSX.Element => {
  return (
    <Container className="footer text-lg-center">
      <hr />
      <Row className="mb-3">
        <Col md={4} className="mb-2">
          <GoMarkGithub className="footer-icon" /> <a href="https://github.com/ScoopInstaller">Scoop</a> created by{' '}
          <a href="https://github.com/lukesampson">lukesampson</a>
        </Col>
        <Col md={4} className="mb-2">
          <GoMarkGithub className="footer-icon" />{' '}
          <a href="https://github.com/ScoopInstaller/scoopinstaller.github.io">Website</a> created by{' '}
          <a href="https://github.com/gpailler">gpailler</a>
        </Col>
        <Col md={4} className="mb-2">
          <FaRegHandshake className="footer-icon" /> Maintained by the{' '}
          <a href="https://github.com/orgs/ScoopInstaller/people">community</a>
        </Col>
      </Row>
    </Container>
  );
};

export default React.memo(Footer);
