import React from 'react';

import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NavBar = (): JSX.Element => {
  return (
    <Navbar expand="sm" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            alt=""
            src="https://avatars.githubusercontent.com/u/16618068?s=30"
            width="30"
            height="30"
            className="d-inline-block align-top rounded me-2"
          />
          Scoop
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/apps">
              Apps
            </Nav.Link>
            <Nav.Link as={Link} to="/buckets">
              Buckets
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default React.memo(NavBar);
