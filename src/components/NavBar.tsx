import React, { useContext } from 'react';

import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { BsSun, BsMoon, BsCircleHalf } from 'react-icons/bs';
import { Link } from 'react-router-dom';

import { ColorSchemeContext } from '../colorscheme/ColorSchemeContext';
import { ColorSchemeType } from '../colorscheme/ColorSchemeType';

const NavBar = (): JSX.Element => {
  const { preferedColorScheme, browserColorScheme, toggleColorScheme } = useContext(ColorSchemeContext);

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
          <Button onClick={toggleColorScheme} size="sm" variant="secondary">
            {preferedColorScheme == ColorSchemeType.Auto &&
              (browserColorScheme == ColorSchemeType.Light ? (
                <BsCircleHalf title="Auto mode. Click to switch to dark mode" />
              ) : (
                <BsCircleHalf title="Auto mode. Click to switch to light mode" />
              ))}
            {preferedColorScheme == ColorSchemeType.Light &&
              (browserColorScheme == ColorSchemeType.Light ? (
                <BsSun title="Light mode. Click to switch to OS/browser preferred mode" />
              ) : (
                <BsSun title="Light mode. Click to switch to dark mode" />
              ))}
            {preferedColorScheme == ColorSchemeType.Dark &&
              (browserColorScheme == ColorSchemeType.Light ? (
                <BsMoon title="Dark mode. Click to switch to light mode" />
              ) : (
                <BsMoon title="Dark mode. Click to switch to OS/browser preferred mode" />
              ))}
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default React.memo(NavBar);
