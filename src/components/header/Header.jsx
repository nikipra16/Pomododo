import React, { useState, useEffect } from 'react';
import './Header.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import { auth } from '/src/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';


function Header () {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    return (
        <Navbar expand="lg" fixed="top" data-bs-theme="dark" style={{
            backgroundColor: '#c24f4f'
        }}>
            <Container fluid className="nav-container">
                <Navbar.Brand as={Link} to="/" className="custom-navbar-brand">POMODODO</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto align-items-lg-center header-nav-actions">
                        {!user ? (
                            <>
                                <Nav.Link as={Link} to="/login">Log in</Nav.Link>
                                <Nav.Link as={Link} to="/signup">Sign up</Nav.Link>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/profile" className="header-profile-link">
                                    Profile
                                </Nav.Link>
                                <Nav.Link as={Link} to="/analytics" className="header-analytics-link">
                                    Analytics
                                </Nav.Link>
                                <NavDropdown
                                    title="Settings"
                                    id="header-settings-nav-dropdown"
                                    align="end"
                                    menuVariant="light"
                                    className="header-settings-dropdown"
                                >
                                    <NavDropdown.Item as={Link} to="/settings/personal">
                                        Personal
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/settings/preferences">
                                        Preferences
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/settings/account">
                                        Account
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/settings/accessibility">
                                        Accessibility
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>

    );
}

export default Header;
