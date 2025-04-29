import React from 'react';
import './Header.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';


function Header () {

    return (
        <Navbar expand="lg"  fixed="top" data-bs-theme="dark" style={{
            backgroundColor: '#c24f4f'
        }}>
            <Container className="nav" >
                <Navbar.Brand href="#home" className="custom-navbar-brand">POMODODO</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
                        {/*<Nav.Link as={Link} to="/login">Log In</Nav.Link>*/}
                        <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                            <NavDropdown.Item href="#profile">Profile</NavDropdown.Item>
                            <NavDropdown.Item href="#analytics">
                                Analytics
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>

    )
}

export default Header;