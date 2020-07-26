import React, { PureComponent } from 'react';

import { Navbar, Nav } from 'react-bootstrap';
import { FaGithub } from 'react-icons/fa';
import { Link } from 'react-router-dom';

class NavBar extends PureComponent {
  render(): JSX.Element {
    return (
      <Navbar expand="sm" bg="dark" variant="dark">
        <Navbar.Brand as={Link} to="/">
          ScoopSearch
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link as={Link} to="/apps">
              Apps
            </Nav.Link>
            <Nav.Link as={Link} to="/buckets">
              Buckets
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link href="https://github.com/ScoopSearch">
              <FaGithub size="1.2em" />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default NavBar;
