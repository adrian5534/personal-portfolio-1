import React, { useState } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NavigationBar() {
  const [expanded, setExpanded] = useState(false);
  const close = () => setExpanded(false);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="Navbar" expanded={expanded}>
      <Navbar.Brand as={Link} to="/" onClick={close}>Adrian Reynolds</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(!expanded)} />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="center-nav justify-content-center">
          <Nav.Link as={Link} to="/#bio" onClick={close}>Bio</Nav.Link>
          <Nav.Link as={Link} to="/#resume" onClick={close}>Resume</Nav.Link>
          <Nav.Link as={Link} to="/#projects" onClick={close}>Projects</Nav.Link>
          <Nav.Link as={Link} to="/#pricing" onClick={close}>Pricing</Nav.Link>
          <Nav.Link as={Link} to="/#contact" onClick={close}>Contact</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavigationBar;