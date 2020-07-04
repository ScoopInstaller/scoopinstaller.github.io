import React, { PureComponent } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { FaGithub } from 'react-icons/fa';

class NavBar extends PureComponent {
  render() {
    return (
      <Navbar expand="sm" bg="dark" variant="dark">
        <Navbar.Brand href="#home">ScoopSearch</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#apps">Apps</Nav.Link>
            <Nav.Link href="#buckets">Buckets</Nav.Link>
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
